# 如何更新 sendRejectionEmail 方法使用 EmailJS

## 📝 需要手動修改的檔案

檔案：`src/services/firebase.js`

找到第 701-735 行的 `sendRejectionEmail` 方法，替換為以下內容：

```javascript
  // 發送拒絕通知 Email
  sendRejectionEmail = async ({ orderId, customerEmail, customerName, reason }) => {
    try {
      console.log('📧 Sending rejection email via EmailJS...');
      console.log('To:', customerEmail);
      console.log('Order ID:', orderId);
      console.log('Reason:', reason);
      
      // 動態導入 EmailJS（避免 SSR 問題）
      const emailjs = await import('@emailjs/browser');
      
      // EmailJS 設定
      // TODO: 請在 https://www.emailjs.com/ 註冊並替換以下值
      // 詳細設定步驟請參考 EMAILJS_SETUP.md
      const SERVICE_ID = 'YOUR_SERVICE_ID';      // 例如：'service_abc123'
      const TEMPLATE_ID = 'YOUR_TEMPLATE_ID';    // 例如：'template_xyz789'
      const PUBLIC_KEY = 'YOUR_PUBLIC_KEY';      // 例如：'user_ABC123XYZ'
      
      // 檢查是否已設定
      if (SERVICE_ID === 'YOUR_SERVICE_ID') {
        console.warn('⚠️ EmailJS 尚未設定，使用模擬模式');
        console.warn('請參考 EMAILJS_SETUP.md 完成設定');
        console.log('Email 內容預覽：');
        console.log(`
親愛的 ${customerName}，您好：

很抱歉通知您，您的報名表單（訂單編號：${orderId}）審核未通過。

拒絕原因：${reason}

請聯繫我們的客服團隊以了解詳情：
電子郵件：ares@ares-cert.com
電話：06-2959696

您可以重新上傳報名表單，我們會盡快為您處理。

祝您順心
Ares 團隊
        `);
        return { success: true, message: 'Email sent (simulated - EmailJS not configured)' };
      }
      
      // 發送 Email
      const response = await emailjs.default.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          to_email: customerEmail,
          to_name: customerName,
          order_id: orderId,
          reason: reason || '報名資料不符合要求',
          support_email: 'ares@ares-cert.com',
          support_phone: '06-2959696',
          company_name: 'Ares'
        },
        PUBLIC_KEY
      );
      
      console.log('✅ Email sent successfully:', response);
      return { success: true, message: 'Email sent', response };
    } catch (error) {
      console.error('❌ Failed to send rejection email:', error);
      // Email 發送失敗不應該中斷審核流程
      return { success: false, message: 'Email failed but review completed', error };
    }
  };
```

## ✅ 完成後的步驟

1. 儲存檔案
2. 參考 `EMAILJS_SETUP.md` 完成 EmailJS 設定
3. 替換 `SERVICE_ID`、`TEMPLATE_ID`、`PUBLIC_KEY`
4. 測試功能

## 🧪 測試方式

1. 在後台拒絕一個訂單
2. 查看 Console：
   - 如果看到 "⚠️ EmailJS 尚未設定" → 需要設定 EmailJS
   - 如果看到 "✅ Email sent successfully" → 成功！
3. 檢查顧客信箱是否收到 Email
