import { LoadingOutlined } from '@ant-design/icons';
import { displayMoney } from '@/helpers/utils';
import PropType from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import firebaseInstance from '@/services/firebase';
import { ADMIN_ORDER_DETAIL } from '@/constants/routes';
import { useDocumentTitle } from '@/hooks';


const OrderList = () => {
  useDocumentTitle('訂單管理 | Ares 管理後台');

  const history = useHistory();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    orderStatus: '',
    paymentStatus: '',
    shippingStatus: ''
  });
  const [lastKey, setLastKey] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async (loadMore = false) => {
    try {
      setLoading(true);
      const { orders: fetchedOrders, lastKey: newLastKey } = await firebaseInstance.getOrders(
        filters,
        loadMore ? lastKey : null
      );

      if (loadMore) {
        setOrders(prev => [...prev, ...fetchedOrders]);
      } else {
        setOrders(fetchedOrders);
      }

      setLastKey(newLastKey);
      setHasMore(fetchedOrders.length === 20);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchOrders();
      return;
    }

    try {
      setLoading(true);
      const searchResults = await firebaseInstance.searchOrders(searchTerm.trim());
      setOrders(searchResults);
      setHasMore(false);
    } catch (error) {
      console.error('Failed to search orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      orderStatus: '',
      paymentStatus: '',
      shippingStatus: ''
    });
    setSearchTerm('');
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      approved: { text: '審核通過', className: 'status-approved' },
      rejected: { text: '審核未通過', className: 'status-rejected' },
      pending: { text: '等待審核', className: 'status-pending' },
      // 向後兼容舊狀態
      processing: { text: '處理中', className: 'status-pending' },
      confirmed: { text: '已確認', className: 'status-approved' },
      shipped: { text: '已出貨', className: 'status-approved' },
      delivered: { text: '已送達', className: 'status-approved' },
      cancelled: { text: '已取消', className: 'status-rejected' }
    };

    const config = statusMap[status] || statusMap.pending;
    return <span className={`status-badge ${config.className}`}>{config.text}</span>;
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

  return (
    <div className="admin-orders">
      <div className="admin-orders-header">
        <h2>訂單管理</h2>
      </div>

      {/* 搜尋列 */}
      <div className="orders-search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="搜尋訂單編號、顧客名稱、Email、手機..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="button button-small">
            搜尋
          </button>
        </form>
      </div>

      {/* 篩選器 */}
      <div className="orders-filters">
        <div className="filter-group">
          <label>審核狀態：</label>
          <select
            className="filter-select"
            value={filters.orderStatus}
            onChange={(e) => setFilters({ ...filters, orderStatus: e.target.value })}
          >
            <option value="">全部</option>
            <option value="pending">等待審核</option>
            <option value="approved">審核通過</option>
            <option value="rejected">審核未通過</option>
          </select>
        </div>

        <div className="filter-group">
          <label>付款狀態：</label>
          <select
            value={filters.paymentStatus}
            onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
            className="filter-select"
          >
            <option value="">全部</option>
            <option value="pending">待付款</option>
            <option value="paid">已付款</option>
            <option value="failed">付款失敗</option>
          </select>
        </div>

        {/* <div className="filter-group">
          <label>出貨狀態：</label>
          <select
            value={filters.shippingStatus}
            onChange={(e) => handleFilterChange('shippingStatus', e.target.value)}
            className="filter-select"
          >
            <option value="">全部</option>
            <option value="pending">待出貨</option>
            <option value="preparing">準備中</option>
            <option value="shipped">已出貨</option>
            <option value="delivered">已送達</option>
          </select>
        </div> */}

        <button onClick={resetFilters} className="button button-muted button-small">
          重置篩選
        </button>
      </div>

      {/* 訂單列表 */}
      {loading && orders.length === 0 ? (
        <div className="loader">
          <LoadingOutlined />
          <p>載入訂單中...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <p>目前沒有訂單</p>
        </div>
      ) : (
        <>
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>訂單編號</th>
                  <th>訂單日期</th>
                  <th>客戶姓名</th>
                  <th>訂單金額</th>
                  <th>付款狀態</th>
                  <th>審核狀態</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="order-id">{order.orderId || order.id}</td>
                    <td>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('zh-TW')
                        : '-'}
                    </td>
                    <td>{order.customerInfo?.fullname || '-'}</td>
                    <td className="order-amount">
                      {displayMoney(order.totalAmount || 0)}
                    </td>
                    <td>{getPaymentStatusBadge(order.paymentStatus || 'pending')}</td>
                    <td>{getStatusBadge(order.reviewStatus || 'pending')}</td>
                    <td>
                      <button
                        onClick={() => history.push(ADMIN_ORDER_DETAIL.replace(':id', order.id))}
                        className="button button-small"
                      >
                        查看
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div className="load-more-section">
              <button
                onClick={() => fetchOrders(true)}
                disabled={loading}
                className="button button-muted"
              >
                {loading ? <LoadingOutlined /> : '載入更多'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrderList;
