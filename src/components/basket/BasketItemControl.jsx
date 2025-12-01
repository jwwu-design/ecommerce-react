import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import PropType from 'prop-types';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addQtyItem, minusQtyItem } from '@/redux/actions/basketActions';
import firebaseInstance from '@/services/firebase';

const BasketItemControl = ({ product }) => {
  const dispatch = useDispatch();
  const userId = useSelector(state => state.auth?.uid);
  const basket = useSelector(state => state.basket?.items || []);

  const syncCart = async () => {
    if (userId) {
      try {
        await firebaseInstance.updateCartInFirebase(userId, basket);
      } catch (e) {
        console.error('Failed to sync cart to Firebase', e);
      }
    }
  };

  const onAddQty = () => {
    if (product.quantity < product.maxQuantity) {
      dispatch(addQtyItem(product.id));
      syncCart();
    }
  };

  const onMinusQty = () => {
    if (product.maxQuantity >= product.quantity && product.quantity !== 0) {
      dispatch(minusQtyItem(product.id));
      syncCart();
    }
  };

  return (
    <div className="basket-item-control">
      <button
        className="button button-border button-border-gray button-small basket-control basket-control-add"
        disabled={product.maxQuantity === product.quantity}
        onClick={onAddQty}
        type="button"
      >
        <PlusOutlined style={{ fontSize: '9px' }} />
      </button>
      <button
        className="button button-border button-border-gray button-small basket-control basket-control-minus"
        disabled={product.quantity === 1}
        onClick={onMinusQty}
        type="button"
      >
        <MinusOutlined style={{ fontSize: '9px' }} />
      </button>
    </div>
  );
};

BasketItemControl.propTypes = {
  product: PropType.shape({
    id: PropType.string,
    name: PropType.string,
    brand: PropType.string,
    price: PropType.number,
    quantity: PropType.number,
    maxQuantity: PropType.number,
    description: PropType.string,
    keywords: PropType.arrayOf(PropType.string),
    selectedSize: PropType.string,
    selectedColor: PropType.string,
    imageCollection: PropType.arrayOf(PropType.object),
    sizes: PropType.arrayOf(PropType.oneOfType([PropType.number, PropType.string])),
    image: PropType.string,
    imageUrl: PropType.string,
    isFeatured: PropType.bool,
    isRecommended: PropType.bool,
  }).isRequired,
};

export default BasketItemControl;
