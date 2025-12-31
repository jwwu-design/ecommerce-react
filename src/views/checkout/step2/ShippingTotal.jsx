import { useFormikContext } from 'formik';
import { displayMoney } from '@/helpers/utils';
import PropType from 'prop-types';
import React, { useState, useEffect } from 'react';
import firebase from '@/services/firebase';
import { displayActionMessage } from '@/helpers/utils';

const ShippingTotal = ({ subtotal }) => {
  const { values, setFieldValue } = useFormikContext();
  const [validating, setValidating] = useState(false);
  const [couponValidation, setCouponValidation] = useState(null);
  const [discount, setDiscount] = useState(0);

  // 驗證優惠碼
  const validateCoupon = async (code) => {
    if (!code || code.trim() === '') {
      setCouponValidation(null);
      setDiscount(0);
      return;
    }

    setValidating(true);
    try {
      const result = await firebase.validateCoupon(code, subtotal);

      if (result.valid) {
        setCouponValidation({ valid: true, message: result.message });
        setDiscount(result.discountAmount);
        displayActionMessage(
          `優惠碼套用成功！折扣 ${displayMoney(result.discountAmount)}`,
          'success'
        );
        // 儲存優惠券資訊到表單
        setFieldValue('appliedCoupon', result.coupon);
      } else {
        setCouponValidation({ valid: false, message: result.message });
        setDiscount(0);
        setFieldValue('appliedCoupon', null);
        displayActionMessage(result.message, 'error');
      }
    } catch (error) {
      setCouponValidation({ valid: false, message: '驗證失敗，請稍後再試' });
      setDiscount(0);
      setFieldValue('appliedCoupon', null);
    } finally {
      setValidating(false);
    }
  };

  // 當優惠碼改變時重新驗證
  useEffect(() => {
    if (values.couponType === '序號' && values.couponCode) {
      // 延遲驗證，避免用戶輸入時頻繁請求
      const timer = setTimeout(() => {
        validateCoupon(values.couponCode);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setCouponValidation(null);
      setDiscount(0);
      setFieldValue('appliedCoupon', null);
    }
  }, [values.couponCode, values.couponType]);

  // 計算最終金額
  const shippingFee = values.isInternational ? 50 : 0;
  const finalTotal = Math.max(0, Number(subtotal) + shippingFee - discount);

  return (
    <div className="checkout-total d-flex-end padding-right-m">
      <table>
        <tbody>
          <tr>
            <td>
              <span className="d-block margin-0 padding-right-s text-right">
                小計: &nbsp;
              </span>
            </td>
            <td>
              <h4 className="basket-total-amount text-subtle text-right margin-0">
                {displayMoney(subtotal)}
              </h4>
            </td>
          </tr>

          {/* 優惠碼折扣 */}
          {discount > 0 && (
            <tr>
              <td>
                <span className="d-block margin-0 padding-right-s text-right text-success">
                  優惠折扣: &nbsp;
                </span>
              </td>
              <td>
                <h4 className="basket-total-amount text-success text-right margin-0">
                  - {displayMoney(discount)}
                </h4>
              </td>
            </tr>
          )}

          {/* 優惠碼驗證狀態 */}
          {values.couponType === '序號' && values.couponCode && (
            <tr>
              <td colSpan="2">
                <div className="coupon-validation-status text-right">
                  {validating && (
                    <span className="text-subtle">驗證中...</span>
                  )}
                  {!validating && couponValidation && (
                    <span className={couponValidation.valid ? 'text-success' : 'text-error'}>
                      {couponValidation.valid ? '✓' : '✗'} {couponValidation.message}
                    </span>
                  )}
                </div>
              </td>
            </tr>
          )}

          <tr>
            <td>
              <span className="d-block margin-0 padding-right-s text-right">
                總計: &nbsp;
              </span>
            </td>
            <td>
              <h2 className="basket-total-amount text-right">
                {displayMoney(finalTotal)}
              </h2>
            </td>
          </tr>

          {discount > 0 && (
            <tr>
              <td colSpan="2">
                <p className="text-subtle text-right" style={{ fontSize: '1.2rem', margin: '0.5rem 0 0 0' }}>
                  已節省 {displayMoney(discount)}
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

ShippingTotal.propTypes = {
  subtotal: PropType.number.isRequired
};

export default ShippingTotal;
