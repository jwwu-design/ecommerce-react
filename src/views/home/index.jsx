import { ArrowRightOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { MessageDisplay } from '@/components/common';
import { ProductShowcaseGrid } from '@/components/product';
import { FEATURED_PRODUCTS, RECOMMENDED_PRODUCTS, SHOP } from '@/constants/routes';
import {
  useDocumentTitle, useFeaturedProducts, useRecommendedProducts, useScrollTop
} from '@/hooks';
import bannerImg from '@/images/banner-girl.png';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import firebaseInstance from '@/services/firebase';


const Home = () => {
  useDocumentTitle('首頁 | Ares');
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
              <strong>建立您的<br />稽核資格</strong>
            </h1>
            <p>
              提供販賣驗證與培訓課程，幫助您建立專業的稽核資格。
              無論是入門還是進階課程，我們都能為您的職業生涯加分。
            </p>
            <br />
            <Link to={SHOP} className="button">
              立即報名 &nbsp;
              <ArrowRightOutlined />
            </Link>
          </div>
          <div className="banner-img-container">
            {isLoadingBanner ? (
              <div className="banner-img"><img src={bannerImg} alt="橫幅" /></div>
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
              <div className="banner-img"><img src={bannerImg} alt="橫幅" /></div>
            )}
          </div>
        </div>
        <div className="display">
          <div className="display-header">
            <h1>精選商品</h1>
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
            <h1>推薦商品</h1>
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
