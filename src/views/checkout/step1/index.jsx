import { ArrowRightOutlined, ShopOutlined } from '@ant-design/icons';
import { BasketItem } from '@/components/basket';
import { CHECKOUT_STEP_2 } from '@/constants/routes';
import { displayMoney } from '@/helpers/utils';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import PropType from 'prop-types';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { StepTracker } from '../components';
import withCheckout from '../hoc/withCheckout';

const OrderSummary = ({ basket, subtotal }) => {
  useDocumentTitle('結帳步驟 1 | Ares');
  useScrollTop();
  const dispatch = useDispatch();
  const history = useHistory();
  const onClickPrevious = () => history.push('/');
  const onClickNext = () => history.push(CHECKOUT_STEP_2);

  return (
    <div className="checkout">
      <StepTracker current={1} />
      <div className="checkout-step-1">
        <h3 className="text-center">訂單摘要</h3>
        <span className="d-block text-center">檢視您購物車中的商品。</span>
        <br />
        <div className="checkout-items">
          {basket.map((product) => (
            <BasketItem
              basket={basket}
              dispatch={dispatch}
              key={product.id}
              product={product}
            />
          ))}
        </div>
        <br />
        <div className="basket-total text-right">
          <p className="basket-total-title">小計：</p>
          <h2 className="basket-total-amount">{displayMoney(subtotal)}</h2>
        </div>
        <br />
        <div className="checkout-shipping-action">
          <button
            className="button button-muted"
            onClick={onClickPrevious}
            type="button"
          >
            <ShopOutlined />
            &nbsp;
            繼續購物
          </button>
          <button
            className="button"
            onClick={onClickNext}
            type="submit"
          >
            下一步
            &nbsp;
            <ArrowRightOutlined />
          </button>
        </div>
      </div>
    </div>
  );
};

OrderSummary.propTypes = {
  basket: PropType.arrayOf(PropType.object).isRequired,
  subtotal: PropType.number.isRequired
};

export default withCheckout(OrderSummary);
