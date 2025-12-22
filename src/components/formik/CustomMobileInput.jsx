/* eslint-disable react/forbid-prop-types */
import { useField } from 'formik';
import PropType from 'prop-types';
import React from 'react';

const CustomMobileInput = (props) => {
  const [field, meta] = useField(props);
  const { label, placeholder, disabled } = props;
  const { touched, error } = meta;

  // 格式化手機號碼：只允許數字
  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // 只保留數字
    field.onChange({ target: { name: field.name, value } });
  };

  // 安全地處理錯誤訊息
  const getErrorMessage = () => {
    if (!error) return '';
    if (typeof error === 'string') return error;
    return '請輸入正確的手機號碼。';
  };

  return (
    <div className="input-group">
      {touched && error ? (
        <span className="label-input label-error">{getErrorMessage()}</span>
      ) : (
        <label className="label-input" htmlFor={field.name}>{label}</label>
      )}
      <input
        type="tel"
        id={field.name}
        name={field.name}
        className={`input-form ${touched && error ? 'input-error' : ''}`}
        value={field.value || ''}
        onChange={handleChange}
        onBlur={field.onBlur}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={10}
      />
    </div>
  );
};

CustomMobileInput.defaultProps = {
  label: '* 聯絡電話',
  placeholder: '0912345678',
  disabled: false
};

CustomMobileInput.propTypes = {
  label: PropType.string,
  placeholder: PropType.string,
  disabled: PropType.bool
};

export default CustomMobileInput;
