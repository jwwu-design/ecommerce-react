import { useDocumentTitle, useScrollTop } from '@/hooks';
import React from 'react';

const Dashboard = () => {
  useDocumentTitle('歡迎 | 管理員控制台');
  useScrollTop();

  return (
    <div className="loader">
      <h2>歡迎使用管理員控制台</h2>
    </div>
  );
};

export default Dashboard;
