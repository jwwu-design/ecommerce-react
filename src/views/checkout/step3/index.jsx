import { CHECKOUT_STEP_2, SIGNIN } from '@/constants/routes';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import { displayActionMessage } from '@/helpers/utils';
import React, { useState, useEffect } from 'react';
import { Redirect, useHistory, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearBasket } from '@/redux/actions/basketActions';
import { calculateTotal } from '@/helpers/utils';
import firebase from '@/services/firebase';
import { StepTracker } from '../components';
import RegistrationFormUpload from './RegistrationFormUpload';
import Total from './Total';

const RegistrationForm = () => {
  useDocumentTitle('報名表單 | Ares');
  useScrollTop();
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 從 Redux 取得資料
  const isAuth = useSelector(state => !!state.auth.id && !!state.auth.role);
  const basket = useSelector(state => state.basket);
  const shipping = useSelector(state => state.checkout.shipping);
  const profile = useSelector(state => state.profile);

  // 從 URL 取得參數
  const params = new URLSearchParams(location.search);
  const orderId = params.get('orderId');
  const isReupload = params.get('reupload') === 'true';

  // 計算總額
  const shippingFee = shipping?.isInternational ? 50 : 0;
  const subtotal = calculateTotal(basket.map((product) => product.price * product.quantity));
  const total = subtotal + shippingFee;

  // 取得當前使用者資訊
  const { uid, fullname } = useSelector((state) => ({
    uid: state.auth.id,
    fullname: state.profile.fullname || 'User'
  }));

  // 如果是重新上傳模式，載入訂單資料
  useEffect(() => {
    if (isReupload && orderId) {
      loadOrderData(orderId);
    }
  }, [isReupload, orderId]);

  const loadOrderData = async (orderId) => {
    try {
      setLoading(true);
      const order = await firebase.getOrderById(orderId);
      setOrderData(order);
      console.log('✅ Loaded order for reupload:', order);
    } catch (error) {
      console.error('❌ Failed to load order:', error);
      displayActionMessage('載入訂單失敗', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 處理表單上傳完成
  const handleUploadComplete = (uploadedFormData) => {
    setFormData(uploadedFormData);
  };

  // 建立訂單並繼續（一般流程）
  const handleContinue = async () => {
    if (!formData) return;

    setCreatingOrder(true);
    try {
      // 建立訂單
      const newOrderData = {
        userId: uid,
        userName: fullname,
        userEmail: profile.email,
        items: basket,
        subtotal: subtotal,
        shippingFee: shippingFee,
        total: total,
        shipping: {
          fullname: shipping.fullname,
          email: shipping.email,
          address: shipping.address,
          mobile: shipping.mobile,
          isInternational: shipping.isInternational
        },
        registrationForm: formData
      };

      const result = await firebase.createOrder(newOrderData);
      console.log('✅ Order created:', result.orderId);

      // 清空購物籃
      dispatch(clearBasket());

      // 導向訂單確認頁面
      history.push(`/checkout/confirmation/${result.orderId}`);
      displayActionMessage('訂單已建立！', 'success');
    } catch (error) {
      console.error('❌ Failed to create order:', error);
      displayActionMessage('建立訂單失敗，請稍後再試', 'error');
    } finally {
      setCreatingOrder(false);
    }
  };

  // 重新上傳表單（重新上傳流程）
  const handleReupload = async () => {
    if (!formData || !orderId) return;

    setCreatingOrder(true);
    try {
      // 更新訂單的報名表單
      await firebase.updateOrderRegistrationForm(orderId, formData);

      // 重設審核狀態為 pending
      await firebase.updateOrderStatus(orderId, 'pending', '');

      console.log('✅ Registration form reuploaded for order:', orderId);

      // 導向訂單確認頁面
      history.push(`/checkout/confirmation/${orderId}`);
      displayActionMessage('報名表單已重新上傳，等待審核', 'success');
    } catch (error) {
      console.error('❌ Failed to reupload form:', error);
      displayActionMessage('重新上傳失敗，請稍後再試', 'error');
    } finally {
      setCreatingOrder(false);
    }
  };

  // 認證檢查
  if (!isAuth) {
    return <Redirect to={SIGNIN} />;
  }

  // 重新上傳模式
  if (isReupload && orderId) {
    if (loading) {
      return (
        <div className="checkout">
          <StepTracker current={3} />
          <div className="loader" style={{ minHeight: '400px' }}>
            <h3>載入中...</h3>
          </div>
        </div>
      );
    }

    return (
      <div className="checkout">
        <StepTracker current={3} />
        <div className="checkout-step-3">
          <h2>重新上傳報名表單</h2>
          <p className="text-subtle">訂單編號：{orderId}</p>

          <RegistrationFormUpload
            userId={uid}
            userEmail={profile.email}
            orderId={orderId}
            onUploadComplete={handleUploadComplete}
          />

          <Total
            isInternational={false}
            subtotal={orderData?.totalAmount || 0}
          />

          <div className="checkout-shipping-action">
            <button
              className="button"
              disabled={!formData || creatingOrder}
              onClick={handleReupload}
              type="button"
            >
              {creatingOrder ? '處理中...' : '提交重新上傳'}
            </button>
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
    return <Redirect to={CHECKOUT_STEP_2} />;
  }

  // 一般流程
  return (
    <div className="checkout">
      <StepTracker current={3} />
      <div className="checkout-step-3">
        <RegistrationFormUpload
          userId={uid}
          userEmail={profile.email}
          onUploadComplete={handleUploadComplete}
        />

        <Total
          isInternational={shipping.isInternational}
          subtotal={Number(total)}
        />

        <div className="checkout-shipping-action">
          <button
            className="button"
            disabled={!formData || creatingOrder}
            onClick={handleContinue}
            type="button"
          >
            {creatingOrder ? '建立訂單中...' : '繼續'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
