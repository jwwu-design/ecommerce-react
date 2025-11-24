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
    .required('請輸入姓名。')
    .min(2, '姓名至少需 2 個字元。')
    .max(60, '姓名不可超過 60 個字元。'),
  email: Yup.string()
    .email('Email 格式不正確。')
    .required('請輸入 Email。'),
  address: Yup.string()
    .required('請輸入收件地址。'),
  mobile: Yup.object()
    .shape({
      country: Yup.string(),
      countryCode: Yup.string(),
      dialCode: Yup.string().required('請輸入手機號碼。'),
      value: Yup.string().required('請輸入手機號碼。')
    })
    .required('請輸入手機號碼。'),
  isInternational: Yup.boolean(),
  isDone: Yup.boolean()
});

const ShippingDetails = ({ profile, shipping, subtotal }) => {
  useDocumentTitle('結帳步驟 2 | Ares');
  useScrollTop();
  const dispatch = useDispatch();
  const history = useHistory();

  const initFormikValues = {
    fullname: shipping.fullname || profile.fullname || '',
    email: shipping.email || profile.email || '',
    address: shipping.address || profile.address || '',
    mobile: shipping.mobile || profile.mobile || {},
    isInternational: shipping.isInternational || false,
    isDone: shipping.isDone || false
  };

  const onSubmitForm = (form) => {
    dispatch(setShippingDetails({
      fullname: form.fullname,
      email: form.email,
      address: form.address,
      mobile: form.mobile,
      isInternational: form.isInternational,
      isDone: true
    }));
    history.push(CHECKOUT_STEP_3);
  };

  return (
    <Boundary>
      <div className="checkout">
        <StepTracker current={2} />
        <div className="checkout-step-2">
          <h3 className="text-center">運送資訊</h3>
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
