import React, { useState, useEffect } from 'react';
import { UploadOutlined, EyeOutlined, LoadingOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useDocumentTitle } from '@/hooks';
import firebaseInstance from '@/services/firebase';
import { displayActionMessage } from '@/helpers/utils';

const RegistrationFormManagement = () => {
  useDocumentTitle('報名表單管理 | Ares 管理後台');

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    loadCurrentTemplate();
  }, []);

  const loadCurrentTemplate = async () => {
    try {
      setLoading(true);
      const templateUrl = await firebaseInstance.getRegistrationFormTemplate();
      if (templateUrl) {
        setCurrentTemplate({
          url: templateUrl,
          uploadedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to load template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 驗證檔案格式
    const validExtensions = ['.docx', '.doc'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      displayActionMessage('請上傳 Word 檔案（.docx 或 .doc）', 'error');
      return;
    }

    // 驗證檔案大小（限制 10MB）
    const maxSize = 10 * 1024 * 1024;
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

    try {
      setUploading(true);
      await firebaseInstance.uploadRegistrationFormTemplate(selectedFile);
      displayActionMessage('報名表單模板上傳成功！', 'success');

      // 重新載入模板資訊
      await loadCurrentTemplate();
      setSelectedFile(null);

      // 清空 file input
      const fileInput = document.getElementById('template-file-input');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Upload failed:', error);
      displayActionMessage(error.message || '上傳失敗，請稍後再試', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handlePreview = () => {
    if (!currentTemplate?.url) {
      displayActionMessage('目前沒有可預覽的模板', 'error');
      return;
    }

    try {
      const previewURL = `https://docs.google.com/viewer?url=${encodeURIComponent(currentTemplate.url)}&embedded=true`;
      window.open(previewURL, '_blank');
      displayActionMessage('已開啟預覽視窗', 'success');
    } catch (error) {
      displayActionMessage('預覽失敗，請稍後再試', 'error');
    }
  };

  return (
    <div className="registration-form-management">
      <div className="page-header">
        <h2>報名表單管理</h2>
        <p className="text-subtle">管理客戶下載的報名表單模板</p>
      </div>

      <div className="management-content">
        {/* 當前模板資訊 */}
        <div className="current-template-section">
          <h3>當前模板</h3>
          {loading ? (
            <div className="loading-state">
              <LoadingOutlined />
              <p>載入中...</p>
            </div>
          ) : currentTemplate ? (
            <div className="template-info">
              <div className="template-status">
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '24px' }} />
                <div className="status-text">
                  <h4>模板已設定</h4>
                  <p className="text-subtle">客戶可以在結帳頁面下載此模板</p>
                </div>
              </div>
              <button
                onClick={handlePreview}
                className="button button-small button-muted"
              >
                <EyeOutlined /> 預覽模板
              </button>
            </div>
          ) : (
            <div className="no-template">
              <p className="text-subtle">尚未上傳報名表單模板</p>
            </div>
          )}
        </div>

        {/* 上傳新模板 */}
        <div className="upload-section">
          <h3>上傳新模板</h3>
          <p className="text-subtle">上傳新的報名表單模板將會覆蓋現有模板</p>

          <div className="upload-area">
            <input
              id="template-file-input"
              type="file"
              accept=".doc,.docx"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            <label htmlFor="template-file-input" className="file-select-button">
              <UploadOutlined /> 選擇檔案
            </label>

            {selectedFile && (
              <div className="selected-file-info">
                <p><strong>已選擇：</strong>{selectedFile.name}</p>
                <p className="text-subtle">
                  大小：{(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="button button-small"
              style={{ marginTop: '1rem' }}
            >
              {uploading ? <LoadingOutlined /> : <UploadOutlined />}
              {uploading ? ' 上傳中...' : ' 上傳模板'}
            </button>
          </div>

          <div className="upload-instructions">
            <h4>使用說明</h4>
            <ul>
              <li>支援格式：.docx、.doc</li>
              <li>檔案大小限制：10MB</li>
              <li>上傳後，客戶在結帳第三步可以下載此模板</li>
              <li>建議定期更新模板以確保資訊正確</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationFormManagement;
