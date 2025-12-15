/* eslint-disable jsx-a11y/label-has-associated-control */
import { CheckOutlined, LoadingOutlined } from '@ant-design/icons';
import { ImageLoader } from '@/components/common';
import {
  // CustomColorInput,
  CustomCreatableSelect, CustomInput, CustomTextarea
} from '@/components/formik';
import {
  Field, FieldArray, Form, Formik
} from 'formik';
import { useFileHandler } from '@/hooks';
import PropType from 'prop-types';
import React from 'react';
import * as Yup from 'yup';

// 預設品牌選項，可自行調整
const brandOptions = [
  { value: 'Ares', label: 'Ares' },
  // { value: 'Salt Maalat', label: 'Salt Maalat' },
  // { value: 'Betsin Maalat', label: 'Betsin Maalat' },
  // { value: 'Sexbomb', label: 'Sexbomb' },
  // { value: 'Black Kibal', label: 'Black Kibal' }
];

// 地區選項
const regionOptions = [
  { value: '台北', label: '台北' },
  { value: '台南', label: '台南' }
];

// 大類選項
const categoryOptions = [
  { value: 'ESG項目', label: 'ESG項目' },
  { value: '資安項目', label: '資安項目' },
  { value: '品質系統', label: '品質系統' }
];

// 系統選項（根據大類）
const systemOptions = {
  'ESG項目': [
    { value: 'ISO 14064-1', label: 'ISO 14064-1' },
    { value: 'ISO 14064-2', label: 'ISO 14064-2' },
    { value: 'ISO 14067', label: 'ISO 14067' },
    { value: 'ISO 14064-1+14067 雙主導查證員', label: 'ISO 14064-1+14067 雙主導查證員' },
    { value: 'ISO 50001', label: 'ISO 50001' },
    { value: 'ISO 14068-1', label: 'ISO 14068-1' },
    { value: 'ISO 46001', label: 'ISO 46001' },
    { value: '永續報告書撰寫技巧暨GRI 2021 新版解析(GRI、SASB、TCFD)', label: '永續報告書撰寫技巧暨GRI 2021 新版解析(GRI、SASB、TCFD)' },
    { value: 'AA1000永續報告查證師', label: 'AA1000永續報告查證師' },
    { value: 'ISO 32210與永續金融管理師', label: 'ISO 32210與永續金融管理師' },
    { value: 'iPAS 淨零碳規劃管理師', label: 'iPAS 淨零碳規劃管理師' },
    { value: 'CBAM企業內控管理人才培訓班', label: 'CBAM企業內控管理人才培訓班' },
    { value: 'GHG Protocol核心盤查與報告實務', label: 'GHG Protocol核心盤查與報告實務' }
  ],
  '資安項目': [
    { value: 'ISO 27001', label: 'ISO 27001' },
    { value: 'ISO 27701', label: 'ISO 27701' },
    { value: 'ISO 27017/27018', label: 'ISO 27017/27018' },
    { value: 'ISO 42001', label: 'ISO 42001' }
  ],
  '品質系統': [
    { value: 'ISO 9001', label: 'ISO 9001' },
    { value: 'ISO 14001', label: 'ISO 14001' },
    { value: 'ISO 45001', label: 'ISO 45001' },
    { value: 'ISO 22000', label: 'ISO 22000' },
    { value: 'ISO 13485', label: 'ISO 13485' },
    { value: 'ISO 22716', label: 'ISO 22716' },
    { value: 'ISO 19011', label: 'ISO 19011' },
    { value: 'ISO 16949', label: 'ISO 16949' }
  ]
};

const FormSchema = Yup.object().shape({
  name: Yup.string()
    .required('產品名稱為必填。')
    .max(60, '產品名稱長度必須少於 60 個字元。'),
  brand: Yup.string()
    .required('品牌為必填。'),
  price: Yup.number()
    .positive('價格無效。')
    .integer('價格必須為整數。')
    .required('價格為必填。'),
  description: Yup.string()
    .required('產品描述為必填。'),
  maxQuantity: Yup.number()
    .positive('最大庫存數量無效。')
    .integer('最大庫存必須為整數。')
    .required('最大庫存為必填。'),
  keywords: Yup.array()
    .of(Yup.string())
    .min(1, '請至少輸入 1 個關鍵字。'),
  sizes: Yup.array()
    .of(
      Yup.string()
        .matches(
          /^(\d{1,2}\/\d{1,2})(~\d{1,2}\/\d{1,2})?$/,
          '日期格式錯誤，請使用 MM/DD 或 MM/DD~MM/DD 格式'
        )
    )
    .min(1, '請輸入產品日期。'),
  region: Yup.string()
    .required('地區為必填。'),
  category: Yup.string()
    .required('大類為必填。'),
  system: Yup.string()
    .required('系統為必填。'),
  isFeatured: Yup.boolean(),
  isRecommended: Yup.boolean()
  // availableColors: Yup.array()
  //   .of(Yup.string().required())
  //   .min(1, '請至少新增 1 個顏色。')
});

const ProductForm = ({ product, onSubmit, isLoading }) => {
  const initFormikValues = {
    name: product?.name || '',
    brand: product?.brand || '',
    price: product?.price || 0,
    maxQuantity: product?.maxQuantity || 0,
    description: product?.description || '',
    keywords: product?.keywords || [],
    sizes: product?.sizes || [],
    region: product?.region || '',
    category: product?.category || '',
    system: product?.system || '',
    isFeatured: product?.isFeatured || false,
    isRecommended: product?.isRecommended || false
    // availableColors: product?.availableColors || []
  };

  const {
    imageFile,
    isFileLoading,
    onFileChange,
    removeImage
  } = useFileHandler({ image: {}, imageCollection: product?.imageCollection || [] });

  const onSubmitForm = (form) => {
    if (imageFile.image.file || product.image) {
      onSubmit({
        ...form,
        quantity: 1,
        // 為了避免 firebase function 計費，在此處新增小寫版本的名稱
        // 而非在 firebase functions 中處理
        name_lower: form.name.toLowerCase(),
        dateAdded: new Date().getTime(),
        image: imageFile?.image?.file || product.image,
        imageCollection: imageFile.imageCollection
      });
    } else {
      // eslint-disable-next-line no-alert
      alert('請上傳產品縮圖。');
    }
  };

  return (
    <div>
      <Formik
        initialValues={initFormikValues}
        validateOnChange
        validationSchema={FormSchema}
        onSubmit={onSubmitForm}
      >
        {({ values, setValues }) => (
          <Form className="product-form">
            <div className="product-form-inputs">
              <div className="d-flex">
                <div className="product-form-field">
                  <Field
                    disabled={isLoading}
                    name="name"
                    type="text"
                    label="* 產品名稱"
                    placeholder="請輸入產品名稱"
                    style={{ textTransform: 'capitalize' }}
                    component={CustomInput}
                  />
                </div>
                &nbsp;
                <div className="product-form-field">
                  <CustomCreatableSelect
                    defaultValue={{ label: values.brand, value: values.brand }}
                    name="brand"
                    iid="brand"
                    options={brandOptions}
                    disabled={isLoading}
                    placeholder="選擇或建立品牌"
                    label="* 品牌"
                  />
                </div>
              </div>
              <div className="product-form-field">
                <Field
                  disabled={isLoading}
                  name="description"
                  id="description"
                  rows={3}
                  label="* 產品描述"
                  component={CustomTextarea}
                />
              </div>
              <div className="d-flex">
                <div className="product-form-field">
                  <Field
                    disabled={isLoading}
                    name="price"
                    id="price"
                    type="number"
                    label="* 價格"
                    component={CustomInput}
                  />
                </div>
                &nbsp;
                <div className="product-form-field">
                  <Field
                    disabled={isLoading}
                    name="maxQuantity"
                    type="number"
                    id="maxQuantity"
                    label="* 最大庫存數量"
                    component={CustomInput}
                  />
                </div>
              </div>
              <div className="d-flex">
                <div className="product-form-field">
                  <CustomCreatableSelect
                    defaultValue={{ label: values.region, value: values.region }}
                    name="region"
                    iid="region"
                    options={regionOptions}
                    disabled={isLoading}
                    placeholder="選擇地區"
                    label="* 地區"
                  />
                </div>
                &nbsp;
                <div className="product-form-field">
                  <CustomCreatableSelect
                    defaultValue={values.sizes.map((key) => ({ value: key, label: key }))}
                    name="sizes"
                    iid="sizes"
                    isMulti
                    disabled={isLoading}
                    placeholder="建立或選擇日期 (例如: 12/12 或 12/12~12/14)"
                    label="* 日期"
                    isValidNewOption={(inputValue) => {
                      const datePattern = /^(\d{1,2}\/\d{1,2})(~\d{1,2}\/\d{1,2})?$/;
                      return datePattern.test(inputValue);
                    }}
                    formatCreateLabel={(inputValue) => {
                      const datePattern = /^(\d{1,2}\/\d{1,2})(~\d{1,2}\/\d{1,2})?$/;
                      if (!datePattern.test(inputValue)) {
                        return `❌ 格式錯誤 (請使用 MM/DD 或 MM/DD~MM/DD)`;
                      }
                      return `建立 "${inputValue}"`;
                    }}
                    onCreateValidationError={(inputValue) => {
                      return `日期格式錯誤："${inputValue}" 不符合 MM/DD 或 MM/DD~MM/DD 格式`;
                    }}
                  />
                </div>
              </div>
              <div className="d-flex">
                <div className="product-form-field">
                  <CustomCreatableSelect
                    defaultValue={{ label: values.category, value: values.category }}
                    name="category"
                    iid="category"
                    options={categoryOptions}
                    disabled={isLoading}
                    placeholder="選擇大類"
                    label="* 大類"
                    onChange={(newValue) => {
                      setValues({
                        ...values,
                        category: newValue?.value || '',
                        system: '' // 重設系統選項
                      });
                    }}
                  />
                </div>
                &nbsp;
                <div className="product-form-field">
                  <CustomCreatableSelect
                    defaultValue={{ label: values.system, value: values.system }}
                    name="system"
                    iid="system"
                    options={values.category ? systemOptions[values.category] : []}
                    disabled={isLoading || !values.category}
                    placeholder={values.category ? "選擇系統" : "請先選擇大類"}
                    label="* 系統"
                  />
                </div>
              </div>
              <div className="product-form-field">
                <CustomCreatableSelect
                  defaultValue={values.keywords.map((key) => ({ value: key, label: key }))}
                  name="keywords"
                  iid="keywords"
                  isMulti
                  disabled={isLoading}
                  placeholder="建立或選擇關鍵字"
                  label="* 關鍵字"
                />
              </div>


              {/* <div className="product-form-field">
                <FieldArray
                  name="availableColors"
                  disabled={isLoading}
                  component={CustomColorInput}
                />
              </div> */}
              <div className="product-form-field">
                <span className="d-block padding-s">圖片集</span>
                {!isFileLoading && (
                  <label htmlFor="product-input-file-collection">
                    <input
                      disabled={isLoading}
                      hidden
                      id="product-input-file-collection"
                      multiple
                      onChange={(e) => onFileChange(e, { name: 'imageCollection', type: 'multiple' })}
                      readOnly={isLoading}
                      type="file"
                    />
                    選擇圖片
                  </label>
                )}
              </div>
              <div className="product-form-collection">
                <>
                  {imageFile.imageCollection.length >= 1 && (
                    imageFile.imageCollection.map((image) => (
                      <div
                        className="product-form-collection-image"
                        key={image.id}
                      >
                        <ImageLoader
                          alt=""
                          src={image.url}
                        />
                        <button
                          className="product-form-delete-image"
                          onClick={() => removeImage({ id: image.id, name: 'imageCollection' })}
                          title="刪除圖片"
                          type="button"
                        >
                          <i className="fa fa-times-circle" />
                        </button>
                      </div>
                    ))
                  )}
                </>
              </div>
              <br />
              <div className="d-flex">
                <div className="product-form-field">
                  <input
                    checked={values.isFeatured}
                    className=""
                    id="featured"
                    onChange={(e) => setValues({ ...values, isFeatured: e.target.checked })}
                    type="checkbox"
                  />
                  <label htmlFor="featured">
                    <h5 className="d-flex-grow-1 margin-0">
                      &nbsp; 加入精選產品 &nbsp;
                    </h5>
                  </label>
                </div>
                <div className="product-form-field">
                  <input
                    checked={values.isRecommended}
                    className=""
                    id="recommended"
                    onChange={(e) => setValues({ ...values, isRecommended: e.target.checked })}
                    type="checkbox"
                  />
                  <label htmlFor="recommended">
                    <h5 className="d-flex-grow-1 margin-0">
                      &nbsp; 加入推薦產品 &nbsp;
                    </h5>
                  </label>
                </div>
              </div>
              <br />
              <br />
              <br />
              <div className="product-form-field product-form-submit">
                <button
                  className="button"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? <LoadingOutlined /> : <CheckOutlined />}
                  &nbsp;
                  {isLoading ? '儲存中...' : '儲存產品'}
                </button>
              </div>
            </div>
            {/* ----縮圖上傳區 ---- */}
            <div className="product-form-file">
              <div className="product-form-field">
                <span className="d-block padding-s">* 產品縮圖</span>
                {!isFileLoading && (
                  <label htmlFor="product-input-file">
                    <input
                      disabled={isLoading}
                      hidden
                      id="product-input-file"
                      onChange={(e) => onFileChange(e, { name: 'image', type: 'single' })}
                      readOnly={isLoading}
                      type="file"
                    />
                    選擇圖片
                  </label>
                )}
              </div>
              <div className="product-form-image-wrapper">
                {(imageFile.image.url || product.image) && (
                  <ImageLoader
                    alt=""
                    className="product-form-image-preview"
                    src={imageFile.image.url || product.image}
                  />
                )}
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

ProductForm.propTypes = {
  product: PropType.shape({
    name: PropType.string,
    brand: PropType.string,
    price: PropType.number,
    maxQuantity: PropType.number,
    description: PropType.string,
    keywords: PropType.arrayOf(PropType.string),
    imageCollection: PropType.arrayOf(PropType.object),
    sizes: PropType.arrayOf(PropType.string),
    region: PropType.string,
    category: PropType.string,
    system: PropType.string,
    image: PropType.string,
    imageUrl: PropType.string,
    isFeatured: PropType.bool,
    isRecommended: PropType.bool
    // availableColors: PropType.arrayOf(PropType.string)
  }).isRequired,
  onSubmit: PropType.func.isRequired,
  isLoading: PropType.bool.isRequired
};

export default ProductForm;
