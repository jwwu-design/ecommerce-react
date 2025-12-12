const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');
const cors = require('cors')({ origin: true });

admin.initializeApp();

// 綠界金流設定
// 環境切換：設定 USE_TEST_ENV = true 使用測試環境，false 使用正式環境
const USE_TEST_ENV = true;

const ECPAY_CONFIG = USE_TEST_ENV ? {
    // 綠界公用測試帳號
    MerchantID: '2000132',
    HashKey: '5294y06JbISpM5x9',
    HashIV: 'v77hoKGq4kWxNNIS',
    ApiUrl: 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5'
} : {
    // 正式環境設定
    MerchantID: '3413890',
    HashKey: 'LQUm9]geY69ZuIY9',
    HashIV: 'VjDqmf]pzc9qbK6b',
    ApiUrl: 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5'
};

// CheckMacValue 計算函式
function generateCheckMacValue(params, hashKey, hashIV) {
    // 1. 將參數依照 Key 做 ASCII 排序
    const sortedKeys = Object.keys(params).sort();

    // 2. 組合成 key1=value1&key2=value2... 格式
    const paramStr = sortedKeys.map(key => `${key}=${params[key]}`).join('&');

    // 3. 前後加上 HashKey 和 HashIV
    const rawStr = `HashKey=${hashKey}&${paramStr}&HashIV=${hashIV}`;

    // 4. URL encode (使用 .NET URLEncode 邏輯)
    let urlEncoded = '';
    for (let i = 0; i < rawStr.length; i++) {
        const char = rawStr[i];
        const code = rawStr.charCodeAt(i);

        // 不編碼的字符：英數字、-_.!*()
        if ((code >= 48 && code <= 57) || // 0-9
            (code >= 65 && code <= 90) || // A-Z
            (code >= 97 && code <= 122) || // a-z
            char === '-' || char === '_' || char === '.' ||
            char === '!' || char === '*' || char === '(' || char === ')') {
            urlEncoded += char;
        } else if (char === ' ') {
            urlEncoded += '+';
        } else {
            // 其他字符使用 UTF-8 編碼後轉為 %HEX
            const bytes = Buffer.from(char, 'utf8');
            for (let j = 0; j < bytes.length; j++) {
                const hex = bytes[j].toString(16).toUpperCase();
                urlEncoded += '%' + (hex.length === 1 ? '0' + hex : hex);
            }
        }
    }

    // 5. 轉小寫
    const lowerStr = urlEncoded.toLowerCase();

    // 6. SHA256 雜湊
    const hash = crypto.createHash('sha256').update(lowerStr).digest('hex');

    // 7. 轉大寫
    return hash.toUpperCase();
}

// 產生綠界付款表單
exports.createECPayOrder = functions.https.onCall(async (data, context) => {
    // 驗證使用者已登入
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', '使用者未登入');
    }

    const { orderId, totalAmount, itemName, customerEmail } = data;

    // 驗證必要參數
    if (!orderId || !totalAmount || !itemName) {
        throw new functions.https.HttpsError('invalid-argument', '缺少必要參數');
    }

    // 驗證訂單屬於該使用者
    const orderRef = admin.firestore().collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
        throw new functions.https.HttpsError('not-found', '訂單不存在');
    }

    const orderData = orderDoc.data();
    if (orderData.userId !== context.auth.uid) {
        throw new functions.https.HttpsError('permission-denied', '無權限存取此訂單');
    }

    // 檢查訂單是否已付款
    if (orderData.paymentStatus === 'paid') {
        throw new functions.https.HttpsError('failed-precondition', '訂單已付款');
    }

    // 產生交易時間 (台灣時區 UTC+8)
    const now = new Date();
    const twTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const merchantTradeDate = twTime.toISOString()
        .replace('T', ' ')
        .replace(/\.\d+Z$/, '')
        .split(' ')[0].replace(/-/g, '/') + ' ' + twTime.toISOString().split('T')[1].slice(0, 8);

    // 產生綠界交易編號（最多20字元）
    // 格式：timestamp(10碼) + random(10碼) = 20碼
    const timestamp = now.getTime().toString().slice(-10);
    const randomStr = Math.random().toString(36).substring(2, 12).toUpperCase();
    const merchantTradeNo = timestamp + randomStr;

    // 儲存交易編號與訂單 ID 的對應關係到訂單中
    await orderRef.update({
        ecpayTradeNo: merchantTradeNo,
        ecpayTradeDate: now.getTime(),
        updatedAt: now.getTime()
    });

    // 取得 Cloud Function URL (用於回調)
    const functionUrl = `https://us-central1-${process.env.GCLOUD_PROJECT}.cloudfunctions.net`;

    // 組合綠界所需參數
    const ecpayParams = {
        MerchantID: ECPAY_CONFIG.MerchantID,
        MerchantTradeNo: merchantTradeNo,
        MerchantTradeDate: merchantTradeDate,
        PaymentType: 'aio',
        TotalAmount: Math.round(totalAmount), // 確保是整數
        TradeDesc: '課程報名',
        ItemName: itemName.substring(0, 200), // 限制長度
        ReturnURL: `${functionUrl}/ecpayCallback`,
        OrderResultURL: `${functionUrl}/ecpayReturn`,
        ClientBackURL: `${data.clientBackURL || 'https://your-domain.com'}/checkout/step4?orderId=${orderId}`,
        ChoosePayment: 'Credit',
        EncryptType: 1
    };

    // 產生 CheckMacValue
    ecpayParams.CheckMacValue = generateCheckMacValue(ecpayParams, ECPAY_CONFIG.HashKey, ECPAY_CONFIG.HashIV);

    // 詳細 log 用於除錯
    functions.logger.log('ECPay params:', JSON.stringify(ecpayParams, null, 2));
    functions.logger.log('CheckMacValue:', ecpayParams.CheckMacValue);

    // 產生 HTML form
    const formHtml = `
        <form id="ecpay-form" method="post" action="${ECPAY_CONFIG.ApiUrl}">
            ${Object.keys(ecpayParams).map(key =>
                `<input type="hidden" name="${key}" value="${ecpayParams[key]}" />`
            ).join('\n')}
        </form>
    `;

    functions.logger.log('Created ECPay order:', orderId, merchantTradeNo, totalAmount);

    return { formHtml, params: ecpayParams };
});

// 接收綠界付款結果回調
exports.ecpayCallback = functions.https.onRequest(async (req, res) => {
    return cors(req, res, async () => {
        try {
            if (req.method !== 'POST') {
                res.status(405).send('Method Not Allowed');
                return;
            }

            const data = req.body;
            functions.logger.log('ECPay callback received:', data);

            // 驗證 CheckMacValue
            const receivedCheckMac = data.CheckMacValue;
            delete data.CheckMacValue;

            const calculatedCheckMac = generateCheckMacValue(data, ECPAY_CONFIG.HashKey, ECPAY_CONFIG.HashIV);

            if (receivedCheckMac !== calculatedCheckMac) {
                functions.logger.error('CheckMacValue verification failed');
                res.status(400).send('0|CheckMacValue verification failed');
                return;
            }

            // 透過綠界交易編號找到原始訂單
            const ecpayTradeNo = data.MerchantTradeNo;
            const ordersSnapshot = await admin.firestore().collection('orders')
                .where('ecpayTradeNo', '==', ecpayTradeNo)
                .limit(1)
                .get();

            if (ordersSnapshot.empty) {
                functions.logger.error('Order not found for ecpayTradeNo:', ecpayTradeNo);
                res.status(404).send('0|Order not found');
                return;
            }

            const orderDoc = ordersSnapshot.docs[0];
            const orderId = orderDoc.id;

            const paymentStatus = data.RtnCode === '1' ? 'paid' : 'failed';

            await orderDoc.ref.update({
                paymentStatus: paymentStatus,
                payment: {
                    TradeNo: data.TradeNo,
                    RtnCode: data.RtnCode,
                    RtnMsg: data.RtnMsg,
                    PaymentDate: data.PaymentDate,
                    PaymentType: data.PaymentType,
                    PaymentTypeChargeFee: data.PaymentTypeChargeFee,
                    TradeAmt: data.TradeAmt,
                    updatedAt: new Date().getTime()
                },
                updatedAt: new Date().getTime()
            });

            functions.logger.log('Order payment status updated:', orderId, ecpayTradeNo, paymentStatus);

            // 回傳 1|OK 給綠界
            res.status(200).send('1|OK');
        } catch (error) {
            functions.logger.error('ECPay callback error:', error);
            res.status(500).send('0|Error');
        }
    });
});

// 處理前端返回
exports.ecpayReturn = functions.https.onRequest(async (req, res) => {
    return cors(req, res, async () => {
        try {
            const data = req.method === 'POST' ? req.body : req.query;
            functions.logger.log('ECPay return received:', data);

            const ecpayTradeNo = data.MerchantTradeNo;
            const rtnCode = data.RtnCode;

            // 透過綠界交易編號找到原始訂單
            const ordersSnapshot = await admin.firestore().collection('orders')
                .where('ecpayTradeNo', '==', ecpayTradeNo)
                .limit(1)
                .get();

            let orderId = ecpayTradeNo; // 預設使用交易編號
            if (!ordersSnapshot.empty) {
                orderId = ordersSnapshot.docs[0].id;
            }

            // 導向到結果頁面 (使用 localhost 或你的實際網域)
            const baseUrl = 'http://localhost:3000'; // 測試環境用 localhost
            const redirectUrl = rtnCode === '1'
                ? `${baseUrl}/checkout/confirmation/${orderId}?payment=success`
                : `${baseUrl}/checkout/step4?orderId=${orderId}&payment=failed`;

            functions.logger.log('Redirecting to:', redirectUrl);
            res.redirect(redirectUrl);
        } catch (error) {
            functions.logger.error('ECPay return error:', error);
            res.status(500).send('Error processing payment result');
        }
    });
});

exports.lowercaseProductName = functions.firestore.document('/products/{documentId}')
    .onCreate((snap, context) => {
        const name = snap.data().name;

        functions.logger.log('Lowercasing product name', context.params.documentId, name);

        const lowercaseName = name.toLowerCase();

        return snap.ref.set({ name_lower: lowercaseName }, { merge: true });
    });

