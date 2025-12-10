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
  const [updating, setUpdating] = useState(false);

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

  const handleApprove = async () => {
    if (updating) return;

    const confirmApprove = window.confirm('確定要通過此報名表單審核嗎？');
    if (!confirmApprove) return;

    try {
      setUpdating(true);
      await firebaseInstance.updateOrderStatus(id, 'approved');

      // 重新載入訂單資料
      await fetchOrderDetail();
      alert('審核通過！');
    } catch (error) {
      console.error('Failed to approve:', error);
      alert('審核失敗：' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (updating) return;

    const reason = window.prompt('請輸入拒絕原因（選填）：');
    if (reason === null) return; // 使用者取消

    try {
      setUpdating(true);
      await firebaseInstance.updateOrderStatus(id, 'rejected', reason);

      // 發送拒絕通知 Email
      try {
        await firebaseInstance.sendRejectionEmail({
          orderId: order.orderId,
          customerEmail: order.customerInfo?.email || order.userEmail,
          customerName: order.customerInfo?.fullname || order.userName,
          reason: reason || '報名資料不符合要求'
        });
        console.log('✅ Rejection email sent');
      } catch (emailError) {
        console.error('❌ Failed to send email:', emailError);
        // Email 發送失敗不影響審核流程
      }

      // 重新載入訂單資料
      await fetchOrderDetail();
      alert('已拒絕此報名表單，並已發送通知信給顧客');
    } catch (error) {
      console.error('Failed to reject:', error);
      alert('操作失敗：' + error.message);
    } finally {
      setUpdating(false);
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
            {/* <span className="info-label">訂單狀態：</span>
            <span className="info-value">
              <span className={`status-badge status-${order.reviewStatus}`}>
                {order.reviewStatus || '未知'}
              </span>
            </span> */}
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

      {/* 顧客資訊 */}
      <div className="order-detail-section">
        <h3>顧客資訊</h3>
        <div className="customer-info-grid">
          <div className="info-item">
            <span className="info-label">學員姓名：</span>
            <span className="info-value">{order.customerInfo?.fullname || '-'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">英文姓名：</span>
            <span className="info-value">{order.customerInfo?.englishName || '-'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Email：</span>
            <span className="info-value">{order.customerInfo?.email || '-'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">聯絡電話：</span>
            <span className="info-value">
              {order.customerInfo?.mobile
                ? (typeof order.customerInfo.mobile === 'object'
                  ? order.customerInfo.mobile.value || order.customerInfo.mobile.dialCode + order.customerInfo.mobile.value || '-'
                  : order.customerInfo.mobile)
                : '-'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">發票抬頭/統編：</span>
            <span className="info-value">{order.customerInfo?.invoiceInfo || '-'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">聯絡地址：</span>
            <span className="info-value">
              {order.customerInfo?.address || '-'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">公司名稱：</span>
            <span className="info-value">{order.customerInfo?.companyName || '-'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">葷/素食：</span>
            <span className="info-value">{order.customerInfo?.dietPreference || '-'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">優惠券：</span>
            <span className="info-value">
              {order.customerInfo?.couponType === '序號' && order.customerInfo?.couponCode
                ? `序號: ${order.customerInfo.couponCode}`
                : order.customerInfo?.couponType || '無'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">資訊來源：</span>
            <span className="info-value">
              {order.customerInfo?.infoSource === '其他' && order.customerInfo?.infoSourceOther
                ? `其他: ${order.customerInfo.infoSourceOther}`
                : order.customerInfo?.infoSource || '-'}
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
                <th>日期</th>
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

      {/* 報名表單審核 */}
      <div className="order-detail-section">
        <h3>報名表單審核</h3>
        {order.registrationForm ? (
          <div className="registration-form-review">
            <div className="form-info-grid">
              <div className="info-item">
                <span className="info-label">檔案名稱：</span>
                <span className="info-value">{order.registrationForm.originalFileName || '報名表單.docx'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">上傳時間：</span>
                <span className="info-value">
                  {order.registrationForm.uploadedAt
                    ? new Date(order.registrationForm.uploadedAt).toLocaleString('zh-TW')
                    : '-'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">檔案大小：</span>
                <span className="info-value">
                  {order.registrationForm.fileSize
                    ? `${(order.registrationForm.fileSize / 1024).toFixed(2)} KB`
                    : '-'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">審核狀態：</span>
                <span className="info-value">
                  {order.reviewStatus === 'approved' && (
                    <span className="status-badge status-approved">✓ 已通過</span>
                  )}
                  {order.reviewStatus === 'rejected' && (
                    <span className="status-badge status-rejected">✗ 已拒絕</span>
                  )}
                  {(!order.reviewStatus || order.reviewStatus === 'pending') && (
                    <span className="status-badge status-pending">⏳ 待審核</span>
                  )}
                </span>
              </div>
            </div>

            {order.reviewedAt && (
              <div className="review-info">
                <p className="text-subtle">
                  審核時間：{new Date(order.reviewedAt).toLocaleString('zh-TW')}
                </p>
                {order.reviewNote && (
                  <p className="review-note">備註：{order.reviewNote}</p>
                )}
              </div>
            )}

            <div className="form-actions">
              <a
                href={order.registrationForm.fileURL}
                target="_blank"
                rel="noopener noreferrer"
                className="button button-small"
              >
                📥 下載表單
              </a>

              <a
                href={`https://docs.google.com/viewer?url=${encodeURIComponent(order.registrationForm.fileURL)}&embedded=true`}
                target="_blank"
                rel="noopener noreferrer"
                className="button button-small button-muted"
              >
                👁️ 線上預覽
              </a>

              {(!order.reviewStatus || order.reviewStatus === 'pending') && (
                <>
                  <button
                    onClick={() => handleApprove()}
                    className="button button-small"
                    style={{ background: '#52c41a', borderColor: '#52c41a' }}
                  >
                    ✓ 通過審核
                  </button>
                  <button
                    onClick={() => handleReject()}
                    className="button button-small"
                    style={{ background: '#ff4d4f', borderColor: '#ff4d4f' }}
                  >
                    ✗ 拒絕
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <p className="text-subtle">此訂單無報名表單</p>
        )}
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
