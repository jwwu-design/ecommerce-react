import { CHECKOUT_STEP_1 } from '@/constants/routes';
import { Form, Formik } from 'formik';
import { displayActionMessage } from '@/helpers/utils';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import PropType from 'prop-types';
import React from 'react';
import { Redirect } from 'react-router-dom';
import * as Yup from 'yup';
import { StepTracker } from '../components';
import withCheckout from '../hoc/withCheckout';
import CreditPayment from './CreditPayment';
import PayPalPayment from './PayPalPayment';
import Total from './Total';

const FormSchema = Yup.object().shape({
  name: Yup.string()
    .min(4, '姓名至少需 4 個字元')
    .required('請輸入姓名'),
  cardnumber: Yup.string()
    .min(13, '卡號長度需 13-19 位數字')
    .max(19, '卡號長度需 13-19 位數字')
    .required('請輸入卡號'),
  expiry: Yup.date()
    .required('請輸入信用卡有效期限'),
  ccv: Yup.string()
    .min(3, 'CCV 長度需為 3-4 位數字')
    .max(4, 'CCV 長度需為 3-4 位數字')
    .required('請輸入 CCV'),
  type: Yup.string().required('請選擇付款方式')
});

const Payment = ({ shipping, payment, subtotal }) => {
  useDocumentTitle('結帳最後一步 | Ares');
  useScrollTop();

  const initFormikValues = {
    name: payment.name || '',
    cardnumber: payment.cardnumber || '',
    expiry: payment.expiry || '',
    ccv: payment.ccv || '',
    type: payment.type || 'paypal'
  };

  const onConfirm = () => {
    displayActionMessage('功能尚未開放 :)', 'info');
  };

  if (!shipping || !shipping.isDone) {
    return <Redirect to={CHECKOUT_STEP_1} />;
  }

  return (
    <div className="checkout">
      <StepTracker current={3} />
      <Formik
        initialValues={initFormikValues}
        validateOnChange
        validationSchema={FormSchema}
        validate={(form) => {
          if (form.type === 'paypal') {
            displayActionMessage('功能尚未開放 :)', 'info');
          }
        }}
        onSubmit={onConfirm}
      >
        {() => (
          <Form className="checkout-step-3">
            <CreditPayment />
            <PayPalPayment />
            <Total
              isInternational={shipping.isInternational}
              subtotal={subtotal}
            />
          </Form>
        )}
      </Formik>
    </div>
  );
};

Payment.propTypes = {
  shipping: PropType.shape({
    isDone: PropType.bool,
    isInternational: PropType.bool
  }).isRequired,
  payment: PropType.shape({
    name: PropType.string,
    cardnumber: PropType.string,
    expiry: PropType.string,
    ccv: PropType.string,
    type: PropType.string
  }).isRequired,
  subtotal: PropType.number.isRequired
};

export default withCheckout(Payment);
