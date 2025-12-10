import { displayMoney } from '@/helpers/utils';
import PropType from 'prop-types';
import React from 'react';

const Total = ({ isInternational, subtotal }) => {
  return (
    <div className="basket-total text-right">
      <p className="basket-total-title">總計:</p>
      <h2 className="basket-total-amount">
        {displayMoney(subtotal + (isInternational ? 50 : 0))}
      </h2>
    </div>
  );
};

Total.propTypes = {
  isInternational: PropType.bool.isRequired,
  subtotal: PropType.number.isRequired
};

export default Total;
