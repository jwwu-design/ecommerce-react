/* eslint-disable react/no-multi-comp */
import { LoadingOutlined } from '@ant-design/icons';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import React, { lazy, Suspense } from 'react';
import UserTab from '../components/UserTab';

const UserAccountTab = lazy(() => import('../components/UserAccountTab'));
const UserWishListTab = lazy(() => import('../components/UserWishListTab'));
const UserOrdersTab = lazy(() => import('../components/UserOrdersTab'));

const Loader = () => (
  <div className="loader" style={{ minHeight: '80vh' }}>
    <LoadingOutlined />
    <h6>載入中 ... </h6>
  </div>
);

const UserAccount = () => {
  useScrollTop();
  useDocumentTitle('我的帳號 | Ares');

  return (
    <UserTab>
      <div index={0} label="帳號資訊">
        <Suspense fallback={<Loader />}>
          <UserAccountTab />
        </Suspense>
      </div>
      <div index={1} label="我的願望清單">
        <Suspense fallback={<Loader />}>
          <UserWishListTab />
        </Suspense>
      </div>
      <div index={2} label="我的訂單">
        <Suspense fallback={<Loader />}>
          <UserOrdersTab />
        </Suspense>
      </div>
    </UserTab>
  );
};

export default UserAccount;
