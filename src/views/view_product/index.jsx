import { ArrowLeftOutlined, LoadingOutlined } from '@ant-design/icons';
import { /* ColorChooser, */ ImageLoader, MessageDisplay } from '@/components/common';
import { ProductShowcaseGrid } from '@/components/product';
import { RECOMMENDED_PRODUCTS, SHOP } from '@/constants/routes';
import { displayMoney } from '@/helpers/utils';
import {
  useBasket,
  useDocumentTitle,
  useProduct,
  useRecommendedProducts,
  useScrollTop
} from '@/hooks';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Select from 'react-select';
import analyticsService from '@/services/analytics';

const ViewProduct = () => {
  const { id } = useParams();
  const { product, isLoading, error } = useProduct(id);
  const { addToBasket, isItemOnBasket } = useBasket(id);
  useScrollTop();
  useDocumentTitle(`查看課程：${product?.name || '課程'}`);

  const [selectedImage, setSelectedImage] = useState(product?.image || '');
  const [selectedSize, setSelectedSize] = useState('');
  // const [selectedColor, setSelectedColor] = useState('');

  const {
    recommendedProducts,
    fetchRecommendedProducts,
    isLoading: isLoadingFeatured,
    error: errorFeatured
  } = useRecommendedProducts(6);
  const colorOverlay = useRef(null);

  useEffect(() => {
    setSelectedImage(product?.image);

    // 追蹤課程瀏覽
    if (product?.id && product?.name) {
      analyticsService.trackProductView(product.id, product.name);
    }
  }, [product]);

  const onSelectedSizeChange = (newValue) => {
    setSelectedSize(newValue.value);
  };

  // const onSelectedColorChange = (color) => {
  //   setSelectedColor(color);
  //   if (colorOverlay.current) {
  //     colorOverlay.current.value = color;
  //   }
  // };

  const handleAddToBasket = () => {
    addToBasket({ ...product, /* selectedColor, */ selectedSize: selectedSize || product.sizes[0] });
  };

  return (
    <main className="content">
      {isLoading && (
        <div className="loader">
          <h4>正在載入課程資料...</h4>
          <br />
          <LoadingOutlined style={{ fontSize: '3rem' }} />
        </div>
      )}
      {error && (
        <MessageDisplay message={error} />
      )}
      {(product && !isLoading) && (
        <div className="product-view">
          <Link to={SHOP}>
            <h3 className="button-link d-inline-flex">
              <ArrowLeftOutlined />
              &nbsp; 返回商店
            </h3>
          </Link>
          <div className="product-modal">
            <div className="product-modal-images-container">
              <div className="product-modal-image-wrapper">
                {/* {selectedColor && <input type="color" disabled ref={colorOverlay} id="color-overlay" />} */}
                <ImageLoader
                  alt={product.name}
                  className="product-modal-image"
                  src={selectedImage}
                />
              </div>
              {product.imageCollection.length !== 0 && (
                <div className="product-modal-image-collection">
                  {product.imageCollection.map((image) => (
                    <div
                      className="product-modal-image-collection-wrapper"
                      key={image.id}
                      onClick={() => setSelectedImage(image.url)}
                      role="presentation"
                    >
                      <ImageLoader
                        className="product-modal-image-collection-img"
                        src={image.url}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="product-modal-details">
              <br />
              <span className="text-subtle">{product.brand}</span>
              <h1 className="margin-top-0">{product.name}</h1>
              <div className="divider" />
              <br />
              <div>
                <span className="text-subtle">上課地區</span>
                <br />
                <br />
                <span className="text-subtle-2">{product.region}</span>
              </div>
              <br />
              <div>
                <span className="text-subtle">課程日期</span>
                <br />
                <br />
                <Select
                  placeholder="--選擇日期--"
                  onChange={onSelectedSizeChange}
                  options={product.sizes.sort((a, b) => (a < b ? -1 : 1)).map((size) => ({ label: `${size} `, value: size }))}
                  styles={{ menu: (provided) => ({ ...provided, zIndex: 10 }) }}
                />
              </div>
              <br />
              {/* {product.availableColors.length >= 1 && (
                <div>
                  <span className="text-subtle">選擇顏色</span>
                  <br />
                  <br />
                  <ColorChooser
                    availableColors={product.availableColors}
                    onSelectedColorChange={onSelectedColorChange}
                  />
                </div>
              )} */}
              <h1>{displayMoney(product.price)}</h1>
              <div className="product-modal-action">
                <button
                  className={`button button-small ${isItemOnBasket(product.id) ? 'button-border button-border-gray' : ''}`}
                  onClick={handleAddToBasket}
                  type="button"
                >
                  {isItemOnBasket(product.id) ? '從購物車移除' : '加入購物車'}
                </button>
              </div>
            </div>
          </div>

          {/* 課程詳細資訊區塊 */}
          <div className="product-detail-info">
            <div className="product-detail-info-item">
              <span className="text-subtle label">大類</span>
              <br />
              <span className="value">{product.category}</span>
            </div>

            <div className="product-detail-info-item">
              <span className="text-subtle label">系統</span>
              <br />
              <span className="value">{product.system}</span>
            </div>
            <div className="divider product-detail-info-divider" />

            <div className="product-detail-info-description">
              <span className="text-subtle label">產品敘述</span>
              <br />
              <p>{product.description}</p>
            </div>
          </div>

          <div style={{ marginTop: '10rem' }}>
            <div className="display-header">
              <h1>永續治理領袖前哨站</h1>
              <Link to={RECOMMENDED_PRODUCTS}>查看全部</Link>
            </div>
            {errorFeatured && !isLoadingFeatured ? (
              <MessageDisplay
                message={errorFeatured}
                action={fetchRecommendedProducts}
                buttonLabel="重新嘗試"
              />
            ) : (
              <ProductShowcaseGrid products={recommendedProducts} skeletonCount={3} />
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default ViewProduct;
