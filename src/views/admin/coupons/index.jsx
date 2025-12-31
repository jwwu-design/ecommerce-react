import { DeleteOutlined, EditOutlined, PlusOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { displayActionMessage } from '@/helpers/utils';
import React, { useState, useEffect } from 'react';
import firebase from '@/services/firebase';

const CouponsManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // 表單狀態
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'fixed', // 'fixed' or 'percentage'
    discountValue: 0,
    minPurchase: 0,
    maxUses: null,
    startDate: null,
    endDate: null
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await firebase.getAllCoupons();
      setCoupons(data);
    } catch (error) {
      displayActionMessage(error.message || '載入優惠券失敗', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = () => {
    const generatedCode = firebase.generateCouponCode();
    setFormData({ ...formData, code: generatedCode });
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'fixed',
      discountValue: 0,
      minPurchase: 0,
      maxUses: null,
      startDate: null,
      endDate: null
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleCreate = async () => {
    try {
      if (!formData.code.trim()) {
        displayActionMessage('請輸入優惠碼', 'error');
        return;
      }
      if (formData.discountValue <= 0) {
        displayActionMessage('折扣金額/比例必須大於 0', 'error');
        return;
      }

      const couponData = {
        code: formData.code.toUpperCase().trim(),
        description: formData.description.trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minPurchase: Number(formData.minPurchase) || 0,
        maxUses: formData.maxUses ? Number(formData.maxUses) : null,
        startDate: formData.startDate ? new Date(formData.startDate).getTime() : null,
        endDate: formData.endDate ? new Date(formData.endDate).getTime() : null
      };

      await firebase.createCoupon(couponData);
      displayActionMessage('優惠券新增成功！', 'success');
      resetForm();
      loadCoupons();
    } catch (error) {
      displayActionMessage(error.message || '新增優惠券失敗', 'error');
    }
  };

  const handleEdit = (coupon) => {
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minPurchase: coupon.minPurchase || 0,
      maxUses: coupon.maxUses || null,
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().slice(0, 16) : null,
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().slice(0, 16) : null
    });
    setIsCreating(true);
  };

  const handleUpdate = async () => {
    try {
      if (formData.discountValue <= 0) {
        displayActionMessage('折扣金額/比例必須大於 0', 'error');
        return;
      }

      const updates = {
        description: formData.description.trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minPurchase: Number(formData.minPurchase) || 0,
        maxUses: formData.maxUses ? Number(formData.maxUses) : null,
        startDate: formData.startDate ? new Date(formData.startDate).getTime() : null,
        endDate: formData.endDate ? new Date(formData.endDate).getTime() : null
      };

      await firebase.updateCoupon(editingId, updates);
      displayActionMessage('優惠券更新成功！', 'success');
      resetForm();
      loadCoupons();
    } catch (error) {
      displayActionMessage(error.message || '更新優惠券失敗', 'error');
    }
  };

  const handleToggleActive = async (couponId, currentStatus) => {
    try {
      await firebase.updateCoupon(couponId, { isActive: !currentStatus });
      displayActionMessage(`優惠券已${!currentStatus ? '啟用' : '停用'}`, 'success');
      loadCoupons();
    } catch (error) {
      displayActionMessage(error.message || '更新狀態失敗', 'error');
    }
  };

  const handleDelete = async (couponId) => {
    if (!window.confirm('確定要刪除此優惠券嗎？')) return;

    try {
      await firebase.deleteCoupon(couponId);
      displayActionMessage('優惠券刪除成功', 'success');
      loadCoupons();
    } catch (error) {
      displayActionMessage(error.message || '刪除優惠券失敗', 'error');
    }
  };

  const formatDiscount = (coupon) => {
    if (coupon.discountType === 'fixed') {
      return `NT$ ${coupon.discountValue.toLocaleString()}`;
    } else {
      return `${coupon.discountValue}%`;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '無限制';
    return new Date(timestamp).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loader" />;
  }

  return (
    <div className="coupons-management">
      <div className="page-header">
        <h2>優惠券管理</h2>
        <button
          className="button"
          onClick={() => setIsCreating(!isCreating)}
        >
          <PlusOutlined /> {isCreating ? '取消新增' : '新增優惠券'}
        </button>
      </div>

      {/* 新增/編輯表單 */}
      {isCreating && (
        <div className="coupon-form-card">
          <h3>{editingId ? '編輯優惠券' : '新增優惠券'}</h3>

          <div className="form-grid">
            <div className="form-group">
              <label>優惠碼 *</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="input-text"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                  placeholder="輸入優惠碼"
                  disabled={editingId} // 編輯時不能改優惠碼
                  maxLength={20}
                />
                {!editingId && (
                  <button
                    type="button"
                    className="button button-small button-muted"
                    onClick={handleGenerateCode}
                  >
                    隨機生成
                  </button>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>描述</label>
              <input
                type="text"
                className="input-text"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="例如：新年優惠"
              />
            </div>

            <div className="form-group">
              <label>折扣類型 *</label>
              <select
                className="input-text"
                value={formData.discountType}
                onChange={(e) => handleInputChange('discountType', e.target.value)}
              >
                <option value="fixed">固定金額</option>
                <option value="percentage">百分比折扣</option>
              </select>
            </div>

            <div className="form-group">
              <label>折扣值 *</label>
              <input
                type="number"
                className="input-text"
                value={formData.discountValue}
                onChange={(e) => handleInputChange('discountValue', e.target.value)}
                placeholder={formData.discountType === 'fixed' ? '輸入金額' : '輸入百分比'}
                min="0"
              />
              <small className="text-subtle">
                {formData.discountType === 'fixed' ? '直接折扣金額 (NT$)' : '折扣百分比 (%)'}
              </small>
            </div>

            <div className="form-group">
              <label>最低消費金額</label>
              <input
                type="number"
                className="input-text"
                value={formData.minPurchase}
                onChange={(e) => handleInputChange('minPurchase', e.target.value)}
                placeholder="0 表示無限制"
                min="0"
              />
            </div>

            <div className="form-group">
              <label>使用次數上限</label>
              <input
                type="number"
                className="input-text"
                value={formData.maxUses || ''}
                onChange={(e) => handleInputChange('maxUses', e.target.value)}
                placeholder="留空表示無限制"
                min="1"
              />
            </div>

            <div className="form-group">
              <label>生效時間(留空表示無限制)</label>
              <input
                type="datetime-local"
                className="input-text"
                value={formData.startDate || ''}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>失效時間(留空表示無限制)</label>
              <input
                type="datetime-local"
                className="input-text"
                value={formData.endDate || ''}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '20px' }}>
            <button
              className="button"
              onClick={editingId ? handleUpdate : handleCreate}
            >
              {editingId ? '更新優惠券' : '新增優惠券'}
            </button>
            <button
              className="button button-muted"
              onClick={resetForm}
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 優惠券列表 */}
      <div className="coupons-list">
        <h3>現有優惠券 ({coupons.length})</h3>

        {coupons.length === 0 ? (
          <p className="text-subtle">目前尚無優惠券</p>
        ) : (
          <div className="coupons-table">
            <table>
              <thead>
                <tr>
                  <th>優惠碼</th>
                  <th>描述</th>
                  <th>折扣</th>
                  <th>最低消費</th>
                  <th>使用次數</th>
                  <th>有效期間</th>
                  <th>狀態</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className={!coupon.isActive ? 'inactive-row' : ''}>
                    <td>
                      <strong>{coupon.code}</strong>
                    </td>
                    <td>{coupon.description || '-'}</td>
                    <td>{formatDiscount(coupon)}</td>
                    <td>
                      {coupon.minPurchase > 0
                        ? `NT$ ${coupon.minPurchase.toLocaleString()}`
                        : '無限制'}
                    </td>
                    <td>
                      {coupon.usedCount || 0}
                      {coupon.maxUses ? ` / ${coupon.maxUses}` : ' / ∞'}
                    </td>
                    <td>
                      <div style={{ fontSize: '12px' }}>
                        <div>起：{formatDate(coupon.startDate)}</div>
                        <div>迄：{formatDate(coupon.endDate)}</div>
                      </div>
                    </td>
                    <td>
                      {coupon.isActive ? (
                        <span className="badge badge-success">
                          <CheckCircleOutlined /> 啟用
                        </span>
                      ) : (
                        <span className="badge badge-error">
                          <CloseCircleOutlined /> 停用
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="button button-small"
                          onClick={() => handleEdit(coupon)}
                          title="編輯"
                        >
                          <EditOutlined />
                        </button>
                        <button
                          className={`button button-small ${coupon.isActive ? 'button-muted' : 'button-success'
                            }`}
                          onClick={() => handleToggleActive(coupon.id, coupon.isActive)}
                          title={coupon.isActive ? '停用' : '啟用'}
                        >
                          {coupon.isActive ? '停用' : '啟用'}
                        </button>
                        <button
                          className="button button-small button-danger"
                          onClick={() => handleDelete(coupon.id)}
                          title="刪除"
                        >
                          <DeleteOutlined />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponsManagement;
