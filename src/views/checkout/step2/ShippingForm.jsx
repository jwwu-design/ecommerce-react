/* eslint-disable jsx-a11y/label-has-associated-control */
import { CustomInput, CustomMobileInput } from '@/components/formik';
import { Field, useFormikContext } from 'formik';
import React from 'react';

const ShippingForm = () => {
  const { values, setFieldValue } = useFormikContext();

  return (
    <div className="checkout-shipping-wrapper">
      <div className="checkout-shipping-form">
        {/* 學員姓名 & 公司名稱 */}
        <div className="checkout-fieldset">
          <div className="d-block checkout-field">
            <Field
              name="fullname"
              type="text"
              label="* 學員姓名"
              placeholder="輸入學員姓名"
              component={CustomInput}
              style={{ textTransform: 'capitalize' }}
            />
          </div>
          <div className="d-block checkout-field">
            <Field
              name="address"
              type="text"
              label="* 聯絡地址（寄送證書與發票）"
              placeholder="輸入完整地址"
              component={CustomInput}
            />
          </div>
        </div>

        {/* 聯絡電話 & 電子郵件 */}
        <div className="checkout-fieldset">
          <div className="d-block checkout-field">
            <CustomMobileInput name="mobile" defaultValue={values.mobile} label="* 聯絡電話" />
          </div>
          <div className="d-block checkout-field">
            <Field
              name="email"
              type="email"
              label="* 電子郵件信箱"
              placeholder="輸入電子郵件"
              component={CustomInput}
            />
          </div>
        </div>

        {/* 發票抬頭/統編 & 聯絡地址 */}
        <div className="checkout-fieldset">
          <div className="d-block checkout-field">
            <Field
              name="companyName"
              type="text"
              label="* 公司名稱"
              placeholder="輸入公司名稱"
              component={CustomInput}
            />
          </div>
          <div className="d-block checkout-field">
            <Field
              name="invoiceInfo"
              type="text"
              label="* 發票的抬頭名稱／公司統編"
              placeholder="輸入發票抬頭或統編"
              component={CustomInput}
            />
          </div>
        </div>

        {/* 英文姓名 */}
        <div className="checkout-fieldset">
          <div className="d-block checkout-field">
            <Field
              name="englishName"
              type="text"
              label="* 英文姓名或護照英文名（請用大寫字母，於證書上使用）"
              placeholder="輸入英文姓名（大寫）"
              component={CustomInput}
            />
          </div>
        </div>

        {/* 葷/素食 */}
        <div className="checkout-fieldset">
          <Field name="dietPreference">
            {({ field, meta }) => (
              <div className="checkout-field">
                {meta.touched && meta.error ? (
                  <span className="label-input label-error">{meta.error}</span>
                ) : (
                  <label className="label-input">* 葷 / 素食</label>
                )}
                <div className="checkout-radio-group">
                  <label className="checkout-radio-label">
                    <input
                      type="radio"
                      name={field.name}
                      value="葷"
                      checked={field.value === '葷'}
                      onChange={() => setFieldValue('dietPreference', '葷')}
                    />
                    <span>葷</span>
                  </label>
                  <label className="checkout-radio-label">
                    <input
                      type="radio"
                      name={field.name}
                      value="素(蛋奶素)"
                      checked={field.value === '素(蛋奶素)'}
                      onChange={() => setFieldValue('dietPreference', '素(蛋奶素)')}
                    />
                    <span>素(蛋奶素)</span>
                  </label>
                  <label className="checkout-radio-label">
                    <input
                      type="radio"
                      name={field.name}
                      value="素(全素)"
                      checked={field.value === '素(全素)'}
                      onChange={() => setFieldValue('dietPreference', '素(全素)')}
                    />
                    <span>素(全素)</span>
                  </label>
                </div>
              </div>
            )}
          </Field>
        </div>

        {/* 優惠券序號 */}
        <div className="checkout-fieldset">
          <Field name="couponType">
            {({ field, meta }) => (
              <div className="checkout-field">
                {meta.touched && meta.error ? (
                  <span className="label-input label-error">{meta.error}</span>
                ) : (
                  <label className="label-input">* 優惠券序號</label>
                )}
                <div className="checkout-radio-group">
                  <label className="checkout-radio-label">
                    <input
                      type="radio"
                      name={field.name}
                      value="無"
                      checked={field.value === '無'}
                      onChange={() => {
                        setFieldValue('couponType', '無');
                        setFieldValue('couponCode', '');
                      }}
                    />
                    <span>無</span>
                  </label>
                  <label className="checkout-radio-label">
                    <input
                      type="radio"
                      name={field.name}
                      value="序號"
                      checked={field.value === '序號'}
                      onChange={() => setFieldValue('couponType', '序號')}
                    />
                    <span>填寫序號</span>
                  </label>
                </div>
                {field.value === '序號' && (
                  <div className="mt-2">
                    <Field
                      name="couponCode"
                      type="text"
                      placeholder="輸入優惠券序號"
                      component={CustomInput}
                      label="序號："
                    />
                  </div>
                )}
              </div>
            )}
          </Field>
        </div>

        {/* 資訊來源 */}
        <div className="checkout-fieldset">
          <Field name="infoSource">
            {({ field, meta }) => (
              <div className="checkout-field">
                {meta.touched && meta.error ? (
                  <span className="label-input label-error">{meta.error}</span>
                ) : (
                  <label className="label-input">* 資訊來源</label>
                )}
                <div className="checkout-radio-group">
                  <label className="checkout-radio-label">
                    <input
                      type="radio"
                      name={field.name}
                      value="亞瑞仕臉書官方粉絲團"
                      checked={field.value === '亞瑞仕臉書官方粉絲團'}
                      onChange={() => {
                        setFieldValue('infoSource', '亞瑞仕臉書官方粉絲團');
                        setFieldValue('infoSourceOther', '');
                      }}
                    />
                    <span>亞瑞仕臉書官方粉絲團</span>
                  </label>
                  <label className="checkout-radio-label">
                    <input
                      type="radio"
                      name={field.name}
                      value="亞瑞仕官方LINE@"
                      checked={field.value === '亞瑞仕官方LINE@'}
                      onChange={() => {
                        setFieldValue('infoSource', '亞瑞仕官方LINE@');
                        setFieldValue('infoSourceOther', '');
                      }}
                    />
                    <span>亞瑞仕官方LINE@</span>
                  </label>
                  <label className="checkout-radio-label">
                    <input
                      type="radio"
                      name={field.name}
                      value="亞瑞仕官方Instagram"
                      checked={field.value === '亞瑞仕官方Instagram'}
                      onChange={() => {
                        setFieldValue('infoSource', '亞瑞仕官方Instagram');
                        setFieldValue('infoSourceOther', '');
                      }}
                    />
                    <span>亞瑞仕官方Instagram</span>
                  </label>
                  <label className="checkout-radio-label">
                    <input
                      type="radio"
                      name={field.name}
                      value="舊生報名"
                      checked={field.value === '舊生報名'}
                      onChange={() => {
                        setFieldValue('infoSource', '舊生報名');
                        setFieldValue('infoSourceOther', '');
                      }}
                    />
                    <span>舊生報名</span>
                  </label>
                  <label className="checkout-radio-label">
                    <input
                      type="radio"
                      name={field.name}
                      value="其他"
                      checked={field.value === '其他'}
                      onChange={() => setFieldValue('infoSource', '其他')}
                    />
                    <span>其他</span>
                  </label>
                </div>
                {field.value === '其他' && (
                  <div className="mt-2">
                    <Field
                      name="infoSourceOther"
                      type="text"
                      placeholder="請說明資訊來源"
                      component={CustomInput}
                      label="其他："
                    />
                  </div>
                )}
              </div>
            )}
          </Field>
        </div>
      </div>
    </div>
  );
};

export default ShippingForm;
