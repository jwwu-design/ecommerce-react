# EmailJS 設定指南

## 📧 如何設定 EmailJS

### 步驟 1: 註冊 EmailJS 帳號
1. 前往 https://www.emailjs.com/
2. 點擊 "Sign Up" 註冊免費帳號
3. 驗證您的 Email

### 步驟 2: 添加 Email 服務
1. 登入後，點擊左側選單 "Email Services"
2. 點擊 "Add New Service"
3. 選擇您的郵件服務商（例如：Gmail）
4. 按照指示連接您的郵箱
5. 記下 **Service ID**（例如：service_abc123）

### 步驟 3: 創建 Email 模板
1. 點擊左側選單 "Email Templates"
2. 點擊 "Create New Template"
3. 設定模板內容：

**Subject（主旨）:**
```
報名表單審核未通過通知
```

**Content（內容）:**
```
親愛的 {{to_name}}，您好：

很抱歉通知您，您的報名表單（訂單編號：{{order_id}}）審核未通過。

拒絕原因：{{reason}}

請聯繫我們的客服團隊以了解詳情：
電子郵件：{{support_email}}
電話：{{support_phone}}

您可以重新上傳報名表單，我們會盡快為您處理。

祝您順心
{{company_name}} 團隊
```

4. 點擊 "Save"
5. 記下 **Template ID**（例如：template_xyz789）

### 步驟 4: 取得 Public Key
1. 點擊左側選單 "Account"
2. 找到 "API Keys" 區域
3. 複製 **Public Key**（例如：user_ABC123XYZ）

### 步驟 5: 更新程式碼
在 `src/services/firebase.js` 中找到以下行並替換：

```javascript
const SERVICE_ID = 'YOUR_SERVICE_ID';      // 替換為您的 Service ID
const TEMPLATE_ID = 'YOUR_TEMPLATE_ID';    // 替換為您的 Template ID
const PUBLIC_KEY = 'YOUR_PUBLIC_KEY';      // 替換為您的 Public Key
```

### 步驟 6: 測試
1. 在後台拒絕一個訂單
2. 檢查 Console 是否有錯誤
3. 檢查顧客信箱是否收到 Email

## 📝 EmailJS 模板變數說明

在模板中可以使用以下變數：
- `{{to_email}}` - 收件人 Email
- `{{to_name}}` - 收件人姓名
- `{{order_id}}` - 訂單編號
- `{{reason}}` - 拒絕原因
- `{{support_email}}` - 客服 Email (ares@ares-cert.com)
- `{{support_phone}}` - 客服電話 (06-2959696)
- `{{company_name}}` - 公司名稱 (Ares)

## 💰 免費額度
- 每月 200 封免費 Email
- 超過需要升級方案

## ⚠️ 注意事項
1. Public Key 可以公開（前端使用）
2. 不要分享 Private Key
3. 建議設定 Email 模板的 "To Email" 為 `{{to_email}}`
4. 測試時可以先發送到自己的信箱

## 🔧 故障排除

如果 Email 沒有發送：
1. 檢查 Console 是否有錯誤訊息
2. 確認 Service ID、Template ID、Public Key 都正確
3. 檢查 EmailJS Dashboard 的 "Usage" 是否有記錄
4. 確認郵件服務已正確連接
5. 檢查垃圾郵件資料夾
