import { ArrowLeftOutlined, LoadingOutlined } from '@ant-design/icons';
import { displayMoney } from '@/helpers/utils';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import firebaseInstance from '@/services/firebase';
import { ADMIN_ORDERS } from '@/constants/routes';

const OrderDetail = () => {
  const { id } = useParams();
  const history = useHistory();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const orderData = await firebaseInstance.getOrderById(id);
      setOrder(orderData);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch order detail:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loader">
        <LoadingOutlined />
        <p>載入訂單詳情中...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-detail-error">
        <p>{error || '找不到訂單'}</p>
        <button onClick={() => history.push(ADMIN_ORDERS)} className="button">
          返回訂單列表
        </button>
      </div>
    );
  }

  return (
    <div className="order-detail">
      {/* 頁首 */}
      <div className="order-detail-header">
        <button
          onClick={() => history.push(ADMIN_ORDERS)}
          className="button button-muted button-small"
        >
          <ArrowLeftOutlined /> 返回列表
        </button>
        <h2>訂單詳情</h2>
      </div>

      {/* 訂單基本資訊 */}
      <div className="order-detail-section">
        <h3>訂單資訊</h3>
        <div className="order-info-grid">
          <div className="info-item">
            <span className="info-label">訂單編號：</span>
            <span className="info-value">{order.orderId || order.id}</span>
          </div>
          <div className="info-item">
            <span className="info-label">下單時間：</span>
            <span className="info-value">
              {order.createdAt
                ? new Date(order.createdAt).toLocaleString('zh-TW')
                : '-'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">訂單狀態：</span>
            <span className="info-value">
              <span className={`status-badge status-${order.orderStatus}`}>
                {order.orderStatus || '未知'}
              </span>
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">付款狀態：</span>
            <span className="info-value">
              <span className={`status-badge status-${order.paymentStatus}`}>
                {order.paymentStatus || '未知'}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* 顧客資料 */}
      <div className="order-detail-section">
        <h3>顧客資料</h3>
        <div className="customer-info-grid">
          <div className="info-item">
            <span className="info-label">姓名：</span>
            <span className="info-value">{order.customerInfo?.fullname || '-'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Email：</span>
            <span className="info-value">{order.customerInfo?.email || '-'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">手機：</span>
            <span className="info-value">
              {order.customerInfo?.mobile
                ? (typeof order.customerInfo.mobile === 'object'
                  ? order.customerInfo.mobile.value || order.customerInfo.mobile.dialCode + order.customerInfo.mobile.value || '-'
                  : order.customerInfo.mobile)
                : '-'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">地址：</span>
            <span className="info-value">
              {order.customerInfo?.address
                ? `${order.customerInfo.address.city || ''} ${order.customerInfo.address.district || ''} ${order.customerInfo.address.street || ''}`
                : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* 訂購商品列表 */}
      <div className="order-detail-section">
        <h3>訂購商品</h3>
        <div className="order-items-table-container">
          <table className="order-items-table">
            <thead>
              <tr>
                <th>商品名稱</th>
                <th>規格</th>
                <th>數量</th>
                <th>單價</th>
                <th>小計</th>
              </tr>
            </thead>
            <tbody>
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name || '-'}</td>
                    <td>{item.selectedSize || '-'}</td>
                    <td>{item.quantity || 0}</td>
                    <td>{displayMoney(item.price || 0)}</td>
                    <td>{displayMoney(item.subtotal || item.price * item.quantity || 0)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-cell">
                    無商品資料
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 訂單金額明細 */}
      <div className="order-detail-section">
        <h3>金額明細</h3>
        <div className="order-amount-summary">
          <div className="amount-row">
            <span className="amount-label">商品小計：</span>
            <span className="amount-value">{displayMoney(order.totalAmount || 0)}</span>
          </div>
          <div className="amount-row amount-total">
            <span className="amount-label">訂單總額：</span>
            <span className="amount-value">{displayMoney(order.totalAmount || 0)}</span>
          </div>
        </div>
      </div>

      {/* 支付資訊（預留） */}
      <div className="order-detail-section">
        <h3>支付資訊</h3>
        <div className="placeholder-section">
          <p className="placeholder-text">支付資訊功能開發中，將於串接金流後提供</p>
          {order.payment && (
            <div className="payment-info">
              <pre>{JSON.stringify(order.payment, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>

      {/* 發票資訊（預留） */}
      <div className="order-detail-section">
        <h3>發票資訊</h3>
        <div className="placeholder-section">
          <p className="placeholder-text">發票資訊功能開發中，將於整合發票系統後提供</p>
          {order.invoice && (
            <div className="invoice-info">
              <pre>{JSON.stringify(order.invoice, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
