import PropType from 'prop-types';
import React from 'react';

const StepTracker = ({ current }) => {
  // eslint-disable-next-line no-nested-ternary
  const className = (step) => (current === step
    ? 'is-active-step'
    : step < current
      ? 'is-done-step'
      : '');

  return (
    <div className="checkout-header">
      <ul className="checkout-header-menu">
        <li className={`checkout-header-list ${className(1)}`}>
          <div className="checkout-header-item">
            <div className="checkout-header-icon">
              <h4 className="checkout-header-step">1</h4>
            </div>
            <h6 className="checkout-header-subtitle">訂單摘要</h6>
          </div>
        </li>
        <li className={`checkout-header-list ${className(2)}`}>
          <div className="checkout-header-item">
            <div className="checkout-header-icon">
              <h4 className="checkout-header-step">2</h4>
            </div>
            <h6 className="checkout-header-subtitle">顧客資訊</h6>
          </div>
        </li>
        <li className={`checkout-header-list ${className(3)}`}>
          <div className="checkout-header-item">
            <div className="checkout-header-icon">
              <h4 className="checkout-header-step">3</h4>
            </div>
            <h6 className="checkout-header-subtitle">報名表單</h6>
          </div>
        </li>
        <li className={`checkout-header-list ${className(4)}`}>
          <div className="checkout-header-item">
            <div className="checkout-header-icon">
              <h4 className="checkout-header-step">4</h4>
            </div>
            <h6 className="checkout-header-subtitle">付款</h6>
          </div>
        </li>
      </ul>
    </div>
  );
};

StepTracker.propTypes = {
  current: PropType.number.isRequired
};

export default StepTracker;
