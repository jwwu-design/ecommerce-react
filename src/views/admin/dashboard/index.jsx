import React, { useState, useEffect } from 'react';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import { useHistory } from 'react-router-dom';
import {
  ShoppingOutlined,
  UserOutlined,
  DollarOutlined,
  FileTextOutlined,
  LoadingOutlined,
  RiseOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import firebase from '@/services/firebase';
import analyticsService from '@/services/analytics';
import { displayMoney } from '@/helpers/utils';
import { ADMIN_ORDERS, ADMIN_USERS, ADMIN_PRODUCTS } from '@/constants/routes';

const Dashboard = () => {
  useDocumentTitle('管理員控制台 | Ares Admin');
  useScrollTop();
  const history = useHistory();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    totalProducts: 0,
    pendingOrders: 0,
    approvedOrders: 0,
    rejectedOrders: 0,
    paidOrders: 0,
    activeUsers: 0,
    recentOrders: []
  });

  const [analyticsData, setAnalyticsData] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState(7); // 1, 7, 30

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    loadAnalyticsData();
  }, [analyticsTimeRange]);

  const loadAnalyticsData = async () => {
    try {
      setAnalyticsLoading(true);

      // 載入流量數據
      const data = await analyticsService.getAnalyticsData(analyticsTimeRange);

      // 格式化數據供圖表使用
      const formattedData = data.map(item => ({
        date: item.date.slice(5), // 只顯示 MM-DD
        瀏覽數: item.pageViews || 0,
        訪客數: item.uniqueVisitors || 0
      }));

      setAnalyticsData(formattedData);

      // 載入熱門頁面（排除 admin）
      const pages = await analyticsService.getTopPages(analyticsTimeRange);
      // 過濾掉 admin 相關頁面
      const filteredPages = pages.filter(page => !page.page.startsWith('/admin'));
      setTopPages(filteredPages);

      // 載入熱門商品
      const products = await analyticsService.getTopProducts(analyticsTimeRange, 10);
      setTopProducts(products);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // 並行載入所有資料
      const [ordersResult, users, productsSnapshot] = await Promise.all([
        firebase.getOrders({}, null),
        firebase.getAllUsers(),
        firebase.db.collection('products').get()
      ]);

      const orders = ordersResult.orders || [];

      // 計算訂單統計
      const pendingOrders = orders.filter(o => o.reviewStatus === 'pending').length;
      const approvedOrders = orders.filter(o => o.reviewStatus === 'approved').length;
      const rejectedOrders = orders.filter(o => o.reviewStatus === 'rejected').length;

      // 計算總營收（審核通過 + 已付款）
      const paidAndApprovedOrders = orders.filter(
        o => o.reviewStatus === 'approved' && o.paymentStatus === 'paid'
      );
      console.log('Paid & Approved orders:', paidAndApprovedOrders.length);

      const totalRevenue = paidAndApprovedOrders.reduce((sum, order) => {
        const amount = parseFloat(order.totalAmount) || 0;
        console.log(`Order ${order.orderId}: amount = ${order.totalAmount} (parsed: ${amount}), payment = ${order.paymentStatus}`);
        return sum + amount;
      }, 0);

      console.log('Total Revenue:', totalRevenue);

      // 計算已付款訂單數
      const paidOrders = orders.filter(o => o.paymentStatus === 'paid').length;

      // 計算啟用中的用戶數
      const activeUsers = users.filter(u => u.isActive).length;

      // 取得最近的訂單（最多10筆）
      const recentOrders = orders.slice(0, 10);

      setStats({
        totalOrders: orders.length,
        totalUsers: users.length,
        totalRevenue,
        totalProducts: productsSnapshot.size,
        pendingOrders,
        approvedOrders,
        rejectedOrders,
        paidOrders,
        activeUsers,
        recentOrders
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      approved: { text: '審核通過', className: 'status-approved', icon: <CheckCircleOutlined /> },
      rejected: { text: '審核未通過', className: 'status-rejected', icon: <CloseCircleOutlined /> },
      pending: { text: '等待審核', className: 'status-pending', icon: <ClockCircleOutlined /> }
    };

    const config = statusMap[status] || statusMap.pending;
    return (
      <span className={`status-badge ${config.className}`}>
        {config.icon} {config.text}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusMap = {
      pending: { text: '待付款', className: 'status-pending' },
      paid: { text: '已付款', className: 'status-paid' },
      failed: { text: '付款失敗', className: 'status-failed' }
    };

    const config = statusMap[status] || statusMap.pending;
    return <span className={`status-badge ${config.className}`}>{config.text}</span>;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loader">
        <LoadingOutlined style={{ fontSize: 48 }} />
        <p>載入資料中...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>管理員控制台</h1>
        <p className="text-subtle">歡迎回來！這是您的系統概覽</p>
      </div>

      {/* 統計卡片區 */}
      <div className="dashboard-stats">
        <div className="stat-card" onClick={() => history.push(ADMIN_ORDERS)}>
          <div className="stat-icon orders">
            <ShoppingOutlined />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.totalOrders}</h3>
            <p className="stat-label">總訂單數</p>
            <div className="stat-detail">
              <span className="pending-count">{stats.pendingOrders} 筆待審核</span>
            </div>
          </div>
        </div>

        <div className="stat-card" onClick={() => history.push(ADMIN_USERS)}>
          <div className="stat-icon users">
            <UserOutlined />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.totalUsers}</h3>
            <p className="stat-label">註冊用戶</p>
            <div className="stat-detail">
              <span className="active-count">{stats.activeUsers} 位啟用中</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">
            <DollarOutlined />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{displayMoney(stats.totalRevenue || 0)}</h3>
            <p className="stat-label">總營收（已付款）</p>
            <div className="stat-detail">
              <span className="approved-count">{stats.paidOrders} 筆已付款</span>
            </div>
          </div>
        </div>

        <div className="stat-card" onClick={() => history.push(ADMIN_PRODUCTS)}>
          <div className="stat-icon products">
            <FileTextOutlined />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.totalProducts}</h3>
            <p className="stat-label">商品數量</p>
            <div className="stat-detail">
              <span className="products-count">總商品數</span>
            </div>
          </div>
        </div>
      </div>

      {/* 訂單狀態概覽 */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>訂單狀態概覽</h2>
        </div>
        <div className="order-status-overview">
          <div className="status-item pending">
            <ClockCircleOutlined className="status-icon" />
            <div className="status-info">
              <h3>{stats.pendingOrders}</h3>
              <p>等待審核</p>
            </div>
          </div>
          <div className="status-item approved">
            <CheckCircleOutlined className="status-icon" />
            <div className="status-info">
              <h3>{stats.approvedOrders}</h3>
              <p>審核通過</p>
            </div>
          </div>
          <div className="status-item rejected">
            <CloseCircleOutlined className="status-icon" />
            <div className="status-info">
              <h3>{stats.rejectedOrders}</h3>
              <p>審核未通過</p>
            </div>
          </div>
        </div>
      </div>

      {/* 網站流量分析 */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>網站流量分析</h2>
          <div className="time-range-selector">
            <button
              className={`time-range-btn ${analyticsTimeRange === 1 ? 'active' : ''}`}
              onClick={() => setAnalyticsTimeRange(1)}
            >
              1日
            </button>
            <button
              className={`time-range-btn ${analyticsTimeRange === 7 ? 'active' : ''}`}
              onClick={() => setAnalyticsTimeRange(7)}
            >
              7日
            </button>
            <button
              className={`time-range-btn ${analyticsTimeRange === 30 ? 'active' : ''}`}
              onClick={() => setAnalyticsTimeRange(30)}
            >
              30日
            </button>
          </div>
        </div>

        {analyticsLoading ? (
          <div className="loader" style={{ padding: '2rem' }}>
            <LoadingOutlined style={{ fontSize: 32 }} />
          </div>
        ) : (
          <div className="analytics-charts">
            {/* 流量趨勢圖 */}
            <div className="chart-container">
              <h3 className="chart-title">
                <EyeOutlined /> 流量趨勢
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '0.875rem' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '0.875rem' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.875rem'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '0.875rem' }} />
                  <Line
                    type="monotone"
                    dataKey="瀏覽數"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ fill: '#6366f1', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="訪客數"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 熱門商品 */}
            <div className="chart-container">
              <h3 className="chart-title">
                <RiseOutlined /> 熱門商品 Top 10
              </h3>
              {topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProducts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '0.75rem' }} angle={-45} textAnchor="end" height={100} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '0.875rem' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.875rem'
                      }}
                    />
                    <Bar dataKey="views" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state">
                  <p>尚無商品瀏覽數據</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 最近訂單 */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>最近訂單</h2>
          <button
            className="button button-small"
            onClick={() => history.push(ADMIN_ORDERS)}
          >
            查看全部
          </button>
        </div>

        {stats.recentOrders.length === 0 ? (
          <div className="empty-state">
            <p>目前沒有訂單</p>
          </div>
        ) : (
          <div className="recent-orders-table">
            <table>
              <thead>
                <tr>
                  <th>訂單編號</th>
                  <th>客戶姓名</th>
                  <th>訂單金額</th>
                  <th>訂單日期</th>
                  <th>付款狀態</th>
                  <th>審核狀態</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => history.push(`/admin/orders/${order.id}`)}
                    className="clickable-row"
                  >
                    <td className="order-id">{order.orderId || order.id}</td>
                    <td>{order.customerInfo?.fullname || '-'}</td>
                    <td className="order-amount">{displayMoney(order.totalAmount || 0)}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{getPaymentStatusBadge(order.paymentStatus || 'pending')}</td>
                    <td>{getStatusBadge(order.reviewStatus || 'pending')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 快速操作 */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>快速操作</h2>
        </div>
        <div className="quick-actions">
          <button
            className="action-card"
            onClick={() => history.push(ADMIN_ORDERS)}
          >
            <ShoppingOutlined className="action-icon" />
            <h3>訂單管理</h3>
            <p>查看和管理所有訂單</p>
          </button>
          <button
            className="action-card"
            onClick={() => history.push(ADMIN_PRODUCTS)}
          >
            <FileTextOutlined className="action-icon" />
            <h3>商品管理</h3>
            <p>新增或編輯商品資訊</p>
          </button>
          <button
            className="action-card"
            onClick={() => history.push(ADMIN_USERS)}
          >
            <UserOutlined className="action-icon" />
            <h3>用戶管理</h3>
            <p>管理系統用戶資料</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
