/* eslint-disable no-plusplus */
/* eslint-disable no-else-return */

// 檢查日期是否在範圍內
const isDateInRange = (productDate, startDate, endDate) => {
  if (!startDate || !endDate) return true;
  if (!productDate) return false;

  // 解析篩選的日期範圍 (MM/DD 格式)
  const parseDate = (dateStr) => {
    const [month, day] = dateStr.split('/').map(Number);
    const year = new Date().getFullYear();
    return new Date(year, month - 1, day);
  };

  const filterStart = parseDate(startDate);
  const filterEnd = parseDate(endDate);

  // 處理商品日期 (可能是單日 "12/15" 或區間 "12/15~12/17")
  if (productDate.includes('~')) {
    // 處理日期區間
    const [pStart, pEnd] = productDate.split('~');
    const productStart = parseDate(pStart);
    const productEnd = parseDate(pEnd);

    // 檢查兩個區間是否有重疊
    return productStart <= filterEnd && productEnd >= filterStart;
  } else {
    // 處理單一日期
    const productSingleDate = parseDate(productDate);
    return productSingleDate >= filterStart && productSingleDate <= filterEnd;
  }
};

export const selectFilter = (products, filter) => {
  if (!products || products.length === 0) return [];

  const keyword = filter.keyword.toLowerCase();

  return products.filter((product) => {
    const isInRange = filter.maxPrice
      ? (product.price >= filter.minPrice && product.price <= filter.maxPrice)
      : true;
    const matchKeyword = product.keywords ? product.keywords.includes(keyword) : true;
    // const matchName = product.name ? product.name.toLowerCase().includes(keyword) : true;
    const matchDescription = product.description
      ? product.description.toLowerCase().includes(keyword)
      : true;
    const matchBrand = product.brand ? product.brand.toLowerCase().includes(filter.brand) : true;

    // 新增的篩選條件
    const matchRegion = filter.region ? product.region === filter.region : true;
    const matchCategory = filter.category ? product.category === filter.category : true;
    const matchSystem = filter.system ? product.system === filter.system : true;

    // 檢查日期範圍
    let matchDate = true;
    if (filter.startDate && filter.endDate && product.sizes && product.sizes.length > 0) {
      // 只要有任一個日期在範圍內就符合
      matchDate = product.sizes.some(date => isDateInRange(date, filter.startDate, filter.endDate));
    }

    return ((matchKeyword || matchDescription) && matchBrand && isInRange && matchRegion && matchCategory && matchSystem && matchDate);
  }).sort((a, b) => {
    if (filter.sortBy === 'name-desc') {
      return a.name < b.name ? 1 : -1;
    } else if (filter.sortBy === 'name-asc') {
      return a.name > b.name ? 1 : -1;
    } else if (filter.sortBy === 'price-desc') {
      return a.price < b.price ? 1 : -1;
    }

    return a.price > b.price ? 1 : -1;
  });
};

// Select product with highest price
export const selectMax = (products) => {
  if (!products || products.length === 0) return 0;

  let high = products[0];

  for (let i = 0; i < products.length; i++) {
    if (products[i].price > high.price) {
      high = products[i];
    }
  }

  return Math.floor(high.price);
};

// Select product with lowest price
export const selectMin = (products) => {
  if (!products || products.length === 0) return 0;
  let low = products[0];

  for (let i = 0; i < products.length; i++) {
    if (products[i].price < low.price) {
      low = products[i];
    }
  }

  return Math.floor(low.price);
};
