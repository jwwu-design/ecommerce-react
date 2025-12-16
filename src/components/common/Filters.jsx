/* eslint-disable no-nested-ternary */
import { useDidMount } from '@/hooks';
import PropType from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, withRouter } from 'react-router-dom';
import { applyFilter, resetFilter } from '@/redux/actions/filterActions';
import { CATEGORY_OPTIONS, SYSTEM_OPTIONS_BY_CATEGORY } from '@/constants/productCategories';

const Filters = ({ closeModal }) => {
  const { filter, isLoading, products } = useSelector((state) => ({
    filter: state.filter,
    isLoading: state.app.loading,
    products: state.products.items
  }));

  const [field, setFilter] = useState({
    region: filter.region,
    category: filter.category,
    system: filter.system,
    startDate: filter.startDate,
    endDate: filter.endDate,
    sortBy: filter.sortBy
  });

  const dispatch = useDispatch();
  const history = useHistory();
  const didMount = useDidMount();

  const systemOptions = field.category ? (SYSTEM_OPTIONS_BY_CATEGORY[field.category] || []) : [];

  useEffect(() => {
    if (didMount && window.screen.width <= 480) {
      history.push('/');
    }

    if (didMount && closeModal) closeModal();

    setFilter(filter);
    window.scrollTo(0, 0);
  }, [filter]);

  const onRegionFilterChange = (e) => {
    setFilter({ ...field, region: e.target.value });
  };

  const onCategoryFilterChange = (e) => {
    const newCategory = e.target.value;
    setFilter({ ...field, category: newCategory, system: '' }); // 切換大類時清空系統
  };

  const onSystemFilterChange = (e) => {
    setFilter({ ...field, system: e.target.value });
  };

  const onStartDateChange = (e) => {
    setFilter({ ...field, startDate: e.target.value });
  };

  const onEndDateChange = (e) => {
    setFilter({ ...field, endDate: e.target.value });
  };

  const onSortFilterChange = (e) => {
    setFilter({ ...field, sortBy: e.target.value });
  };

  const onApplyFilter = () => {
    const isChanged = Object.keys(field).some((key) => field[key] !== filter[key]);

    if (isChanged) {
      dispatch(applyFilter(field));
    } else {
      closeModal();
    }
  };

  const onResetFilter = () => {
    const filterFields = ['region', 'category', 'system', 'startDate', 'endDate', 'sortBy'];

    if (filterFields.some((key) => !!filter[key])) {
      dispatch(resetFilter());
    } else {
      closeModal();
    }
  };

  return (
    <div className="filters">


      <div className="filters-field">
        <span>大類</span>
        <br />
        <br />
        {products.length === 0 && isLoading ? (
          <h5 className="text-subtle">載入篩選中</h5>
        ) : (
          <select
            className="filters-category"
            value={field.category}
            disabled={isLoading || products.length === 0}
            onChange={onCategoryFilterChange}
          >
            <option value="">所有大類</option>
            {CATEGORY_OPTIONS.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        )}
      </div>

      <div className="filters-field">
        <span>系統</span>
        <br />
        <br />
        {products.length === 0 && isLoading ? (
          <h5 className="text-subtle">載入篩選中</h5>
        ) : (
          <select
            className="filters-system"
            value={field.system}
            disabled={isLoading || products.length === 0 || !field.category}
            onChange={onSystemFilterChange}
          >
            <option value="">{field.category ? '所有系統' : '請先選擇大類'}</option>
            {systemOptions.map(system => (
              <option key={system} value={system}>{system}</option>
            ))}
          </select>
        )}
      </div>

      <div className="filters-field">
        <span>地區</span>
        <br />
        <br />
        {products.length === 0 && isLoading ? (
          <h5 className="text-subtle">載入篩選中</h5>
        ) : (
          <select
            className="filters-region"
            value={field.region}
            disabled={isLoading || products.length === 0}
            onChange={onRegionFilterChange}
          >
            <option value="">所有地區</option>
            <option value="台北">台北</option>
            <option value="台南">台南</option>
          </select>
        )}
      </div>

      <div className="filters-field">
        <span>課程日期範圍</span>
        <br />
        <br />
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="MM/DD"
            value={field.startDate}
            onChange={onStartDateChange}
            disabled={isLoading || products.length === 0}
            style={{
              flex: 1,
              padding: '0.8rem',
              border: '1px solid #cacaca',
              fontSize: '1.4rem'
            }}
          />
          <span>~</span>
          <input
            type="text"
            placeholder="MM/DD"
            value={field.endDate}
            onChange={onEndDateChange}
            disabled={isLoading || products.length === 0}
            style={{
              flex: 1,
              padding: '0.8rem',
              border: '1px solid #cacaca',
              fontSize: '1.4rem'
            }}
          />
        </div>
        <small style={{ color: '#666', fontSize: '1.2rem', marginTop: '0.5rem', display: 'block' }}>
          格式: MM/DD (例如: 12/15)
        </small>
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
          <option value="price-desc">價格 高 → 低</option>
          <option value="price-asc">價格 低 → 高</option>
        </select>
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
