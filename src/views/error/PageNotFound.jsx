import { useScrollTop } from '@/hooks';
import PropType from 'prop-types';
import React from 'react';

const PageNotFound = ({ history }) => {
  useScrollTop();

  return (
    <div className="page-not-found">
      <h1>:( 您尋找的頁面不存在。</h1>
      <br />
      <button
        className="button"
        onClick={history.goBack}
        type="button"
      >
        返回上一頁
      </button>
    </div>
  );
};

PageNotFound.propTypes = {
  history: PropType.shape({
    goBack: PropType.func
  }).isRequired
};

export default PageNotFound;
