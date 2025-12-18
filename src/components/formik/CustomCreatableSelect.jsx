/* eslint-disable react/forbid-prop-types */
import { useField } from 'formik';
import PropType from 'prop-types';
import React from 'react';
import CreatableSelect from 'react-select/creatable';

const CustomCreatableSelect = (props) => {
  const [field, meta, helpers] = useField(props);
  const {
    options, defaultValue, label, placeholder, isMulti, type, iid,
    isValidNewOption, formatCreateLabel, onCreateValidationError
  } = props;
  const { touched, error } = meta;
  const { setValue } = helpers;
  const [validationError, setValidationError] = React.useState('');

  // 將 field.value 轉換為 react-select 需要的格式
  const getCurrentValue = () => {
    if (!field.value) return isMulti ? [] : null;

    if (isMulti) {
      return Array.isArray(field.value)
        ? field.value.map((val) => ({ value: val, label: val }))
        : [];
    }
    return { value: field.value, label: field.value };
  };

  const handleChange = (newValue) => {
    // 清除驗證錯誤
    setValidationError('');

    if (Array.isArray(newValue)) {
      const arr = newValue.map((fieldKey) => fieldKey.value);
      setValue(arr);
    } else if (newValue) {
      setValue(newValue.value);
    } else {
      setValue(isMulti ? [] : '');
    }
  };

  const handleKeyDown = (e) => {
    if (type === 'number') {
      const { key } = e.nativeEvent;
      if (/\D/.test(key) && key !== 'Backspace') {
        e.preventDefault();
      }
    }
  };

  const handleInputChange = (inputValue, actionMeta) => {
    // 清除之前的驗證錯誤（當使用者重新輸入時）
    if (actionMeta.action === 'input-change') {
      setValidationError('');
    }
  };

  const handleBlur = (e) => {
    // 當使用者離開輸入框時，如果有輸入值但格式不正確，顯示錯誤
    const inputValue = e.target.value;
    if (inputValue && isValidNewOption && !isValidNewOption(inputValue)) {
      const errorMsg = onCreateValidationError
        ? onCreateValidationError(inputValue)
        : '輸入格式無效';
      setValidationError(errorMsg);
    }
  };

  const handleCreateOption = (inputValue) => {
    // 如果有提供驗證函數，先檢查
    if (isValidNewOption && !isValidNewOption(inputValue)) {
      // 無效時設定錯誤訊息
      const errorMsg = onCreateValidationError
        ? onCreateValidationError(inputValue)
        : '輸入格式無效';
      setValidationError(errorMsg);
      return;
    }

    // 清除驗證錯誤
    setValidationError('');

    // 新增選項
    const newOption = { value: inputValue, label: inputValue };
    if (isMulti) {
      const currentValues = field.value || [];
      setValue([...currentValues, inputValue]);
    } else {
      setValue(inputValue);
    }
  };

  return (
    <div className="input-group">
      {validationError ? (
        <span className="label-input label-error">{validationError}</span>
      ) : touched && error ? (
        <span className="label-input label-error">{error}</span>
      ) : (
        <label className="label-input" htmlFor={field.name}>{label}</label>
      )}
      <CreatableSelect
        isMulti={isMulti}
        placeholder={placeholder}
        name={field.name}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onCreateOption={handleCreateOption}
        value={getCurrentValue()}
        options={options}
        instanceId={iid}
        isValidNewOption={isValidNewOption}
        formatCreateLabel={formatCreateLabel}
        styles={{
          menu: (provided) => ({
            ...provided,
            zIndex: 10
          }),
          container: (provided) => ({
            ...provided, marginBottom: '0rem'
          }),
          control: (provided) => ({
            ...provided,
            border: (validationError || (touched && error)) ? '1px solid red' : '1px solid #cacaca'
          })
        }}
      />
    </div>
  );
};

CustomCreatableSelect.defaultProps = {
  isMulti: false,
  placeholder: '',
  iid: '',
  options: [],
  type: 'string',
  isValidNewOption: undefined,
  formatCreateLabel: undefined,
  onCreateValidationError: undefined
};

CustomCreatableSelect.propTypes = {
  options: PropType.arrayOf(PropType.object),
  defaultValue: PropType.oneOfType([
    PropType.object,
    PropType.array
  ]).isRequired,
  label: PropType.string.isRequired,
  placeholder: PropType.string,
  isMulti: PropType.bool,
  type: PropType.string,
  iid: PropType.string,
  isValidNewOption: PropType.func,
  formatCreateLabel: PropType.func,
  onCreateValidationError: PropType.func
};

export default CustomCreatableSelect;
