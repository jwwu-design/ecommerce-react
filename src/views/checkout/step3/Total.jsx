import { displayMoney } from '@/helpers/utils';
import PropType from 'prop-types';
import React from 'react';

const Total = ({ isInternational, subtotal, discount = 0 }) => {
  const shippingFee = isInternational ? 50 : 0;
  const total = Math.max(0, subtotal + shippingFee - discount);

  return (
    <div className="checkout-total d-flex-end padding-right-m">
      <table>
        <tbody>
          <tr>
            <td>
              <span className="d-block margin-0 padding-right-s text-right">
                小計: &nbsp;
              </span>
            </td>
            <td>
              <h4 className="basket-total-amount text-subtle text-right margin-0">
                {displayMoney(subtotal)}
              </h4>
            </td>
          </tr>

          {/* 運費 */}
          {shippingFee > 0 && (
            <tr>
              <td>
                <span className="d-block margin-0 padding-right-s text-right">
                  國際運費: &nbsp;
                </span>
              </td>
              <td>
                <h4 className="basket-total-amount text-subtle text-right margin-0">
                  {displayMoney(shippingFee)}
                </h4>
              </td>
            </tr>
          )}

          {/* 優惠折扣 */}
          {discount > 0 && (
            <tr>
              <td>
                <span className="d-block margin-0 padding-right-s text-right text-success">
                  優惠折扣: &nbsp;
                </span>
              </td>
              <td>
                <h4 className="basket-total-amount text-success text-right margin-0">
                  - {displayMoney(discount)}
                </h4>
              </td>
            </tr>
          )}

          <tr>
            <td>
              <span className="d-block margin-0 padding-right-s text-right">
                總計: &nbsp;
              </span>
            </td>
            <td>
              <h2 className="basket-total-amount text-right">
                {displayMoney(total)}
              </h2>
            </td>
          </tr>

          {discount > 0 && (
            <tr>
              <td colSpan="2">
                <p className="text-subtle text-right" style={{ fontSize: '1.2rem', margin: '0.5rem 0 0 0' }}>
                  已節省 {displayMoney(discount)}
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

Total.propTypes = {
  isInternational: PropType.bool.isRequired,
  subtotal: PropType.number.isRequired,
  discount: PropType.number
};

export default Total;
