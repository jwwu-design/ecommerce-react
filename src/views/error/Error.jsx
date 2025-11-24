import { useScrollTop } from '@/hooks';
import PropType from 'prop-types';
import React from 'react';

const Error = ({ history }) => {
  useScrollTop();

  return (
    <div className="page-not-found">
      <h1>:( 發生錯誤，請再試一次。</h1>
      <br />
      <button
        className="button"
        onClick={() => history.push('/')}
        type="button"
      >
        再試一次
      </button>
    </div>
  );
};

Error.propTypes = {
  history: PropType.shape({
    push: PropType.func
  }).isRequired
};

export default Error;
