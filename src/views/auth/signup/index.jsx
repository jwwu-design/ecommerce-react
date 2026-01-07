import { ArrowRightOutlined, LoadingOutlined } from '@ant-design/icons';
import { CustomInput } from '@/components/formik';
import { SIGNIN, TERMS, PRIVACY_POLICY } from '@/constants/routes';
import { Field, Form, Formik } from 'formik';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import PropType from 'prop-types';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { signUp } from '@/redux/actions/authActions';
import { setAuthenticating, setAuthStatus } from '@/redux/actions/miscActions';
import * as Yup from 'yup';

const SignUpSchema = Yup.object().shape({
  email: Yup.string()
    .email('電子郵件格式不正確。')
    .required('請輸入電子郵件。'),
  password: Yup.string()
    .required('請輸入密碼。')
    .min(8, '密碼長度至少需 8 個字元。')
    .matches(/[A-Z\W]/g, '密碼需至少包含 1 個大寫字母或特殊字元。'),
  fullname: Yup.string()
    .required('請輸入全名。')
    .min(2, '姓名至少需 2 個字元。'),
  agreeTerms: Yup.boolean()
    .oneOf([true], '請閱讀並同意會員條款。'),
  agreePrivacy: Yup.boolean()
    .oneOf([true], '請閱讀並同意隱私權政策。')
});

const SignUp = ({ history }) => {
  const { isAuthenticating, authStatus } = useSelector((state) => ({
    isAuthenticating: state.app.isAuthenticating,
    authStatus: state.app.authStatus
  }));
  const dispatch = useDispatch();

  useScrollTop();
  useDocumentTitle('註冊 | Ares 亞瑞仕知識學苑');

  useEffect(() => () => {
    dispatch(setAuthStatus(null));
    dispatch(setAuthenticating(false));
  }, []);

  const onClickSignIn = () => history.push(SIGNIN);

  const onFormSubmit = (form) => {
    dispatch(signUp({
      fullname: form.fullname.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password.trim()
    }));
  };

  return (
    <div className="auth-content">
      {authStatus?.success && (
        <div className="loader">
          <h3 className="toast-success auth-success">
            {authStatus?.message}
            <LoadingOutlined />
          </h3>
        </div>
      )}
      {!authStatus?.success && (
        <>
          {authStatus?.message && (
            <h5 className="text-center toast-error">
              {authStatus?.message}
            </h5>
          )}
          <div className={`auth ${authStatus?.message && (!authStatus?.success && 'input-error')}`}>
            <div className="auth-main">
              <h3>註冊 Ares 亞瑞仕知識學苑帳號</h3>
              <Formik
                initialValues={{
                  fullname: '',
                  email: '',
                  password: '',
                  agreeTerms: false,
                  agreePrivacy: false
                }}
                validateOnChange
                validationSchema={SignUpSchema}
                onSubmit={onFormSubmit}
              >
                {({ values, errors, touched }) => (
                  <Form>
                    <div className="auth-field">
                      <Field
                        disabled={isAuthenticating}
                        name="fullname"
                        type="text"
                        label="* 全名"
                        placeholder="王小明"
                        style={{ textTransform: 'capitalize' }}
                        component={CustomInput}
                      />
                    </div>
                    <div className="auth-field">
                      <Field
                        disabled={isAuthenticating}
                        name="email"
                        type="email"
                        label="* 電子郵件"
                        placeholder="test@example.com"
                        component={CustomInput}
                      />
                    </div>
                    <div className="auth-field">
                      <Field
                        disabled={isAuthenticating}
                        name="password"
                        type="password"
                        label="* 密碼"
                        placeholder="請輸入密碼"
                        component={CustomInput}
                      />
                    </div>
                    <br />
                    <div className="auth-agreements">
                      <div className="agreement-item">
                        <Field type="checkbox" name="agreeTerms" id="agreeTerms" />
                        <label htmlFor="agreeTerms">
                          我已閱讀並同意
                          <Link to={TERMS} target="_blank" rel="noopener noreferrer">《會員條款》</Link>
                        </label>
                        {errors.agreeTerms && touched.agreeTerms && (
                          <span className="agreement-error">{errors.agreeTerms}</span>
                        )}
                      </div>
                      <div className="agreement-item">
                        <Field type="checkbox" name="agreePrivacy" id="agreePrivacy" />
                        <label htmlFor="agreePrivacy">
                          我已閱讀並同意
                          <Link to={PRIVACY_POLICY} target="_blank" rel="noopener noreferrer">《隱私權政策》</Link>
                        </label>
                        {errors.agreePrivacy && touched.agreePrivacy && (
                          <span className="agreement-error">{errors.agreePrivacy}</span>
                        )}
                      </div>
                    </div>
                    <br />
                    <div className="auth-field auth-action auth-action-signup">
                      <button
                        className="button auth-button"
                        disabled={
                          isAuthenticating ||
                          !values.agreeTerms ||
                          !values.agreePrivacy
                        }
                        type="submit"
                      >
                        {isAuthenticating ? '註冊中' : '註冊'}
                        &nbsp;
                        {isAuthenticating ? <LoadingOutlined /> : <ArrowRightOutlined />}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
            <div className="auth-divider">
            </div>
          </div>
          <div className="auth-message">
            <span className="auth-info">
              <strong>已經有帳號了嗎？</strong>
            </span>
            <button
              className="button button-small button-border button-border-gray"
              disabled={isAuthenticating}
              onClick={onClickSignIn}
              type="button"
            >
              登入
            </button>
          </div>
        </>
      )}
    </div>
  );
};

SignUp.propTypes = {
  history: PropType.shape({
    push: PropType.func
  }).isRequired
};

export default SignUp;
