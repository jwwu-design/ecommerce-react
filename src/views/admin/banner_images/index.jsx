import React, { useState, useEffect } from 'react';
import { UploadOutlined, DeleteOutlined, LoadingOutlined, PictureOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useDocumentTitle } from '@/hooks';
import firebaseInstance from '@/services/firebase';
import { displayActionMessage } from '@/helpers/utils';

const BannerImagesManagement = () => {
  useDocumentTitle('首頁圖片管理 | Ares 亞瑞仕知識學苑管理後台');

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bannerImages, setBannerImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [tempImages, setTempImages] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadBannerImages();
  }, []);

  const loadBannerImages = async () => {
    try {
      setLoading(true);
      const images = await firebaseInstance.getBannerImages();
      setBannerImages(images);
      setTempImages(images);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to load banner images:', error);
      displayActionMessage('載入圖片失敗', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    // 驗證檔案格式
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const invalidFiles = files.filter(file => {
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      return !validExtensions.includes(fileExtension);
    });

    if (invalidFiles.length > 0) {
      displayActionMessage('請上傳圖片檔案（.jpg, .jpeg, .png, .webp）', 'error');
      return;
    }

    // 驗證檔案大小（限制 2MB）
    const maxSize = 2 * 1024 * 1024;
    const oversizedFiles = files.filter(file => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      displayActionMessage('圖片檔案大小不能超過 2MB', 'error');
      return;
    }

    // 檢查是否超過上限（現有 + 新增）
    const totalImages = bannerImages.length + files.length;
    if (totalImages > 10) {
      displayActionMessage(`最多只能上傳 10 張圖片（目前：${bannerImages.length} 張）`, 'error');
      return;
    }

    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      displayActionMessage('請先選擇圖片', 'error');
      return;
    }

    try {
      setUploading(true);

      // 逐一上傳圖片
      for (const file of selectedFiles) {
        await firebaseInstance.uploadBannerImage(file);
      }

      displayActionMessage(`成功上傳 ${selectedFiles.length} 張圖片！`, 'success');

      // 重新載入圖片列表
      await loadBannerImages();
      setSelectedFiles([]);

      // 清空 file input
      const fileInput = document.getElementById('banner-file-input');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Upload failed:', error);
      displayActionMessage(error.message || '上傳失敗，請稍後再試', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId, fileName) => {
    if (!window.confirm('確定要刪除這張圖片嗎？')) {
      return;
    }

    try {
      await firebaseInstance.deleteBannerImage(imageId, fileName);
      displayActionMessage('圖片已刪除', 'success');
      await loadBannerImages();
    } catch (error) {
      console.error('Delete failed:', error);
      displayActionMessage(error.message || '刪除失敗，請稍後再試', 'error');
    }
  };

  // 拖曳開始
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  // 拖曳經過
  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  // 放下
  const handleDrop = (e, dropIndex) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newImages = [...tempImages];
    const draggedItem = newImages[draggedIndex];

    // 移除被拖曳的項目
    newImages.splice(draggedIndex, 1);
    // 插入到新位置
    newImages.splice(dropIndex, 0, draggedItem);

    setTempImages(newImages);
    setHasChanges(true);
    setDraggedIndex(null);
  };

  // 儲存順序
  const handleSaveOrder = async () => {
    try {
      await firebaseInstance.updateBannerImagesOrder(tempImages);
      displayActionMessage('順序已儲存', 'success');
      setBannerImages(tempImages);
      setHasChanges(false);
    } catch (error) {
      console.error('Save order failed:', error);
      displayActionMessage(error.message || '儲存順序失敗', 'error');
    }
  };

  // 取消變更
  const handleCancelChanges = () => {
    setTempImages(bannerImages);
    setHasChanges(false);
    displayActionMessage('已取消變更', 'info');
  };

  return (
    <div className="banner-images-management">
      <div className="page-header">
        <h2>首頁圖片管理</h2>
        <p className="text-subtle">管理首頁輪播圖片（上限 10 張）</p>
      </div>

      <div className="management-layout">
        {/* 左側：當前圖片列表 */}
        <div className="current-images-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>當前圖片 ({bannerImages.length}/10)</h3>
          </div>

          {loading ? (
            <div className="loading-state">
              <LoadingOutlined />
              <p>載入中...</p>
            </div>
          ) : bannerImages.length > 0 ? (
            <div className="images-grid">
              {bannerImages.map((image, index) => (
                <div key={image.id} className="image-card">
                  <div className="image-order-badge">#{index + 1}</div>
                  <div className="image-preview">
                    <img src={image.url} alt="輪播圖" />
                  </div>
                  <div className="image-info">
                    <p className="text-subtle" style={{ fontSize: '12px', marginBottom: '8px' }}>
                      上傳時間：{new Date(image.uploadedAt).toLocaleString('zh-TW')}
                    </p>
                    <button
                      onClick={() => handleDelete(image.id, image.fileName)}
                      className="button button-small button-danger"
                      style={{ width: '100%' }}
                    >
                      <DeleteOutlined /> 刪除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-images">
              <PictureOutlined style={{ fontSize: '48px', color: '#ccc' }} />
              <p className="text-subtle">尚未上傳任何圖片</p>
            </div>
          )}
        </div>

        {/* 右側：順序調整側邊欄 */}
        {bannerImages.length > 0 && (
          <div className="order-sidebar">
            <div className="sidebar-header">
              <h3>順序調整</h3>
              <p className="text-subtle">拖曳圖片調整順序</p>
            </div>

            <div className="draggable-list">
              {tempImages.map((image, index) => (
                <div
                  key={image.id}
                  className={`draggable-item ${draggedIndex === index ? 'dragging' : ''}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <div className="drag-handle">
                    <span className="drag-icon">⋮⋮</span>
                  </div>
                  <div className="item-number">#{index + 1}</div>
                  <div className="item-thumbnail">
                    <img src={image.url} alt={`圖片 ${index + 1}`} />
                  </div>
                </div>
              ))}
            </div>

            {hasChanges && (
              <div className="sidebar-actions">
                <button
                  onClick={handleSaveOrder}
                  className="button button-small"
                  style={{ width: '100%', marginBottom: '8px' }}
                >
                  儲存順序
                </button>
                <button
                  onClick={handleCancelChanges}
                  className="button button-small button-muted"
                  style={{ width: '100%' }}
                >
                  取消變更
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* 上傳新圖片 */}
      {bannerImages.length < 10 && (
        <div className="upload-section">
          <h3>上傳新圖片</h3>

          <div className="upload-area">
            <input
              id="banner-file-input"
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            <label htmlFor="banner-file-input" className="file-select-button">
              <UploadOutlined /> 選擇圖片
            </label>

            {selectedFiles.length > 0 && (
              <div className="selected-files-info">
                <p><strong>已選擇 {selectedFiles.length} 個檔案：</strong></p>
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="text-subtle">
                      {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploading}
            className="button button-small"
            style={{ marginTop: '1rem' }}
          >
            {uploading ? <LoadingOutlined /> : <UploadOutlined />}
            {uploading ? ' 上傳中...' : ' 上傳圖片'}
          </button>

          <div className="upload-instructions">
            <h4>使用說明</h4>
            <ul>
              <li>支援格式：.jpg、.jpeg、.png、.webp</li>
              <li>檔案大小限制：2MB</li>
              <li>最多可上傳 10 張圖片</li>
              <li>建議圖片尺寸：1920x600 或相同比例（寬度 100%，高度 500px）</li>
              <li>圖片會依照順序在首頁自動輪播顯示</li>
              <li>使用拖曳功能調整圖片顯示順序</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerImagesManagement;
