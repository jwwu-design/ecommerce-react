import { ArrowRightOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { MessageDisplay } from '@/components/common';
import { ProductShowcaseGrid } from '@/components/product';
import { FEATURED_PRODUCTS, RECOMMENDED_PRODUCTS, SHOP } from '@/constants/routes';
import {
  useDocumentTitle, useFeaturedProducts, useRecommendedProducts, useScrollTop
} from '@/hooks';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import firebaseInstance from '@/services/firebase';


const Home = () => {
  useDocumentTitle('首頁 | Ares 亞瑞仕知識學苑');
  useScrollTop();

  const [bannerImages, setBannerImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoadingBanner, setIsLoadingBanner] = useState(true);
  const [autoPlayKey, setAutoPlayKey] = useState(0); // 用於重置自動輪播

  const {
    featuredProducts,
    fetchFeaturedProducts,
    isLoading: isLoadingFeatured,
    error: errorFeatured
  } = useFeaturedProducts(6);
  const {
    recommendedProducts,
    fetchRecommendedProducts,
    isLoading: isLoadingRecommended,
    error: errorRecommended
  } = useRecommendedProducts(6);

  // 載入輪播圖片
  useEffect(() => {
    const loadBannerImages = async () => {
      try {
        const images = await firebaseInstance.getBannerImages();
        setBannerImages(images);
      } catch (error) {
        console.error('Failed to load banner images:', error);
      } finally {
        setIsLoadingBanner(false);
      }
    };

    loadBannerImages();
  }, []);

  // 自動輪播
  useEffect(() => {
    if (bannerImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === bannerImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // 每 5 秒切換一次

    return () => clearInterval(interval);
  }, [bannerImages.length, autoPlayKey]); // 當 autoPlayKey 改變時重新建立計時器

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? bannerImages.length - 1 : prevIndex - 1
    );
    setAutoPlayKey((prev) => prev + 1); // 重置自動輪播計時器
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === bannerImages.length - 1 ? 0 : prevIndex + 1
    );
    setAutoPlayKey((prev) => prev + 1); // 重置自動輪播計時器
  };

  const handleDotClick = (index) => {
    setCurrentImageIndex(index);
    setAutoPlayKey((prev) => prev + 1); // 重置自動輪播計時器
  };

  return (
    <main className="content">
      <div className="home">
        <div className="banner">
          <div className="banner-desc">
            <h1 className="text-thin">
              <strong>接續國際標準<br />領航永續未來</strong>

            </h1>
            <p>
              從 ISO 理解、導入到稽核實戰，為企業與個人打造可落地的永續治理能力
            </p>
            <br />
            <Link to={SHOP} className="button">
              立即報名 &nbsp;
              <ArrowRightOutlined />
            </Link>
          </div>
          <div className="banner-img-container">
            {isLoadingBanner ? (
              <div className="loader" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <h3>載入中...</h3>
              </div>
            ) : bannerImages.length > 0 ? (
              <>
                <div className="banner-carousel" style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
                  {bannerImages.map((image, index) => (
                    <div
                      key={image.id}
                      className="banner-img"
                    >
                      <img src={image.url} alt={`輪播圖 ${index + 1}`} />
                    </div>
                  ))}
                </div>
                {bannerImages.length > 1 && (
                  <>
                    <button className="banner-arrow banner-arrow-left" onClick={handlePrevImage}>
                      <LeftOutlined />
                    </button>
                    <button className="banner-arrow banner-arrow-right" onClick={handleNextImage}>
                      <RightOutlined />
                    </button>
                    <div className="banner-dots">
                      {bannerImages.map((_, index) => (
                        <span
                          key={index}
                          className={`banner-dot ${index === currentImageIndex ? 'active' : ''}`}
                          onClick={() => handleDotClick(index)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                <p>尚未上傳輪播圖片</p>
              </div>
            )}
          </div>
        </div>
        <div className="display">
          <div className="display-header">
            <h1>近期課程</h1>
            <Link to={FEATURED_PRODUCTS}>查看全部</Link>
          </div>
          {(errorFeatured && !isLoadingFeatured) ? (
            <MessageDisplay
              message={errorFeatured}
              action={fetchFeaturedProducts}
              buttonLabel="重新嘗試"
            />
          ) : (
            <ProductShowcaseGrid
              products={featuredProducts}
              skeletonCount={6}
            />
          )}
        </div>
        <div className="display">
          <div className="display-header">
            <h1>永續治理領袖前哨站</h1>
            <Link to={RECOMMENDED_PRODUCTS}>查看全部</Link>
          </div>
          {(errorRecommended && !isLoadingRecommended) ? (
            <MessageDisplay
              message={errorRecommended}
              action={fetchRecommendedProducts}
              buttonLabel="重新嘗試"
            />
          ) : (
            <ProductShowcaseGrid
              products={recommendedProducts}
              skeletonCount={6}
            />
          )}
        </div>
      </div>
    </main>
  );
};

export default Home;
