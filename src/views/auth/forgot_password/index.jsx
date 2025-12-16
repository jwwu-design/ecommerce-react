import { CheckOutlined, LoadingOutlined } from '@ant-design/icons';
import { useDidMount, useDocumentTitle, useScrollTop } from '@/hooks';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword } from '@/redux/actions/authActions';

const ForgotPassword = () => {
  const { authStatus, isAuthenticating } = useSelector((state) => ({
    isAuthenticating: state.app.isAuthenticating,
    authStatus: state.app.authStatus
  }));
  const dispatch = useDispatch();
  const didMount = useDidMount();
  const [forgotPWStatus, setForgotPWStatus] = useState({});
  const [isSendingForgotPWRequest, setIsSending] = useState(false);
  const [field, setField] = useState({ email: '', error: '' });

  useScrollTop();
  useDocumentTitle('忘記密碼 | Ares');

  useEffect(() => {
    if (didMount) {
      setForgotPWStatus(authStatus);
      setIsSending(isAuthenticating);
    }
  }, [authStatus, isAuthenticating]);

  const onEmailChange = (e) => {
    const value = e.target.value.trim();
    const error = !/\S+@\S+\.\S+/.test(value) ? '電子郵件格式錯誤' : '';
    setField({ email: value, error });
  };

  const onSubmitEmail = () => {
    if (!!field.email && !field.error) {
      dispatch(resetPassword(field.email));
    }
  };

  return (
    <div className="forgot_password">
      {forgotPWStatus?.message && (
        <h5 className={`text-center ${authStatus?.success ? 'toast-success' : 'toast-error'}`}>
          {authStatus.message}
        </h5>
      )}
      <h2>忘記密碼？</h2>
      <p>請輸入您的電子郵件地址，我們將寄送密碼重設連結。</p>
      <br />
      <input
        name="email"
        required
        className="input-form"
        maxLength={40}
        onChange={onEmailChange}
        placeholder="請輸入您的電子郵件"
        readOnly={isSendingForgotPWRequest || authStatus?.success}
        type="email"
        style={{ width: '100%' }}
        value={field.email}
      />
      {field.error && <small className="text-danger">{field.error}</small>}
      <br />
      <br />
      <button
        className="button w-100-mobile"
        disabled={isSendingForgotPWRequest || authStatus?.success}
        onClick={onSubmitEmail}
        type="button"
      >
        {isSendingForgotPWRequest ? <LoadingOutlined /> : <CheckOutlined />}
        &nbsp;
        {isSendingForgotPWRequest ? '寄送中...' : '寄送密碼重設信'}
      </button>
    </div>
  );
};

export default ForgotPassword;
