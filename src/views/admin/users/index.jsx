import React, { useState, useEffect } from 'react';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import { SearchOutlined, UserOutlined, CheckCircleOutlined, CloseCircleOutlined, EditOutlined, LockOutlined, UnlockOutlined, LoadingOutlined } from '@ant-design/icons';
import firebase from '@/services/firebase';
import { displayActionMessage } from '@/helpers/utils';

const UserManagement = () => {
  useDocumentTitle('用戶管理 | Ares Admin');
  useScrollTop();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    fullname: '',
    email: '',
    mobile: '',
    role: 'USER'
  });

  // 載入用戶資料
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await firebase.getAllUsers();

      // 為每個用戶載入訂單統計
      const usersWithStats = await Promise.all(
        allUsers.map(async (user) => {
          const stats = await firebase.getUserOrderStats(user.id);
          return {
            ...user,
            orderCount: stats.orderCount,
            totalSpent: stats.totalSpent
          };
        })
      );

      setUsers(usersWithStats);
    } catch (error) {
      console.error('Failed to load users:', error);
      displayActionMessage('載入用戶資料失敗', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await firebase.toggleUserStatus(userId, !currentStatus);
      displayActionMessage(
        `用戶已${!currentStatus ? '啟用' : '停用'}`,
        'success'
      );
      loadUsers();
    } catch (error) {
      displayActionMessage('操作失敗，請稍後再試', 'error');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditForm({
      fullname: user.fullname,
      email: user.email,
      mobile: user.mobile?.data?.value || '',
      role: user.role
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      const updates = {
        fullname: editForm.fullname,
        email: editForm.email,
        mobile: {
          data: {
            value: editForm.mobile
          }
        }
      };

      await firebase.updateUser(editingUser.id, updates);

      // 如果角色有變更，也更新角色
      if (editForm.role !== editingUser.role) {
        await firebase.updateUserRole(editingUser.id, editForm.role);
      }

      displayActionMessage('用戶資料已更新', 'success');
      setShowEditModal(false);
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      displayActionMessage('更新失敗，請稍後再試', 'error');
    }
  };

  // 篩選用戶
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.mobile?.data?.value || '').includes(searchTerm);

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatMobile = (mobile) => {
    if (typeof mobile === 'string') return mobile;
    return mobile?.data?.value || mobile?.value || '-';
  };

  const getRoleBadge = (role) => {
    if (role === 'ADMIN') {
      return <span className="role-badge role-admin">管理員</span>;
    }
    return <span className="role-badge role-user">用戶</span>;
  };

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return (
        <span className="status-badge status-active">
          <CheckCircleOutlined /> 啟用中
        </span>
      );
    }
    return (
      <span className="status-badge status-inactive">
        <CloseCircleOutlined /> 已停用
      </span>
    );
  };

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h2>用戶管理</h2>
        <p className="text-subtle">管理系統用戶資料、權限與狀態</p>
      </div>

      {loading ? (
        <div className="loading-state">
          <LoadingOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          <p>載入用戶資料中...</p>
        </div>
      ) : (
        <>
          {/* 搜尋與篩選 */}
          <div className="user-filters">
            <div className="search-box">
              <SearchOutlined />
              <input
                type="text"
                placeholder="搜尋姓名、Email 或電話..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">全部角色</option>
                <option value="USER">用戶</option>
                <option value="ADMIN">管理員</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">全部狀態</option>
                <option value="active">啟用中</option>
                <option value="inactive">已停用</option>
              </select>
            </div>
          </div>

          {/* 統計資訊 */}
          <div className="user-stats">
            <div className="stat-card">
              <UserOutlined className="stat-icon" />
              <div className="stat-info">
                <h3>{users.length}</h3>
                <p>總用戶數</p>
              </div>
            </div>
            <div className="stat-card">
              <CheckCircleOutlined className="stat-icon active" />
              <div className="stat-info">
                <h3>{users.filter(u => u.isActive).length}</h3>
                <p>啟用中</p>
              </div>
            </div>
            <div className="stat-card">
              <CloseCircleOutlined className="stat-icon inactive" />
              <div className="stat-info">
                <h3>{users.filter(u => !u.isActive).length}</h3>
                <p>已停用</p>
              </div>
            </div>
          </div>

          {/* 用戶列表 */}
          <div className="user-table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th>用戶資訊</th>
                  <th>聯絡方式</th>
                  <th>角色</th>
                  <th>狀態</th>
                  <th>註冊日期</th>
                  <th>訂單統計</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">
                      沒有找到符合條件的用戶
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">
                            <UserOutlined />
                          </div>
                          <div>
                            <div className="user-name">{user.fullname}</div>
                            <div className="user-id">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="contact-info">
                          <div>{user.email}</div>
                          <div className="text-subtle">{formatMobile(user.mobile)}</div>
                        </div>
                      </td>
                      <td>{getRoleBadge(user.role)}</td>
                      <td>{getStatusBadge(user.isActive)}</td>
                      <td>{formatDate(user.dateJoined)}</td>
                      <td>
                        <div className="order-stats">
                          <div>{user.orderCount || 0} 筆</div>
                          <div className="text-subtle">NT$ {(user.totalSpent || 0).toLocaleString()}</div>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn edit-btn"
                            title="編輯用戶"
                            onClick={() => handleEditUser(user)}
                          >
                            <EditOutlined />
                          </button>
                          <button
                            className={`action-btn ${user.isActive ? 'lock-btn' : 'unlock-btn'}`}
                            title={user.isActive ? '停用用戶' : '啟用用戶'}
                            onClick={() => handleToggleStatus(user.id, user.isActive)}
                          >
                            {user.isActive ? <LockOutlined /> : <UnlockOutlined />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 顯示結果數量 */}
          <div className="table-footer">
            <p>顯示 {filteredUsers.length} 個用戶（共 {users.length} 個）</p>
          </div>
        </>
      )}

      {/* 編輯用戶 Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>編輯用戶資料</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>姓名 *</label>
                <input
                  type="text"
                  value={editForm.fullname}
                  onChange={(e) => setEditForm({ ...editForm, fullname: e.target.value })}
                  placeholder="請輸入姓名"
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="請輸入 Email"
                />
              </div>

              <div className="form-group">
                <label>電話</label>
                <input
                  type="text"
                  value={editForm.mobile}
                  onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                  placeholder="請輸入電話號碼"
                />
              </div>

              <div className="form-group">
                <label>角色 *</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                >
                  <option value="USER">用戶</option>
                  <option value="ADMIN">管理員</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="button button-border"
                onClick={() => setShowEditModal(false)}
              >
                取消
              </button>
              <button
                className="button"
                onClick={handleSaveEdit}
              >
                儲存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
