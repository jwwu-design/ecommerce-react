import React, { useState } from 'react';
import { useField } from 'formik';
import PropType from 'prop-types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CustomDateRangePicker = (props) => {
  const { label, disabled, placeholder, region, field: fieldProp } = props;
  const [field, meta, helpers] = useField(fieldProp.name);
  const { touched, error } = meta;
  const { setValue } = helpers;

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isRange, setIsRange] = useState(false);

  // 將已選擇的日期字串解析為 Date 對象
  const parseDateString = (dateStr) => {
    if (!dateStr) return null;

    // 處理單一日期 (12/15)
    if (!dateStr.includes('~')) {
      const [month, day] = dateStr.split('/').map(Number);
      const year = new Date().getFullYear();
      return new Date(year, month - 1, day);
    }

    return null;
  };

  // 格式化日期為 MM/DD
  const formatDate = (date) => {
    if (!date) return '';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}`;
  };

  // 添加日期到列表
  const addDate = () => {
    if (!startDate) return;

    let dateString = '';
    if (isRange && endDate) {
      dateString = `${formatDate(startDate)}~${formatDate(endDate)}`;
    } else {
      dateString = formatDate(startDate);
    }

    // 檢查是否已存在
    const currentDates = Array.isArray(field.value) ? field.value : [];
    if (!currentDates.includes(dateString)) {
      setValue([...currentDates, dateString]);
    }

    // 清空選擇
    setStartDate(null);
    setEndDate(null);
    setIsRange(false);
  };

  // 移除日期
  const removeDate = (dateToRemove) => {
    const currentDates = Array.isArray(field.value) ? field.value : [];
    setValue(currentDates.filter(d => d !== dateToRemove));
  };

  return (
    <div className="input-group">
      {touched && error ? (
        <span className="label-input label-error">
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </span>
      ) : (
        <label className="label-input" htmlFor={field.name}>{label}</label>
      )}

      <div className="date-range-picker-container">
        {/* 日期類型選擇 */}
        <div className="date-type-selector" style={{ marginBottom: '1rem' }}>
          <label style={{ marginRight: '1rem', fontSize: '1.4rem' }}>
            <input
              type="radio"
              checked={!isRange}
              onChange={() => {
                setIsRange(false);
                setEndDate(null);
              }}
              disabled={disabled || !region}
              style={{ marginRight: '0.5rem' }}
            />
            單日
          </label>
          <label style={{ fontSize: '1.4rem' }}>
            <input
              type="radio"
              checked={isRange}
              onChange={() => setIsRange(true)}
              disabled={disabled || !region}
              style={{ marginRight: '0.5rem' }}
            />
            日期區間
          </label>
        </div>

        {/* 日期選擇器 */}
        <div className="date-pickers" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText={region ? (isRange ? "開始日期" : "選擇日期") : "請先選擇地區"}
              dateFormat="yyyy/MM/dd"
              disabled={disabled || !region}
              className={touched && error ? 'input-error' : ''}
              minDate={new Date()}
              isClearable
            />
          </div>

          {isRange && (
            <div style={{ flex: 1 }}>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                placeholderText="結束日期"
                dateFormat="yyyy/MM/dd"
                disabled={disabled || !region || !startDate}
                className={touched && error ? 'input-error' : ''}
                isClearable
              />
            </div>
          )}

          <button
            type="button"
            onClick={addDate}
            disabled={disabled || !region || !startDate || (isRange && !endDate)}
            className="button button-small"
            style={{ height: '38px', whiteSpace: 'nowrap' }}
          >
            + 新增
          </button>
        </div>

        {/* 已選擇的日期列表 */}
        <div className="selected-dates-list">
          {Array.isArray(field.value) && field.value.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {field.value.map((date, index) => {
                // 確保 date 是字符串
                const dateString = typeof date === 'string' ? date : String(date);
                return (
                  <div
                    key={index}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.5rem 1rem',
                      background: '#f0f0f0',
                      borderRadius: '4px',
                      fontSize: '1.4rem'
                    }}
                  >
                    <span>{dateString}</span>
                    <button
                      type="button"
                      onClick={() => removeDate(date)}
                      disabled={disabled}
                      style={{
                        marginLeft: '0.5rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#ff4d4f',
                        fontSize: '1.4rem',
                        padding: 0
                      }}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: '#999', fontSize: '1.4rem', margin: 0 }}>
              {region ? '尚未新增日期' : '請先選擇地區'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

CustomDateRangePicker.defaultProps = {
  placeholder: '',
  disabled: false,
  region: ''
};

CustomDateRangePicker.propTypes = {
  label: PropType.string.isRequired,
  disabled: PropType.bool,
  placeholder: PropType.string,
  region: PropType.string,
  field: PropType.shape({
    name: PropType.string.isRequired,
    value: PropType.any
  }).isRequired
};

export default CustomDateRangePicker;
