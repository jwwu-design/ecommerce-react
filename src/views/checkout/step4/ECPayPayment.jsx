import React from 'react';
import PropTypes from 'prop-types';

const ECPayPayment = () => {
  return (
    <div className="ecpay-payment">
      <h3 className="payment-section-title">綠界支付</h3>
      <div className="payment-info-box">
        <div className="payment-icon">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <rect width="60" height="60" rx="8" fill="#00AA5B" />
            <path d="M20 30L27 37L40 24" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="payment-description">
          <h4>安全便捷的線上支付</h4>
          <p>支援信用卡、ATM 轉帳、超商代碼等多種付款方式</p>

          <ul className="payment-features">
            <li>✓ 信用卡分期付款</li>
            <li>✓ ATM 虛擬帳號</li>
            <li>✓ 超商代碼繳費</li>
            <li>✓ 電子錢包支付</li>
          </ul>
        </div>
      </div>

      <div className="payment-notice">
        <p>
          <strong>付款說明：</strong>
        </p>
        <ul>
          <li>點擊「確認付款」後，將跳轉至綠界金流頁面</li>
          <li>請在綠界頁面選擇您偏好的付款方式</li>
          <li>完成付款後，系統將自動更新訂單狀態</li>
          <li>如有任何問題，請聯繫客服</li>
        </ul>
      </div>
    </div>
  );
};

ECPayPayment.propTypes = {};

export default ECPayPayment;
