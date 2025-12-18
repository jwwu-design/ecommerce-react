import { CHECKOUT_STEP_1, SIGNIN } from '@/constants/routes';
import { displayActionMessage } from '@/helpers/utils';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import React, { useEffect, useState } from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { StepTracker } from '../components';
import ECPayPayment from './ECPayPayment';
import Total from './Total';
import firebase from '@/services/firebase';

const Payment = () => {
  useDocumentTitle('付款 | Ares');
  useScrollTop();

  const location = useLocation();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 從 Redux 取得認證狀態
  const isAuth = useSelector(state => !!state.auth.id && !!state.auth.role);
  const shipping = useSelector(state => state.checkout.shipping);
  const basket = useSelector(state => state.basket);

  // 從 URL 取得 orderId（如果有）
  const params = new URLSearchParams(location.search);
  const orderId = params.get('orderId');

  useEffect(() => {
    if (orderId) {
      // 載入訂單資料
      loadOrderData(orderId);

      // 檢查是否有付款結果參數
      const paymentStatus = params.get('payment');
      if (paymentStatus === 'success') {
        displayActionMessage('付款成功！', 'success');
      } else if (paymentStatus === 'failed') {
        displayActionMessage('付款失敗，請重試', 'error');
      }
    }
  }, [orderId]);

  const loadOrderData = async (orderId) => {
    try {
      setLoading(true);
      const order = await firebase.getOrderById(orderId);
      setOrderData(order);
      console.log('✅ Loaded order for payment:', order);
    } catch (error) {
      console.error('❌ Failed to load order:', error);
      displayActionMessage('載入訂單失敗', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);

      if (!orderData) {
        displayActionMessage('訂單資料不存在', 'error');
        setLoading(false);
        return;
      }

      console.log('💳 Processing payment for order:', orderData.orderId);
      displayActionMessage('正在導向綠界支付頁面...', 'info');

      // 初始化 Firebase Functions
      const functions = firebase.functions();

      // 呼叫 Cloud Function 產生綠界支付表單
      const createECPayOrder = functions.httpsCallable('createECPayOrder');
      const result = await createECPayOrder({
        orderId: orderData.orderId,
        totalAmount: orderData.totalAmount,
        itemName: orderData.items && orderData.items.length > 0
          ? orderData.items[0].name
          : '課程報名',
        customerEmail: orderData.customerInfo?.email || orderData.userEmail,
        clientBackURL: window.location.origin
      });

      console.log('✅ ECPay form generated');

      // 將回傳的 HTML form 插入頁面並自動提交
      const formContainer = document.createElement('div');
      formContainer.innerHTML = result.data.formHtml;
      formContainer.style.display = 'none';
      document.body.appendChild(formContainer);

      // 自動提交表單導向綠界
      const form = formContainer.querySelector('form');
      if (form) {
        console.log('🚀 Submitting to ECPay...');
        form.submit();
      } else {
        throw new Error('Failed to create payment form');
      }

    } catch (error) {
      console.error('❌ Payment error:', error);
      displayActionMessage(error.message || '付款處理失敗', 'error');
      setLoading(false);
    }
  };

  // 認證檢查
  if (!isAuth) {
    return <Redirect to={SIGNIN} />;
  }

  // 如果有 orderId，允許直接訪問（不檢查購物籃和 shipping）
  if (orderId) {
    if (loading && !orderData) {
      return (
        <div className="checkout">
          <StepTracker current={4} />
          <div className="loader" style={{ minHeight: '400px' }}>
            <h3>載入中...</h3>
          </div>
        </div>
      );
    }

    return (
      <div className="checkout">
        <StepTracker current={4} />
        <div className="checkout-step-4">
          <ECPayPayment orderData={orderData} />

          <div className="payment-actions">
            <button
              type="button"
              className="button button-large"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? '處理中...' : '確認付款'}
            </button>

            <p className="payment-secure-notice">
              🔒 您的付款資訊將透過 SSL 加密傳輸
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 一般購物流程檢查
  if (basket.length === 0) {
    return <Redirect to="/" />;
  }

  if (!shipping || !shipping.isDone) {
    return <Redirect to={CHECKOUT_STEP_1} />;
  }

  return (
    <div className="checkout">
      <StepTracker current={4} />
      <div className="checkout-step-4">
        <ECPayPayment orderData={null} />

        <Total
          isInternational={shipping.isInternational}
          subtotal={0}
        />

        <div className="payment-actions">
          <button
            type="button"
            className="button button-large"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? '處理中...' : '確認付款'}
          </button>

          <p className="payment-secure-notice">
            🔒 您的付款資訊將透過 SSL 加密傳輸
          </p>
        </div>
      </div>
    </div>
  );
};

export default Payment;
