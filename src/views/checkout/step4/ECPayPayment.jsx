import React from 'react';
import PropTypes from 'prop-types';
import { displayMoney } from '@/helpers/utils';
import { Link } from 'react-router-dom';

const ECPayPayment = ({ orderData }) => {
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

      {orderData && (
        <div className="order-summary-section">
          <h4 className="order-summary-title">訂單摘要</h4>

          <div className="order-info-grid">
            <div className="order-info-item">
              <span className="order-info-label">訂單編號</span>
              <span className="order-info-value">{orderData.orderId}</span>
            </div>

            {orderData.customerInfo && (
              <>
                <div className="order-info-item">
                  <span className="order-info-label">收件人</span>
                  <span className="order-info-value">{orderData.customerInfo.fullname}</span>
                </div>

                <div className="order-info-item">
                  <span className="order-info-label">聯絡電話</span>
                  <span className="order-info-value">
                    {typeof orderData.customerInfo.mobile === 'string'
                      ? orderData.customerInfo.mobile
                      : orderData.customerInfo.mobile?.value || '-'}
                  </span>
                </div>

                <div className="order-info-item">
                  <span className="order-info-label">電子郵件</span>
                  <span className="order-info-value">{orderData.customerInfo.email}</span>
                </div>
              </>
            )}
          </div>

          {orderData.items && orderData.items.length > 0 && (
            <div className="order-items-list">
              <h5 className="order-items-title">訂購課程</h5>
              {orderData.items.map((item) => (
                <div key={item.id} className="order-item">
                  <div className="order-item-image">
                    {item.image && <img src={item.image} alt={item.name} />}
                  </div>
                  <div className="order-item-details">
                    <Link
                      to={`/product/${item.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="order-item-name"
                    >
                      {item.name}
                    </Link>
                    {item.selectedSize && (
                      <span className="order-item-size">日期：{item.selectedSize}</span>
                    )}
                  </div>
                  <div className="order-item-quantity">
                    x {item.quantity}
                  </div>
                  <div className="order-item-price">
                    {displayMoney(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="order-total-section">
            <div className="order-total-row">
              <span>課程小計</span>
              <span>{displayMoney(orderData.subtotal || 0)}</span>
            </div>
            {orderData.shipping && (
              <div className="order-total-row">
                <span>運費</span>
                <span>{displayMoney(orderData.shipping || 0)}</span>
              </div>
            )}
            <div className="order-total-row order-total-final">
              <span>訂單總計</span>
              <span className="total-amount">{displayMoney(orderData.totalAmount || 0)}</span>
            </div>
          </div>
        </div>
      )}

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

ECPayPayment.propTypes = {
  orderData: PropTypes.shape({
    orderId: PropTypes.string,
    totalAmount: PropTypes.number,
    subtotal: PropTypes.number,
    shipping: PropTypes.number,
    items: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      price: PropTypes.number,
      quantity: PropTypes.number,
      image: PropTypes.string,
      selectedSize: PropTypes.string
    })),
    customerInfo: PropTypes.shape({
      fullname: PropTypes.string,
      email: PropTypes.string,
      mobile: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
    })
  })
};

export default ECPayPayment;
