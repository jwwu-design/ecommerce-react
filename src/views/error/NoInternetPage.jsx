import { useScrollTop } from '@/hooks';
import React from 'react';

const NoInternet = () => {
  useScrollTop();

  return (
    <div className="page-not-found">
      <h1>:( 無網路連線。</h1>
      <p>請檢查您的網路連線，然後再試一次。</p>
      <br />
      <button
        className="button"
        onClick={() => window.location.reload(true)}
        type="button"
      >
        再試一次
      </button>
    </div>
  );
};

export default NoInternet;
