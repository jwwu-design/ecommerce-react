import { CHECKOUT_STEP_2 } from '@/constants/routes';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import { displayActionMessage } from '@/helpers/utils';
import PropType from 'prop-types';
import React, { useState } from 'react';
import { Redirect, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearBasket } from '@/redux/actions/basketActions';
import firebase from '@/services/firebase';
import { StepTracker } from '../components';
import withCheckout from '../hoc/withCheckout';
import RegistrationFormUpload from './RegistrationFormUpload';
import Total from './Total';

const RegistrationForm = ({ shipping, subtotal, basket, profile }) => {
  useDocumentTitle('報名表單 | Ares');
  useScrollTop();
  const history = useHistory();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);

  // 取得當前使用者資訊
  const { uid, fullname } = useSelector((state) => ({
    uid: state.auth.id,
    fullname: state.profile.fullname || 'User'
  }));

  // 處理表單上傳完成
  const handleUploadComplete = (uploadedFormData) => {
    setFormData(uploadedFormData);
  };

  // 建立訂單並繼續
  const handleContinue = async () => {
    if (!formData) return;

    setCreatingOrder(true);
    try {
      // 建立訂單
      const orderData = {
        userId: uid,
        userName: fullname,
        userEmail: profile.email,
        items: basket,
        subtotal: subtotal - (shipping.isInternational ? 50 : 0),
        shippingFee: shipping.isInternational ? 50 : 0,
        total: subtotal,
        shipping: {
          fullname: shipping.fullname,
          email: shipping.email,
          address: shipping.address,
          mobile: shipping.mobile,
          isInternational: shipping.isInternational
        },
        registrationForm: formData
      };

      const { orderId } = await firebase.createOrder(orderData);

      displayActionMessage('訂單建立成功！', 'success');

      // 先導向確認頁面
      history.replace(`/checkout/confirmation/${orderId}`);

      // 延遲清空購物車，避免影響導航
      setTimeout(async () => {
        try {
          // 清空購物車 (Redux)
          dispatch(clearBasket());

          // 清空 Firebase 購物車
          await firebase.updateCartInFirebase(uid, []);
        } catch (error) {
          console.error('Failed to clear basket:', error);
        }
      }, 100);

    } catch (error) {
      displayActionMessage(error.message || '建立訂單失敗', 'error');
      setCreatingOrder(false);
    }
  };

  if (!shipping || !shipping.isDone) {
    return <Redirect to={CHECKOUT_STEP_2} />;
  }

  return (
    <div className="checkout">
      <StepTracker current={3} />
      <div className="checkout-step-3">
        <div className="checkout-form">
          <h2>上傳報名表單</h2>
          <p className="text-subtle">
            請下載報名表單範本,填寫完成後上傳。我們會在收到您的表單後盡快與您聯繫。
          </p>
          <br />

          <RegistrationFormUpload
            userId={uid}
            userName={fullname}
            onUploadComplete={handleUploadComplete}
          />
        </div>

        <Total
          isInternational={shipping.isInternational}
          subtotal={subtotal}
          onContinue={formData && !creatingOrder ? handleContinue : null}
          continueButtonText={creatingOrder ? '建立訂單中...' : '確認訂單'}
        />
      </div>
    </div>
  );
};

RegistrationForm.propTypes = {
  shipping: PropType.shape({
    isDone: PropType.bool,
    isInternational: PropType.bool,
    fullname: PropType.string,
    email: PropType.string,
    address: PropType.string,
    mobile: PropType.string
  }).isRequired,
  subtotal: PropType.number.isRequired,
  basket: PropType.arrayOf(PropType.object).isRequired,
  profile: PropType.shape({
    email: PropType.string,
    fullname: PropType.string
  }).isRequired
};

export default withCheckout(RegistrationForm);
