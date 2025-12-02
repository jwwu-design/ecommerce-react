import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, DollarOutlined } from '@ant-design/icons';
import firebase from '@/services/firebase';
import { displayMoney } from '@/helpers/utils';

const UserOrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = useSelector(state => state.auth?.id);
  const userEmail = useSelector(state => state.profile?.email);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) {
        console.log('❌ No userId found');
        setLoading(false);
        return;
      }

      console.log('🔍 Fetching orders for userId:', userId);
      console.log('📧 User email:', userEmail);

      try {
        const snapshot = await firebase.getUserOrders(userId);
        const ordersList = [];
        snapshot.forEach((doc) => {
          ordersList.push({ id: doc.id, ...doc.data() });
        });
        console.log('✅ Found orders:', ordersList.length, ordersList);
        setOrders(ordersList);
      } catch (error) {
        console.error('❌ Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId, userEmail]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      // 審核狀態（優先）
      approved: {
        icon: <CheckCircleOutlined />,
        text: '審核通過',
        className: 'status-approved'
      },
      rejected: {
        icon: <CloseCircleOutlined />,
        text: '審核未通過',
        className: 'status-rejected'
      },
      pending: {
        icon: <ClockCircleOutlined />,
        text: '等待審核',
        className: 'status-pending'
      },
      // 舊的狀態值（向後兼容）
      processing: {
        icon: <ClockCircleOutlined />,
        text: '處理中',
        className: 'status-pending'
      },
      confirmed: {
        icon: <CheckCircleOutlined />,
        text: '已確認',
        className: 'status-approved'
      },
      shipped: {
        icon: <CheckCircleOutlined />,
        text: '已出貨',
        className: 'status-approved'
      },
      delivered: {
        icon: <CheckCircleOutlined />,
        text: '已送達',
        className: 'status-completed'
      },
      cancelled: {
        icon: <CloseCircleOutlined />,
        text: '已取消',
        className: 'status-rejected'
      },
      pending_review: {
        icon: <ClockCircleOutlined />,
        text: '等待審核',
        className: 'status-pending'
      },
      paid: {
        icon: <DollarOutlined />,
        text: '已付款',
        className: 'status-paid'
      },
      completed: {
        icon: <CheckCircleOutlined />,
        text: '已完成',
        className: 'status-completed'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`order-status-badge ${config.className}`}>
        {config.icon}
        &nbsp;
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="loader" style={{ minHeight: '80vh' }}>
        <h3>載入中...</h3>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="user-orders-empty">
        <h3>我的訂單</h3>
        <p className="text-subtle">您目前沒有任何訂單</p>
        <Link to="/shop" className="button button-small">
          前往購物
        </Link>
      </div>
    );
  }

  return (
    <div className="user-orders">
      <h3>我的訂單</h3>
      <p className="text-subtle">共 {orders.length} 筆訂單</p>

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-card-header">
              <div className="order-info">
                <h4>{order.orderId}</h4>
                <p className="text-subtle">
                  {new Date(order.createdAt).toLocaleDateString('zh-TW', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="order-status">
                {getStatusBadge(order.reviewStatus || 'pending_review')}
              </div>
            </div>

            <div className="order-card-body">
              <div className="order-items-summary">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item-row">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">x {item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="order-total">
                <span>總計:</span>
                <strong>{displayMoney(order.totalAmount || order.total)}</strong>
              </div>
            </div>

            <div className="order-card-footer">
              <Link
                to={`/checkout/confirmation/${order.orderId}`}
                className="button button-small"
              >
                查看詳情
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserOrdersTab;
