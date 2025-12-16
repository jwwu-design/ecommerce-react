// 固定的大類選項
export const CATEGORY_OPTIONS = ['ESG項目', '資安項目', '品質系統'];

// 根據選中的大類提供系統選項
export const SYSTEM_OPTIONS_BY_CATEGORY = {
  'ESG項目': [
    'ISO 14064-1',
    'ISO 14064-2',
    'ISO 14067',
    'ISO 14064-1+14067 雙主導查證員',
    'ISO 50001',
    'ISO 14068-1',
    'ISO 46001',
    '永續報告書撰寫技巧暨GRI 2021 新版解析(GRI、SASB、TCFD)',
    'AA1000永續報告查證師',
    'ISO 32210與永續金融管理師',
    'iPAS 淨零碳規劃管理師',
    'CBAM企業內控管理人才培訓班',
    'GHG Protocol核心盤查與報告實務'
  ],
  '資安項目': [
    'ISO 27001',
    'ISO 27701',
    'ISO 27017/27018',
    'ISO 42001'
  ],
  '品質系統': [
    'ISO 9001',
    'ISO 14001',
    'ISO 45001',
    'ISO 22000',
    'ISO 13485',
    'ISO 22716',
    'ISO 19011',
    'ISO 16949'
  ]
};
