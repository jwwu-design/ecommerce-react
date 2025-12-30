import PropType from 'prop-types';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { applyFilter } from '@/redux/actions/filterActions';
import { CATEGORY_OPTIONS, SYSTEM_OPTIONS_BY_CATEGORY, REGION_OPTIONS } from '@/constants/productCategories';

const CategorySidebar = () => {
  const { filter } = useSelector((state) => ({
    filter: state.filter
  }));

  const dispatch = useDispatch();

  const [selectedCategory, setSelectedCategory] = useState(filter.category || '');
  const [selectedSystem, setSelectedSystem] = useState(filter.system || '');
  const [selectedRegion, setSelectedRegion] = useState(filter.region || '');

  const systemOptions = selectedCategory ? (SYSTEM_OPTIONS_BY_CATEGORY[selectedCategory] || []) : [];

  useEffect(() => {
    setSelectedCategory(filter.category || '');
    setSelectedSystem(filter.system || '');
    setSelectedRegion(filter.region || '');
  }, [filter]);

  const handleCategoryChange = (category) => {
    const newCategory = category === selectedCategory ? '' : category;
    setSelectedCategory(newCategory);
    setSelectedSystem(''); // 清空系統選擇

    dispatch(applyFilter({
      ...filter,
      category: newCategory,
      system: ''
    }));
  };

  const handleSystemChange = (system) => {
    const newSystem = system === selectedSystem ? '' : system;
    setSelectedSystem(newSystem);

    dispatch(applyFilter({
      ...filter,
      system: newSystem
    }));
  };

  const handleRegionChange = (region) => {
    const newRegion = region === selectedRegion ? '' : region;
    setSelectedRegion(newRegion);

    dispatch(applyFilter({
      ...filter,
      region: newRegion
    }));
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedSystem('');
    setSelectedRegion('');

    dispatch(applyFilter({
      ...filter,
      category: '',
      system: '',
      region: ''
    }));
  };

  return (
    <div className="category-sidebar">
      <div className="category-sidebar-header">
        <h3>課程分類</h3>
        {(selectedCategory || selectedSystem || selectedRegion) && (
          <button
            type="button"
            className="clear-filters-btn"
            onClick={handleClearFilters}
          >
            清除篩選
          </button>
        )}
      </div>

      {/* 地區 */}
      <div className="category-section">
        <h4>地區</h4>
        <ul className="category-list">
          {REGION_OPTIONS.map((region) => (
            <li key={region}>
              <button
                type="button"
                className={`category-item ${selectedRegion === region ? 'active' : ''}`}
                onClick={() => handleRegionChange(region)}
              >
                {region}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 大類 */}
      <div className="category-section">
        <h4>大類</h4>
        <ul className="category-list">
          {CATEGORY_OPTIONS.map((category) => (
            <li key={category}>
              <button
                type="button"
                className={`category-item ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 系統 */}
      {selectedCategory && (
        <div className="category-section">
          <h4>系統</h4>
          <ul className="category-list">
            {systemOptions.map((system) => (
              <li key={system}>
                <button
                  type="button"
                  className={`category-item ${selectedSystem === system ? 'active' : ''}`}
                  onClick={() => handleSystemChange(system)}
                >
                  {system}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

CategorySidebar.propTypes = {};

export default CategorySidebar;
