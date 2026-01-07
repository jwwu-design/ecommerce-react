import React from 'react';
import PropTypes from 'prop-types';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, formData }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content confirmation-modal">
        <div className="modal-header">
          <h2 className="modal-title">重要權益通知</h2>
          <p className="modal-subtitle">請再次確認填寫內容</p>
        </div>

        <div className="modal-body">
          <div className="confirmation-section">
            <h3>學員資訊</h3>
            <div className="confirmation-item">
              <span className="label">學員姓名：</span>
              <span className="value">{formData.fullname}</span>
            </div>
            <div className="confirmation-item">
              <span className="label">英文姓名：</span>
              <span className="value">{formData.englishName}</span>
            </div>
            <div className="confirmation-item">
              <span className="label">公司名稱：</span>
              <span className="value">{formData.companyName}</span>
            </div>
          </div>

          <div className="confirmation-section">
            <h3>聯絡資訊</h3>
            <div className="confirmation-item">
              <span className="label">電子郵件：</span>
              <span className="value">{formData.email}</span>
            </div>
            <div className="confirmation-item">
              <span className="label">聯絡電話：</span>
              <span className="value">{formData.mobile}</span>
            </div>
            <div className="confirmation-item">
              <span className="label">聯絡地址：</span>
              <span className="value">{formData.address}</span>
            </div>
          </div>

          <div className="confirmation-section">
            <h3>其他資訊</h3>
            <div className="confirmation-item">
              <span className="label">發票抬頭/統編：</span>
              <span className="value">{formData.invoiceInfo}</span>
            </div>
            <div className="confirmation-item">
              <span className="label">葷/素食：</span>
              <span className="value">{formData.dietPreference}</span>
            </div>
            {formData.couponType === '序號' && (
              <div className="confirmation-item">
                <span className="label">優惠券序號：</span>
                <span className="value">{formData.couponCode}</span>
              </div>
            )}
            <div className="confirmation-item">
              <span className="label">資訊來源：</span>
              <span className="value">
                {formData.infoSource}
                {formData.infoSource === '其他' && formData.infoSourceOther && (
                  <> - {formData.infoSourceOther}</>
                )}
              </span>
            </div>
          </div>

          <div className="confirmation-warning">
            <strong>⚠️ 提醒：</strong>
            請確認以上資料正確無誤，這些資訊將用於課程通知、證書製作及發票開立。
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="button button-muted"
            onClick={onClose}
          >
            返回修改
          </button>
          <button
            type="button"
            className="button"
            onClick={onConfirm}
          >
            確認無誤，繼續
          </button>
        </div>
      </div>
    </div>
  );
};

ConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  formData: PropTypes.shape({
    fullname: PropTypes.string,
    englishName: PropTypes.string,
    companyName: PropTypes.string,
    email: PropTypes.string,
    mobile: PropTypes.string,
    address: PropTypes.string,
    invoiceInfo: PropTypes.string,
    dietPreference: PropTypes.string,
    couponType: PropTypes.string,
    couponCode: PropTypes.string,
    infoSource: PropTypes.string,
    infoSourceOther: PropTypes.string
  }).isRequired
};

export default ConfirmationModal;
