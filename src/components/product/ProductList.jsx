/* eslint-disable react/forbid-prop-types */
import { Boundary, MessageDisplay } from '@/components/common';
import PropType from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setRequestStatus } from '@/redux/actions/miscActions';
import { getProducts, getProductsSuccess } from '@/redux/actions/productActions';
import firebase from '@/services/firebase';

const ProductList = (props) => {
  const {
    products, filteredProducts, isLoading, requestStatus, children
  } = props;
  const [isFetching, setFetching] = useState(false);
  const dispatch = useDispatch();
  const filter = useSelector((state) => state.filter);

  const fetchProducts = () => {
    setFetching(true);
    dispatch(getProducts(products.lastRefKey));
  };

  // 檢查是否有任何篩選條件
  const hasActiveFilters = () => {
    return !!(filter.region || filter.category || filter.system);
  };

  // 使用篩選條件載入商品
  const fetchProductsWithFilters = async () => {
    try {
      setFetching(true);
      dispatch(setLoading(true));
      dispatch(setRequestStatus(null));

      const result = await firebase.getProductsWithFilters({
        region: filter.region,
        category: filter.category,
        system: filter.system
      });

      if (result.products.length === 0) {
        dispatch(setRequestStatus('查無符合條件的商品。'));
      } else {
        dispatch(getProductsSuccess({
          products: result.products,
          lastKey: null, // 已載入全部，不需要 lastKey
          total: result.total
        }));
        dispatch(setRequestStatus(''));
      }
    } catch (error) {
      console.error('Failed to fetch products with filters:', error);
      dispatch(setRequestStatus(error?.message || '取得商品失敗'));
    } finally {
      setFetching(false);
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (products.items.length === 0 || !products.lastRefKey) {
      fetchProducts();
    }

    window.scrollTo(0, 0);
    return () => dispatch(setLoading(false));
  }, []);

  // 監聽篩選條件變化，重新載入商品
  useEffect(() => {
    if (hasActiveFilters()) {
      fetchProductsWithFilters();
    } else if (products.items.length > 0) {
      // 清除篩選時，重新載入初始商品
      dispatch(getProductsSuccess({
        products: [],
        lastKey: null,
        total: 0
      }));
      fetchProducts();
    }
  }, [filter.region, filter.category, filter.system]);

  useEffect(() => {
    setFetching(false);
  }, [products.lastRefKey]);

  if (filteredProducts.length === 0 && !isLoading) {
    return (
      <MessageDisplay message={requestStatus?.message || '找不到任何商品。'} />
    );
  } if (filteredProducts.length === 0 && requestStatus) {
    return (
      <MessageDisplay
        message={requestStatus?.message || '發生錯誤 :('}
        action={fetchProducts}
        buttonLabel="重試"
      />
    );
  }
  return (
    <Boundary>
      {children}
      {/* Show 'Show More' button only when no filters applied and more products available */}
      {!hasActiveFilters() && products.items.length < products.total && (
        <div className="d-flex-center padding-l">
          <button
            className="button button-small"
            disabled={isFetching}
            onClick={fetchProducts}
            type="button"
          >
            {isFetching ? '正在載入商品...' : '顯示更多商品'}
          </button>
        </div>
      )}
      {/* Show info when filters are applied and all products are loaded */}
      {hasActiveFilters() && filteredProducts.length > 0 && !isLoading && (
        <div className="d-flex-center padding-l">
          <p className="text-subtle">已顯示全部 {filteredProducts.length} 項符合條件的商品</p>
        </div>
      )}
    </Boundary>
  );
};

ProductList.defaultProps = {
  requestStatus: null
};

ProductList.propTypes = {
  products: PropType.object.isRequired,
  filteredProducts: PropType.array.isRequired,
  isLoading: PropType.bool.isRequired,
  requestStatus: PropType.string,
  children: PropType.oneOfType([
    PropType.arrayOf(PropType.node),
    PropType.node
  ]).isRequired
};

export default ProductList;
