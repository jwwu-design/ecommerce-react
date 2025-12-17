import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import analyticsService from '@/services/analytics';

// 自動追蹤頁面瀏覽的 Hook
const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const trackPage = async () => {
      const pagePath = location.pathname;
      const pageTitle = document.title;

      // 記錄頁面瀏覽
      await analyticsService.trackPageView(pagePath, pageTitle);

      // 記錄 unique visitor (只在第一次訪問時)
      await analyticsService.trackUniqueVisitor();
    };

    trackPage();
  }, [location.pathname]);
};

export default usePageTracking;
