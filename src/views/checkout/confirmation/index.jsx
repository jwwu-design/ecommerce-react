import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import firebase from '@/services/firebase';
import { displayMoney } from '@/helpers/utils';

const OrderConfirmation = () => {
  useDocumentTitle('訂單確認 | Ares');
  useScrollTop();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderData = await firebase.getOrderById(orderId);
        setOrder(orderData);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="loader">
        <h3>載入中...</h3>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-not-found">
        <h1>找不到訂單</h1>
        <p>訂單編號 {orderId} 不存在</p>
        <Link to="/" className="button">
          返回首頁
        </Link>
      </div>
    );
  }

  return (
    <div className="order-confirmation">
      <div className="order-confirmation-wrapper">
        <div className="order-confirmation-header">
          <CheckCircleOutlined style={{ fontSize: '5rem', color: '#52c41a', marginBottom: '1rem' }} />
          <h1>感謝您的訂購！</h1>
          <p className="order-id">訂單編號: <strong>{order.orderId}</strong></p>
        </div>

        <div className="order-confirmation-content">
          <div className="confirmation-message">
            <h2>您的訂單已成功建立</h2>
            <p className="text-subtle">
              我們已收到您的報名表單,管理員將在 1-2 個工作天內審核您的資料。
              審核通過後,我們會透過電子郵件通知您進行付款。
            </p>
          </div>

          <div className="divider" />

          <div className="order-summary-section">
            <h3>訂單摘要</h3>
            <div className="order-items">
              {order.items.map((item) => (
                <div key={item.id} className="order-item">
                  <div className="order-item-info">
                    <h4>{item.name}</h4>
                    <p className="text-subtle">
                      日期: {item.selectedSize} | 數量: {item.quantity}
                    </p>
                  </div>
                  <div className="order-item-price">
                    {displayMoney(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="order-total-section">
              <div className="order-total-row">
                <span>小計</span>
                <span>{displayMoney(order.subtotal)}</span>
              </div>
              {order.shippingFee > 0 && (
                <div className="order-total-row">
                  <span>運費</span>
                  <span>{displayMoney(order.shippingFee)}</span>
                </div>
              )}
              <div className="order-total-row total">
                <span><strong>總計</strong></span>
                <span><strong>{displayMoney(order.totalAmount || order.total)}</strong></span>
              </div>
            </div>
          </div>

          <div className="divider" />

          <div className="order-status-section">
            <h3>訂單狀態</h3>
            <div className="status-badge pending">
              <ClockCircleOutlined />
              &nbsp;
              等待審核
            </div>
            <p className="text-subtle" style={{ marginTop: '0.5rem' }}>
              訂單建立時間: {new Date(order.createdAt).toLocaleString('zh-TW')}
            </p>
          </div>

          <div className="divider" />

          <div className="next-steps-section">
            <h3>接下來的步驟</h3>
            <ol className="next-steps-list">
              <li>
                <strong>管理員審核</strong>
                <p className="text-subtle">我們會仔細審核您上傳的報名表單</p>
              </li>
              <li>
                <strong>電子郵件通知</strong>
                <p className="text-subtle">審核通過後,您會收到電子郵件通知</p>
              </li>
              <li>
                <strong>完成付款</strong>
                <p className="text-subtle">點擊郵件中的連結完成付款</p>
              </li>
              <li>
                <strong>參加課程</strong>
                <p className="text-subtle">付款完成後即可參加課程</p>
              </li>
            </ol>
          </div>

          <div className="divider" />

          <div className="contact-info-section">
            <h3>需要協助？</h3>
            <p className="text-subtle">
              如有任何問題,請聯繫我們的客服團隊:
            </p>
            <p>
              電子郵件: <a href={`mailto:${order.userEmail}`}>{order.userEmail}</a>
            </p>
          </div>

          <div className="confirmation-actions">
            <Link to="/" className="button">
              返回首頁
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
