import firebase from './firebase';

class AnalyticsService {
  // 記錄頁面瀏覽
  async trackPageView(pagePath, pageTitle) {
    try {
      const today = this.getTodayDateString();
      const analyticsRef = firebase.db.collection('analytics').doc(today);

      // 取得今日資料
      const doc = await analyticsRef.get();

      if (doc.exists) {
        // 更新現有資料
        await analyticsRef.update({
          pageViews: firebase.db.FieldValue.increment(1),
          lastUpdated: new Date().getTime(),
          [`pages.${this.sanitizePagePath(pagePath)}`]: firebase.db.FieldValue.increment(1)
        });
      } else {
        // 建立新的每日資料
        await analyticsRef.set({
          date: today,
          pageViews: 1,
          uniqueVisitors: 0, // 稍後由 unique visitor tracking 更新
          pages: {
            [this.sanitizePagePath(pagePath)]: 1
          },
          createdAt: new Date().getTime(),
          lastUpdated: new Date().getTime()
        });
      }

      console.log(`📊 Page view tracked: ${pagePath}`);
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }

  // 記錄 unique visitor
  async trackUniqueVisitor() {
    try {
      const today = this.getTodayDateString();
      const visitorId = this.getOrCreateVisitorId();

      // 檢查今天是否已經記錄過這個訪客
      const visitorKey = `visitor_${today}`;
      const hasVisitedToday = localStorage.getItem(visitorKey);

      if (!hasVisitedToday) {
        // 更新 unique visitors 計數
        const analyticsRef = firebase.db.collection('analytics').doc(today);
        const doc = await analyticsRef.get();

        if (doc.exists) {
          await analyticsRef.update({
            uniqueVisitors: firebase.db.FieldValue.increment(1)
          });
        } else {
          await analyticsRef.set({
            date: today,
            pageViews: 0,
            uniqueVisitors: 1,
            pages: {},
            createdAt: new Date().getTime(),
            lastUpdated: new Date().getTime()
          });
        }

        // 標記今天已訪問
        localStorage.setItem(visitorKey, 'true');
        console.log(`👤 Unique visitor tracked: ${visitorId}`);
      }
    } catch (error) {
      console.error('Failed to track unique visitor:', error);
    }
  }

  // 取得或建立訪客 ID
  getOrCreateVisitorId() {
    let visitorId = localStorage.getItem('visitorId');

    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('visitorId', visitorId);
    }

    return visitorId;
  }

  // 取得今天的日期字串 (YYYY-MM-DD)
  getTodayDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 清理頁面路徑，使其適合作為 Firestore key
  sanitizePagePath(path) {
    return path.replace(/\//g, '_').replace(/[.$#[\]]/g, '_');
  }

  // 取得指定天數的分析資料
  async getAnalyticsData(days = 7) {
    try {
      const dates = this.getDateRange(days);
      const promises = dates.map(date =>
        firebase.db.collection('analytics').doc(date).get()
      );

      const snapshots = await Promise.all(promises);

      return snapshots.map((snapshot, index) => {
        if (snapshot.exists) {
          return {
            date: dates[index],
            ...snapshot.data()
          };
        }
        return {
          date: dates[index],
          pageViews: 0,
          uniqueVisitors: 0,
          pages: {}
        };
      });
    } catch (error) {
      console.error('Failed to get analytics data:', error);
      return [];
    }
  }

  // 取得日期範圍
  getDateRange(days) {
    const dates = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }

    return dates;
  }

  // 取得熱門頁面
  async getTopPages(days = 7) {
    try {
      const analyticsData = await this.getAnalyticsData(days);
      const pagesMap = {};

      // 合併所有天數的頁面資料
      analyticsData.forEach(dayData => {
        if (dayData.pages) {
          Object.entries(dayData.pages).forEach(([page, views]) => {
            pagesMap[page] = (pagesMap[page] || 0) + views;
          });
        }
      });

      // 轉換為陣列並排序
      return Object.entries(pagesMap)
        .map(([page, views]) => ({
          page: page.replace(/_/g, '/'),
          views
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5); // 前 5 名
    } catch (error) {
      console.error('Failed to get top pages:', error);
      return [];
    }
  }
}

const analyticsService = new AnalyticsService();
export default analyticsService;
