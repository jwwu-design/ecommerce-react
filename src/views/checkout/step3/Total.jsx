import { ArrowLeftOutlined, CheckOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { CHECKOUT_STEP_2 } from '@/constants/routes';
import { useFormikContext } from 'formik';
import { displayMoney } from '@/helpers/utils';
import PropType from 'prop-types';
import React from 'react';
import { useHistory } from 'react-router-dom';

const Total = ({ isInternational, subtotal, onContinue, continueButtonText }) => {
  const history = useHistory();

  return (
    <>
      {/* <div className="basket-total text-right">
        <p className="basket-total-title">總計:</p>
        <h2 className="basket-total-amount">
          {displayMoney(subtotal + (isInternational ? 50 : 0))}
        </h2>
      </div> */}
      <br />
      {/*  ----- NEXT/PREV BUTTONS --------- */}
      <div className="checkout-shipping-action">
        <button
          className="button button-muted"
          onClick={() => history.push(CHECKOUT_STEP_2)}
          type="button"
        >
          <ArrowLeftOutlined />
          &nbsp;
          返回
        </button>
        {onContinue && (
          <button
            className="button"
            onClick={onContinue}
            type="button"
          >
            {continueButtonText || '下一步'}
            &nbsp;
            <ArrowRightOutlined />
          </button>
        )}
      </div>
    </>
  );
};

Total.propTypes = {
  isInternational: PropType.bool.isRequired,
  subtotal: PropType.number.isRequired,
  onContinue: PropType.func,
  continueButtonText: PropType.string
};

export default Total;
