/* eslint-disable no-nested-ternary */
import { useDidMount } from '@/hooks';
import PropType from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, withRouter } from 'react-router-dom';
import { applyFilter, resetFilter } from '@/redux/actions/filterActions';
import { selectMax, selectMin } from '@/selectors/selector';
import PriceRange from './PriceRange';

const Filters = ({ closeModal }) => {
  const { filter, isLoading, products } = useSelector((state) => ({
    filter: state.filter,
    isLoading: state.app.loading,
    products: state.products.items
  }));
  const [field, setFilter] = useState({
    brand: filter.brand,
    minPrice: filter.minPrice,
    maxPrice: filter.maxPrice,
    sortBy: filter.sortBy
  });
  const dispatch = useDispatch();
  const history = useHistory();
  const didMount = useDidMount();

  const max = selectMax(products);
  const min = selectMin(products);

  useEffect(() => {
    if (didMount && window.screen.width <= 480) {
      history.push('/');
    }

    if (didMount && closeModal) closeModal();

    setFilter(filter);
    window.scrollTo(0, 0);
  }, [filter]);

  const onPriceChange = (minVal, maxVal) => {
    setFilter({ ...field, minPrice: minVal, maxPrice: maxVal });
  };

  const onBrandFilterChange = (e) => {
    const val = e.target.value;
    setFilter({ ...field, brand: val });
  };

  const onSortFilterChange = (e) => {
    setFilter({ ...field, sortBy: e.target.value });
  };

  const onApplyFilter = () => {
    const isChanged = Object.keys(field).some((key) => field[key] !== filter[key]);

    if (field.minPrice > field.maxPrice) {
      return;
    }

    if (isChanged) {
      dispatch(applyFilter(field));
    } else {
      closeModal();
    }
  };

  const onResetFilter = () => {
    const filterFields = ['brand', 'minPrice', 'maxPrice', 'sortBy'];

    if (filterFields.some((key) => !!filter[key])) {
      dispatch(resetFilter());
    } else {
      closeModal();
    }
  };

  return (
    <div className="filters">
      <div className="filters-field">
        <span>品牌</span>
        <br />
        <br />
        {products.length === 0 && isLoading ? (
          <h5 className="text-subtle">載入篩選中</h5>
        ) : (
          <select
            className="filters-brand"
            value={field.brand}
            disabled={isLoading || products.length === 0}
            onChange={onBrandFilterChange}
          >
            <option value="">所有品牌</option>
            <option value="ares">Ares</option>
            {/* <option value="salt">Salt Maalat</option>
            <option value="betsin">Betsin Maalat</option>
            <option value="black">Black Kibal</option>
            <option value="sexbomb">Sexbomb</option> */}
          </select>
        )}
      </div>
      <div className="filters-field">
        <span>排序方式</span>
        <br />
        <br />
        <select
          className="filters-sort-by d-block"
          value={field.sortBy}
          disabled={isLoading || products.length === 0}
          onChange={onSortFilterChange}
        >
          <option value="">無</option>
          {/* <option value="name-asc">名稱 A → Z</option>
          <option value="name-desc">名稱 Z → A</option> */}
          <option value="price-desc">價格 高 → 低</option>
          <option value="price-asc">價格 低 → 高</option>
        </select>
      </div>
      <div className="filters-field">
        <span>價格範圍</span>
        <br />
        <br />
        {(products.length === 0 && isLoading) || max === 0 ? (
          <h5 className="text-subtle">載入篩選中</h5>
        ) : products.length === 1 ? (
          <h5 className="text-subtle">無價格範圍</h5>
        ) : (
          <PriceRange
            min={min}
            max={max}
            initMin={field.minPrice}
            initMax={field.maxPrice}
            isLoading={isLoading}
            onPriceChange={onPriceChange}
            productsCount={products.length}
          />
        )}
      </div>
      <div className="filters-action">
        <button
          className="filters-button button button-small"
          disabled={isLoading || products.length === 0}
          onClick={onApplyFilter}
          type="button"
        >
          套用篩選
        </button>
        <button
          className="filters-button button button-border button-small"
          disabled={isLoading || products.length === 0}
          onClick={onResetFilter}
          type="button"
        >
          重設篩選
        </button>
      </div>
    </div>
  );
};

Filters.propTypes = {
  closeModal: PropType.func.isRequired
};

export default withRouter(Filters);
