/* eslint-disable react/forbid-prop-types */
/* eslint-disable no-nested-ternary */
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Boundary } from '@/components/common';
import { CHECKOUT_STEP_1, CHECKOUT_STEP_3 } from '@/constants/routes';
import { Form, Formik } from 'formik';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import PropType from 'prop-types';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { setShippingDetails } from '@/redux/actions/checkoutActions';
import * as Yup from 'yup';
import { StepTracker } from '../components';
import withCheckout from '../hoc/withCheckout';
import ShippingForm from './ShippingForm';
import ShippingTotal from './ShippingTotal';

const FormSchema = Yup.object().shape({
  fullname: Yup.string()
    .required('請輸入學員姓名。')
    .min(2, '姓名至少需 2 個字元。')
    .max(60, '姓名不可超過 60 個字元。'),
  companyName: Yup.string()
    .required('請輸入公司名稱。'),
  email: Yup.string()
    .email('Email 格式不正確。')
    .required('請輸入電子郵件。'),
  mobile: Yup.string()
    .required('請輸入聯絡電話。')
    .matches(/^09\d{8}$/, '請輸入正確的台灣手機號碼格式（例：0912345678）'),
  invoiceInfo: Yup.string()
    .required('請輸入發票抬頭或統編。'),
  address: Yup.string()
    .required('請輸入聯絡地址。'),
  englishName: Yup.string()
    .required('請輸入英文姓名。')
    .matches(/^[A-Z\s]+$/, '請使用大寫英文字母'),
  dietPreference: Yup.string()
    .required('請選擇葷/素食。')
    .oneOf(['葷', '素(蛋奶素)', '素(全素)'], '請選擇有效的選項'),
  couponType: Yup.string()
    .required('請選擇優惠券選項。')
    .oneOf(['無', '序號'], '請選擇有效的選項'),
  couponCode: Yup.string()
    .when('couponType', {
      is: '序號',
      then: Yup.string().required('請輸入優惠券序號。')
    }),
  infoSource: Yup.string()
    .required('請選擇資訊來源。'),
  infoSourceOther: Yup.string()
    .when('infoSource', {
      is: '其他',
      then: Yup.string().required('請說明資訊來源。')
    }),
  isInternational: Yup.boolean(),
  isDone: Yup.boolean()
});

const ShippingDetails = ({ profile, shipping, subtotal }) => {
  useDocumentTitle('配送資訊 | Ares 亞瑞仕知識學苑');
  useScrollTop();
  const dispatch = useDispatch();
  const history = useHistory();

  // 轉換舊格式的 mobile 資料（物件 -> 字串）
  const convertMobile = (mobile) => {
    if (!mobile) return '';
    if (typeof mobile === 'string') return mobile;
    // 舊格式：{ value: '0912345678', dialCode: '886', ... }
    if (typeof mobile === 'object' && mobile.value) {
      return mobile.value;
    }
    return '';
  };

  const initFormikValues = {
    fullname: shipping.fullname || profile.fullname || '',
    companyName: shipping.companyName || '',
    email: shipping.email || profile.email || '',
    mobile: convertMobile(shipping.mobile || profile.mobile),
    invoiceInfo: shipping.invoiceInfo || '',
    address: shipping.address || profile.address || '',
    englishName: shipping.englishName || '',
    dietPreference: shipping.dietPreference || '葷',
    couponType: shipping.couponType || '無',
    couponCode: shipping.couponCode || '',
    infoSource: shipping.infoSource || '',
    infoSourceOther: shipping.infoSourceOther || '',
    isInternational: shipping.isInternational || false,
    isDone: shipping.isDone || false,
    appliedCoupon: shipping.appliedCoupon || null
  };

  const onSubmitForm = (form) => {
    dispatch(setShippingDetails({
      fullname: form.fullname,
      companyName: form.companyName,
      email: form.email,
      mobile: form.mobile,
      invoiceInfo: form.invoiceInfo,
      address: form.address,
      englishName: form.englishName,
      dietPreference: form.dietPreference,
      couponType: form.couponType,
      couponCode: form.couponCode,
      infoSource: form.infoSource,
      infoSourceOther: form.infoSourceOther,
      isInternational: form.isInternational,
      appliedCoupon: form.appliedCoupon,
      isDone: true
    }));
    history.push(CHECKOUT_STEP_3);
  };

  return (
    <Boundary>
      <div className="checkout">
        <StepTracker current={2} />
        <div className="checkout-step-2">
          <h3 className="text-center">顧客資訊</h3>
          <Formik
            initialValues={initFormikValues}
            validateOnChange
            validationSchema={FormSchema}
            onSubmit={onSubmitForm}
          >
            {() => (
              <Form>
                <ShippingForm />
                <br />
                {/*  ---- TOTAL --------- */}
                <ShippingTotal subtotal={subtotal} />
                <br />
                {/*  ----- NEXT/PREV BUTTONS --------- */}
                <div className="checkout-shipping-action">
                  <button
                    className="button button-muted"
                    onClick={() => history.push(CHECKOUT_STEP_1)}
                    type="button"
                  >
                    <ArrowLeftOutlined />
                    &nbsp;
                    上一步
                  </button>
                  <button
                    className="button button-icon"
                    type="submit"
                  >
                    下一步
                    &nbsp;
                    <ArrowRightOutlined />
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </Boundary>
  );
};

ShippingDetails.propTypes = {
  subtotal: PropType.number.isRequired,
  profile: PropType.shape({
    fullname: PropType.string,
    email: PropType.string,
    address: PropType.string,
    mobile: PropType.object
  }).isRequired,
  shipping: PropType.shape({
    fullname: PropType.string,
    email: PropType.string,
    address: PropType.string,
    mobile: PropType.object,
    isInternational: PropType.bool,
    isDone: PropType.bool
  }).isRequired
};

export default withCheckout(ShippingDetails);
