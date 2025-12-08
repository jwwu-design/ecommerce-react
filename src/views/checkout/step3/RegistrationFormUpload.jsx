import { DownloadOutlined, UploadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { displayActionMessage } from '@/helpers/utils';
import PropType from 'prop-types';
import React, { useState } from 'react';
import firebase from '@/services/firebase';


const RegistrationFormUpload = ({ userId, userEmail, orderId, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // 下載報名表單範本
  const handleDownloadTemplate = async () => {
    try {
      const downloadURL = await firebase.getRegistrationFormTemplate();
      // 創建一個隱藏的 a 標籤來觸發下載
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = '課程報名表.docx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      displayActionMessage('報名表單下載成功！', 'success');
    } catch (error) {
      displayActionMessage(error.message || '下載失敗，請稍後再試', 'error');
    }
  };

  // 處理檔案選擇
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 驗證檔案格式
    const validExtensions = ['.docx'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      displayActionMessage('請上傳 Word 檔案（.docx）', 'error');
      return;
    }

    // 驗證檔案大小（限制 10MB）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      displayActionMessage('檔案大小不能超過 10MB', 'error');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      displayActionMessage('請先選擇檔案', 'error');
      return;
    }

    setUploading(true);
    try {
      // 模擬上傳進度（實際不上傳）
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // 等待一下讓進度條跑完
      await new Promise(resolve => setTimeout(resolve, 2000));

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadedFile(selectedFile.name);
      displayActionMessage('報名表單已準備好！', 'success');

      // 只傳遞檔案對象，不上傳
      if (onUploadComplete) {
        onUploadComplete({
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          timestamp: new Date().getTime()
        }, selectedFile);
      }

      console.log('✅ File ready for upload:', selectedFile.name);
    } catch (error) {
      console.error('❌ File validation failed:', error);
      displayActionMessage(error.message || '檔案驗證失敗，請稍後再試', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="registration-form-upload">
      <div className="registration-form-section">
        <h3>步驟 1：下載報名表單</h3>
        <p className="text-subtle">請先下載報名表單範本，填寫完成後再上傳。</p>
        <button
          type="button"
          className="button button-small"
          onClick={handleDownloadTemplate}
        >
          <DownloadOutlined />
          &nbsp; 下載報名表單
        </button>
      </div>

      <div className="divider" style={{ margin: '2rem 0' }} />

      <div className="registration-form-section">
        <h3>步驟 2：上傳填寫完成的表單</h3>
        <p className="text-subtle">請選擇您填寫完成的報名表單檔案（支援 .docx 格式）</p>

        <div className="file-upload-area">
          <input
            type="file"
            id="registration-form-file"
            accept=".docx"
            onChange={handleFileSelect}
            disabled={uploading || uploadedFile}
            style={{ display: 'none' }}
          />
          <label htmlFor="registration-form-file" className="file-upload-label">
            {selectedFile ? (
              <div className="selected-file">
                <span>📄 {selectedFile.name}</span>
                <span className="file-size">
                  ({(selectedFile.size / 1024).toFixed(2)} KB)
                </span>
              </div>
            ) : (
              <div className="upload-placeholder">
                <UploadOutlined style={{ fontSize: '2rem', color: '#999' }} />
                <p>點擊選擇檔案</p>
              </div>
            )}
          </label>

          {selectedFile && !uploadedFile && (
            <button
              type="button"
              className="button"
              onClick={handleUpload}
              disabled={uploading}
              style={{ marginTop: '1rem', width: '100%' }}
            >
              {uploading ? '上傳中...' : '確認上傳'}
            </button>
          )}

          {uploading && (
            <div className="upload-progress" style={{ marginTop: '1rem' }}>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-subtle">{uploadProgress}%</p>
            </div>
          )}

          {uploadedFile && (
            <div className="upload-success" style={{ marginTop: '1rem', textAlign: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: '3rem', color: '#52c41a' }} />
              <p style={{ color: '#52c41a', fontWeight: 'bold' }}>上傳成功！</p>
              <p className="text-subtle">{uploadedFile}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


RegistrationFormUpload.propTypes = {
  userId: PropType.string.isRequired,
  userEmail: PropType.string.isRequired,
  orderId: PropType.string,  // 可選，重新上傳時才有
  onUploadComplete: PropType.func
};

export default RegistrationFormUpload;

