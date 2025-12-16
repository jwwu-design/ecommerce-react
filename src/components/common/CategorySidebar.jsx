import PropType from 'prop-types';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { applyFilter } from '@/redux/actions/filterActions';

const CategorySidebar = () => {
  const { filter } = useSelector((state) => ({
    filter: state.filter
  }));

  const dispatch = useDispatch();

  const [selectedCategory, setSelectedCategory] = useState(filter.category || '');
  const [selectedSystem, setSelectedSystem] = useState(filter.system || '');

  // 固定的大類選項
  const categoryOptions = ['ESG項目', '資安項目', '品質系統'];

  // 根據選中的大類提供系統選項
  const systemOptionsByCategory = {
    'ESG項目': [
      'ISO 14064-1',
      'ISO 14064-2',
      'ISO 14067',
      'ISO 14064-1+14067 雙主導查證員',
      'ISO 50001',
      'ISO 14068-1',
      'ISO 46001',
      '永續報告書撰寫技巧暨GRI 2021 新版解析(GRI、SASB、TCFD)',
      'AA1000永續報告查證師',
      'ISO 32210與永續金融管理師',
      'iPAS 淨零碳規劃管理師',
      'CBAM企業內控管理人才培訓班',
      'GHG Protocol核心盤查與報告實務'
    ],
    '資安項目': [
      'ISO 27001',
      'ISO 27701',
      'ISO 27017/27018',
      'ISO 42001'
    ],
    '品質系統': [
      'ISO 9001',
      'ISO 14001',
      'ISO 45001',
      'ISO 22000',
      'ISO 13485',
      'ISO 22716',
      'ISO 19011',
      'ISO 16949'
    ]
  };

  const systemOptions = selectedCategory ? (systemOptionsByCategory[selectedCategory] || []) : [];

  useEffect(() => {
    setSelectedCategory(filter.category || '');
    setSelectedSystem(filter.system || '');
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

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedSystem('');

    dispatch(applyFilter({
      ...filter,
      category: '',
      system: ''
    }));
  };

  return (
    <div className="category-sidebar">
      <div className="category-sidebar-header">
        <h3>課程分類</h3>
        {(selectedCategory || selectedSystem) && (
          <button
            type="button"
            className="clear-filters-btn"
            onClick={handleClearFilters}
          >
            清除篩選
          </button>
        )}
      </div>

      {/* 大類 */}
      <div className="category-section">
        <h4>大類</h4>
        <ul className="category-list">
          {categoryOptions.map((category) => (
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
