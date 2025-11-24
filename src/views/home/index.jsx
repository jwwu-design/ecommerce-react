import { ArrowRightOutlined } from '@ant-design/icons';
import { MessageDisplay } from '@/components/common';
import { ProductShowcaseGrid } from '@/components/product';
import { FEATURED_PRODUCTS, RECOMMENDED_PRODUCTS, SHOP } from '@/constants/routes';
import {
  useDocumentTitle, useFeaturedProducts, useRecommendedProducts, useScrollTop
} from '@/hooks';
import bannerImg from '@/images/banner-girl.png';
import React from 'react';
import { Link } from 'react-router-dom';


const Home = () => {
  useDocumentTitle('首頁 | Ares');
  useScrollTop();

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

  return (
    <main className="content">
      <div className="home">
        <div className="banner">
          {/* <div className="banner-desc">
            <h1 className="text-thin">
              <strong>看見一切的清晰度</strong>
            </h1>
            <p>
              購買眼鏡讓你既開心又時尚，還能省錢。
              眼鏡、太陽眼鏡與隱形眼鏡，我們都替你的雙眼照顧周全。
            </p>
            <br />
            <Link to={SHOP} className="button">
              立即購買 &nbsp;
              <ArrowRightOutlined />
            </Link>
          </div> */}
          <div className="banner-img"><img src={bannerImg} alt="橫幅" /></div>
        </div>
        <div className="display">
          <div className="display-header">
            <h1>精選課程</h1>
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
            <h1>推薦課程</h1>
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
