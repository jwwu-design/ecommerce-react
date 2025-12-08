import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import { useSelector } from 'react-redux';
import firebase from '@/services/firebase';
import { displayMoney } from '@/helpers/utils';
import { displayActionMessage } from '@/helpers/utils';

const OrderConfirmation = () => {
  useDocumentTitle('訂單確認 | Ares');
  useScrollTop();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // 取得當前使用者資訊
  const { uid, fullname } = useSelector((state) => ({
    uid: state.auth.id,
    fullname: state.profile.fullname || 'User'
  }));

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

  // 處理檔案選擇
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 檢查檔案類型
      const validTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      if (!validTypes.includes(file.type)) {
        displayActionMessage('請上傳 Word 檔案 (.docx 或 .doc)', 'error');
        return;
      }
      // 檢查檔案大小 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        displayActionMessage('檔案大小不得超過 10MB', 'error');
        return;
      }
      setSelectedFile(file);
    }
  };

  // 處理重新上傳
  const handleReupload = async () => {
    if (!selectedFile) {
      displayActionMessage('請選擇檔案', 'error');
      return;
    }

    setUploading(true);
    try {
      // 上傳檔案到 Firebase Storage
      const uploadResult = await firebase.uploadRegistrationForm(
        uid,
        fullname,
        selectedFile,
        orderId
      );

      // 更新訂單的報名表單資訊
      await firebase.updateOrderRegistrationForm(orderId, uploadResult);

      // 重設審核狀態為 pending
      await firebase.updateOrderStatus(orderId, 'pending', '');

      console.log('✅ Registration form reuploaded');
      displayActionMessage('報名表單已重新上傳，等待審核', 'success');

      // 重新載入訂單資料
      const updatedOrder = await firebase.getOrderById(orderId);
      setOrder(updatedOrder);
      setSelectedFile(null);
    } catch (error) {
      console.error('❌ Failed to reupload:', error);
      displayActionMessage('上傳失敗，請稍後再試', 'error');
    } finally {
      setUploading(false);
    }
  };

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
            <h3>報名表單狀態</h3>
            {order.reviewStatus === 'approved' ? (
              <div className="status-badge approved">
                <CheckCircleOutlined />
                &nbsp;
                審核通過
              </div>
            ) : order.reviewStatus === 'rejected' ? (
              <div className="status-badge rejected">
                <CloseCircleOutlined />
                &nbsp;
                審核未通過
              </div>
            ) : (
              <div className="status-badge pending">
                <ClockCircleOutlined />
                &nbsp;
                等待審核
              </div>
            )}
            <p className="text-subtle" style={{ marginTop: '0.5rem' }}>
              訂單建立時間: {new Date(order.createdAt).toLocaleString('zh-TW')}
            </p>
            {order.reviewedAt && (
              <p className="text-subtle">
                審核時間: {new Date(order.reviewedAt).toLocaleString('zh-TW')}
              </p>
            )}
            {order.reviewNote && (
              <p className="review-note" style={{ marginTop: '0.5rem', color: '#ff4d4f' }}>
                備註：{order.reviewNote}
              </p>
            )}

            {/* 審核通過且未付款時顯示付款按鈕 */}
            {order.reviewStatus === 'approved' && order.paymentStatus === 'pending' && (
              <div style={{ marginTop: '1.5rem' }}>
                <Link
                  to={`/checkout/step4?orderId=${order.orderId}`}
                  className="button button-large"
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  立即付款
                </Link>
              </div>
            )}

            {/* 審核被拒絕時顯示重新上傳區域 */}
            {order.reviewStatus === 'rejected' && (
              <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '1rem', color: '#333' }}>重新上傳報名表單</h4>

                <div style={{ marginBottom: '1rem' }}>
                  <input
                    type="file"
                    accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    id="reupload-file-input"
                  />
                  <label
                    htmlFor="reupload-file-input"
                    className="button button-border"
                    style={{ cursor: 'pointer', display: 'block', width: '100%', textAlign: 'center', marginBottom: '0.5rem' }}
                  >
                    <UploadOutlined /> 選擇檔案
                  </label>
                  {selectedFile && (
                    <p style={{ color: '#666', margin: '0.5rem 0 0 0', fontSize: '1.2rem', textAlign: 'center' }}>
                      已選擇：{selectedFile.name}
                    </p>
                  )}
                </div>

                <button
                  className="button button-large"
                  style={{ width: '100%', background: '#333', borderColor: '#333' }}
                  onClick={handleReupload}
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? '上傳中...' : '提交重新上傳'}
                </button>

              </div>
            )}
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
              如有任何問題,請聯繫我們的客服
            </p>
            <p>
              電子郵件: <a href={`mailto:ares@ares-cert.com`}>ares@ares-cert.com</a>
            </p>
            <p>
              電話：06-2959696
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
