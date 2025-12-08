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

      if (orderData) {
        // 使用現有訂單付款
        console.log('💳 Processing payment for order:', orderData.orderId);
        displayActionMessage('正在導向綠界支付頁面...', 'info');

        // TODO: 實作綠界金流 API 呼叫
        // 這裡應該呼叫後端 API 來產生綠界支付表單
        setTimeout(() => {
          displayActionMessage('綠界支付功能開發中...', 'info');
          setLoading(false);
        }, 1500);

      } else {
        displayActionMessage('請先完成訂單建立', 'error');
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      displayActionMessage('付款處理失敗', 'error');
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
          <ECPayPayment />

          <Total
            isInternational={false}
            subtotal={orderData?.totalAmount || 0}
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
        <ECPayPayment />

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
