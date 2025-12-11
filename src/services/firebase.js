import app from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import firebaseConfig from "./config";

class Firebase {
  constructor() {
    app.initializeApp(firebaseConfig);

    this.storage = app.storage();
    this.db = app.firestore();
    this.auth = app.auth();
  }

  // AUTH ACTIONS ------------

  createAccount = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  signIn = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  signInWithGoogle = () =>
    this.auth.signInWithPopup(new app.auth.GoogleAuthProvider());

  signInWithFacebook = () =>
    this.auth.signInWithPopup(new app.auth.FacebookAuthProvider());

  signInWithGithub = () =>
    this.auth.signInWithPopup(new app.auth.GithubAuthProvider());

  signOut = () => this.auth.signOut();

  passwordReset = (email) => this.auth.sendPasswordResetEmail(email);

  addUser = (id, user) => this.db.collection("users").doc(id).set(user);

  getUser = (id) => this.db.collection("users").doc(id).get();

  passwordUpdate = (password) => this.auth.currentUser.updatePassword(password);

  changePassword = (currentPassword, newPassword) =>
    new Promise((resolve, reject) => {
      this.reauthenticate(currentPassword)
        .then(() => {
          const user = this.auth.currentUser;
          user
            .updatePassword(newPassword)
            .then(() => {
              resolve("密碼已成功更新！");
            })
            .catch((error) => reject(error));
        })
        .catch((error) => reject(error));
    });

  reauthenticate = (currentPassword) => {
    const user = this.auth.currentUser;
    const cred = app.auth.EmailAuthProvider.credential(
      user.email,
      currentPassword
    );

    return user.reauthenticateWithCredential(cred);
  };

  updateEmail = (currentPassword, newEmail) =>
    new Promise((resolve, reject) => {
      this.reauthenticate(currentPassword)
        .then(() => {
          const user = this.auth.currentUser;
          user
            .updateEmail(newEmail)
            .then(() => {
              resolve("電子郵件已成功更新");
            })
            .catch((error) => reject(error));
        })
        .catch((error) => reject(error));
    });

  updateProfile = (id, updates) =>
    this.db.collection("users").doc(id).update(updates);

  onAuthStateChanged = () =>
    new Promise((resolve, reject) => {
      this.auth.onAuthStateChanged((user) => {
        if (user) {
          resolve(user);
        } else {
          reject(new Error("驗證狀態變更失敗"));
        }
      });
    });

  saveBasketItems = (items, userId) =>
    this.db.collection("users").doc(userId).update({ basket: items });

  // UPDATE CART IN FIREBASE ------------
  updateCartInFirebase = async (userId, basketItems) => {
    try {
      if (!userId) {
        throw new Error("使用者 ID 不存在");
      }

      if (!Array.isArray(basketItems)) {
        throw new Error("購物車資料格式錯誤");
      }

      // Use set with merge to create document if it doesn't exist
      await this.db.collection("users").doc(userId).set(
        { basket: basketItems },
        { merge: true }
      );

      console.log(`✅ Firebase: Updated basket for user ${userId}, items count: ${basketItems.length}`);
    } catch (error) {
      console.error("❌ Firebase: updateCartInFirebase error:", error);
      throw new Error(`更新購物車失敗: ${error.message}`);
    }
  };

  setAuthPersistence = () =>
    this.auth.setPersistence(app.auth.Auth.Persistence.LOCAL);

  // // PRODUCT ACTIONS --------------

  getSingleProduct = (id) => this.db.collection("products").doc(id).get();

  getProducts = (lastRefKey) => {
    let didTimeout = false;

    return new Promise((resolve, reject) => {
      (async () => {
        if (lastRefKey) {
          try {
            const query = this.db
              .collection("products")
              .orderBy(app.firestore.FieldPath.documentId())
              .startAfter(lastRefKey)
              .limit(12);

            const snapshot = await query.get();
            const products = [];
            snapshot.forEach((doc) =>
              products.push({ id: doc.id, ...doc.data() })
            );
            const lastKey = snapshot.docs[snapshot.docs.length - 1];

            resolve({ products, lastKey });
          } catch (e) {
            reject(e?.message || ":( 取得商品失敗。");
          }
        } else {
          const timeout = setTimeout(() => {
            didTimeout = true;
            reject(new Error("請求逾時，請稍後再試"));
          }, 15000);

          try {
            const totalQuery = await this.db.collection("products").get();
            const total = totalQuery.docs.length;
            const query = this.db
              .collection("products")
              .orderBy(app.firestore.FieldPath.documentId())
              .limit(12);
            const snapshot = await query.get();

            clearTimeout(timeout);
            if (!didTimeout) {
              const products = [];
              snapshot.forEach((doc) =>
                products.push({ id: doc.id, ...doc.data() })
              );
              const lastKey = snapshot.docs[snapshot.docs.length - 1];

              resolve({ products, lastKey, total });
            }
          } catch (e) {
            if (didTimeout) return;
            reject(e?.message || ":( 取得商品失敗。");
          }
        }
      })();
    });
  };

  searchProducts = (searchKey) => {
    let didTimeout = false;

    return new Promise((resolve, reject) => {
      (async () => {
        const productsRef = this.db.collection("products");

        const timeout = setTimeout(() => {
          didTimeout = true;
          reject(new Error("請求逾時，請稍後再試"));
        }, 15000);

        try {
          const searchedNameRef = productsRef
            .orderBy("name_lower")
            .where("name_lower", ">=", searchKey)
            .where("name_lower", "<=", `${searchKey}\uf8ff`)
            .limit(12);
          const searchedKeywordsRef = productsRef
            .orderBy("dateAdded", "desc")
            .where("keywords", "array-contains-any", searchKey.split(" "))
            .limit(12);

          // const totalResult = await totalQueryRef.get();
          const nameSnaps = await searchedNameRef.get();
          const keywordsSnaps = await searchedKeywordsRef.get();
          // const total = totalResult.docs.length;

          clearTimeout(timeout);
          if (!didTimeout) {
            const searchedNameProducts = [];
            const searchedKeywordsProducts = [];
            let lastKey = null;

            if (!nameSnaps.empty) {
              nameSnaps.forEach((doc) => {
                searchedNameProducts.push({ id: doc.id, ...doc.data() });
              });
              lastKey = nameSnaps.docs[nameSnaps.docs.length - 1];
            }

            if (!keywordsSnaps.empty) {
              keywordsSnaps.forEach((doc) => {
                searchedKeywordsProducts.push({ id: doc.id, ...doc.data() });
              });
            }

            // MERGE PRODUCTS
            const mergedProducts = [
              ...searchedNameProducts,
              ...searchedKeywordsProducts,
            ];
            const hash = {};

            mergedProducts.forEach((product) => {
              hash[product.id] = product;
            });

            resolve({ products: Object.values(hash), lastKey });
          }
        } catch (e) {
          if (didTimeout) return;
          reject(e);
        }
      })();
    });
  };

  getFeaturedProducts = (itemsCount = 12) =>
    this.db
      .collection("products")
      .where("isFeatured", "==", true)
      .limit(itemsCount)
      .get();

  getRecommendedProducts = (itemsCount = 12) =>
    this.db
      .collection("products")
      .where("isRecommended", "==", true)
      .limit(itemsCount)
      .get();

  addProduct = (id, product) =>
    this.db.collection("products").doc(id).set(product);

  generateKey = () => this.db.collection("products").doc().id;

  storeImage = async (id, folder, imageFile) => {
    const snapshot = await this.storage.ref(folder).child(id).put(imageFile);
    const downloadURL = await snapshot.ref.getDownloadURL();

    return downloadURL;
  };

  deleteImage = (id) => this.storage.ref("products").child(id).delete();

  editProduct = (id, updates) =>
    this.db.collection("products").doc(id).update(updates);

  removeProduct = (id) => this.db.collection("products").doc(id).delete();

  // REGISTRATION FORM ACTIONS ------------

  // 取得報名表單範本的下載連結
  getRegistrationFormTemplate = async () => {
    try {
      const templateRef = this.storage.ref("registration-forms/template.docx");
      const downloadURL = await templateRef.getDownloadURL();
      return downloadURL;
    } catch (error) {
      throw new Error("無法取得報名表單範本，請稍後再試。");
    }
  };

  // 上傳報名表單範本（管理員用）
  uploadRegistrationFormTemplate = async (file) => {
    try {
      const templateRef = this.storage.ref("registration-forms/template.docx");
      await templateRef.put(file);
      const downloadURL = await templateRef.getDownloadURL();
      console.log('✅ Template uploaded successfully:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('❌ Failed to upload template:', error);
      throw new Error("上傳報名表單範本失敗，請稍後再試。");
    }
  };

  // 上傳使用者填寫的報名表單
  uploadRegistrationForm = async (userId, userEmail, file, orderId = null) => {
    try {
      const timestamp = new Date().getTime();

      // 統一路徑結構：registration-forms/useremail-userid/filename.docx
      let fileRef;
      let fileName;

      if (orderId && userEmail) {
        // 有 orderId：使用 orderId 作為檔名，這樣重新上傳時會覆蓋舊檔案
        const sanitizedEmail = userEmail.replace(/[@.]/g, '_');
        const folderName = `${sanitizedEmail}-${userId}`;
        fileName = `${orderId}.docx`;
        fileRef = this.storage.ref(`registration-forms/${folderName}/${fileName}`);
        console.log(`📁 Uploading to: registration-forms/${folderName}/${fileName}`);
      }
      else {
        // 沒有 orderId：使用時間戳記作為檔名（臨時上傳）
        fileName = `${timestamp}.docx`;
        const sanitizedEmail = userEmail ? userEmail.replace(/[@.]/g, '_') : 'unknown';
        const folderName = `${sanitizedEmail}-${userId}`;
        fileRef = this.storage.ref(`registration-forms/${folderName}/${fileName}`);
        console.log(`📁 Uploading to: registration-forms/${folderName}/${fileName}`);
      }

      const snapshot = await fileRef.put(file);
      const fileURL = await snapshot.ref.getDownloadURL();

      return {
        fileURL,
        fileName,
        timestamp,
        originalFileName: file.name,
        fileSize: file.size,
        uploadedAt: timestamp
      };
    } catch (error) {
      console.error('❌ Upload error:', error);
      throw new Error("上傳報名表單失敗，請稍後再試。");
    }
  };

  // 儲存報名表單上傳記錄到 Firestore
  saveRegistrationRecord = async (userId, formData) => {
    try {
      const recordId = this.db.collection("registrations").doc().id;
      await this.db.collection("registrations").doc(recordId).set({
        userId,
        ...formData,
        uploadedAt: new Date().getTime(),
        status: "submitted"
      });
      return recordId;
    } catch (error) {
      throw new Error("儲存報名記錄失敗，請稍後再試。");
    }
  };

  // ORDER MANAGEMENT ACTIONS ------------
  // 取得訂單列表（支援篩選與分頁）
  getOrders = async (filters = {}, lastRefKey = null) => {
    try {
      console.log('🔍 getOrders called with filters:', filters);

      // 檢查是否有篩選條件
      const hasFilters = filters.reviewStatus || filters.orderStatus || filters.paymentStatus || filters.shippingStatus;

      let query = this.db.collection("orders").orderBy("createdAt", "desc");

      // 如果有篩選條件，嘗試套用（可能需要索引）
      if (hasFilters) {
        try {
          // 審核狀態 (reviewStatus: approved/rejected/pending)
          if (filters.reviewStatus) {
            console.log('📌 Applying reviewStatus filter:', filters.reviewStatus);
            query = query.where("reviewStatus", "==", filters.reviewStatus);
          }
          // 訂單狀態 (orderStatus: processing/confirmed/shipped/delivered/cancelled)
          if (filters.orderStatus) {
            console.log('📌 Applying orderStatus filter:', filters.orderStatus);
            query = query.where("orderStatus", "==", filters.orderStatus);
          }
          if (filters.paymentStatus) {
            console.log('📌 Applying paymentStatus filter:', filters.paymentStatus);
            query = query.where("paymentStatus", "==", filters.paymentStatus);
          }
          if (filters.shippingStatus) {
            console.log('📌 Applying shippingStatus filter:', filters.shippingStatus);
            query = query.where("shippingStatus", "==", filters.shippingStatus);
          }
        } catch (indexError) {
          console.warn('⚠️ Firestore index not ready, will use client-side filtering');
        }
      }

      // 分頁
      if (lastRefKey) {
        query = query.startAfter(lastRefKey);
      }
      query = query.limit(100); // 增加限制以支援客戶端篩選

      console.log('🔄 Executing Firestore query...');
      const snapshot = await query.get();
      let orders = [];
      snapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });

      console.log(`✅ Found ${orders.length} orders from Firestore`);

      // 如果有篩選條件且 Firestore 查詢沒有套用篩選（索引未建立），則在客戶端篩選
      if (hasFilters && orders.length > 0) {
        const originalLength = orders.length;

        if (filters.reviewStatus) {
          orders = orders.filter(order => order.reviewStatus === filters.reviewStatus);
          console.log(`📌 Client-side reviewStatus filter: ${originalLength} -> ${orders.length}`);
        }
        if (filters.orderStatus) {
          orders = orders.filter(order => order.orderStatus === filters.orderStatus);
          console.log(`📌 Client-side orderStatus filter applied`);
        }
        if (filters.paymentStatus) {
          orders = orders.filter(order => order.paymentStatus === filters.paymentStatus);
          console.log(`📌 Client-side paymentStatus filter applied`);
        }
        if (filters.shippingStatus) {
          orders = orders.filter(order => order.shippingStatus === filters.shippingStatus);
          console.log(`📌 Client-side shippingStatus filter applied`);
        }
      }

      console.log(`✅ Final result: ${orders.length} orders`);
      if (orders.length > 0) {
        console.log('First order reviewStatus:', orders[0].reviewStatus);
      }

      const lastKey = snapshot.docs[snapshot.docs.length - 1];
      return { orders, lastKey };
    } catch (error) {
      console.error("❌ Failed to get orders:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      throw new Error("取得訂單列表失敗，請稍後再試。");
    }
  };

  // 搜尋訂單（依訂單編號、顧客名稱、Email、手機）
  searchOrders = async (searchTerm) => {
    try {
      const ordersRef = this.db.collection("orders");
      const orders = [];

      // 搜尋訂單編號
      const orderIdQuery = await ordersRef
        .where("orderId", ">=", searchTerm)
        .where("orderId", "<=", `${searchTerm}\uf8ff`)
        .limit(20)
        .get();

      orderIdQuery.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });

      // 搜尋顧客名稱
      const nameQuery = await ordersRef
        .where("customerInfo.fullname", ">=", searchTerm)
        .where("customerInfo.fullname", "<=", `${searchTerm}\uf8ff`)
        .limit(20)
        .get();

      nameQuery.forEach((doc) => {
        const order = { id: doc.id, ...doc.data() };
        if (!orders.find(o => o.id === order.id)) {
          orders.push(order);
        }
      });

      // 搜尋 Email
      const emailQuery = await ordersRef
        .where("customerInfo.email", ">=", searchTerm)
        .where("customerInfo.email", "<=", `${searchTerm}\uf8ff`)
        .limit(20)
        .get();

      emailQuery.forEach((doc) => {
        const order = { id: doc.id, ...doc.data() };
        if (!orders.find(o => o.id === order.id)) {
          orders.push(order);
        }
      });

      return orders;
    } catch (error) {
      throw new Error("搜尋訂單失敗，請稍後再試。");
    }
  };

  // 取得單筆訂單詳情
  getOrderById = async (orderId) => {
    try {
      const doc = await this.db.collection("orders").doc(orderId).get();
      if (!doc.exists) {
        throw new Error("訂單不存在");
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error("取得訂單詳情失敗，請稍後再試。");
    }
  };

  // 取得使用者的所有訂單
  getUserOrders = async (userId) => {
    try {
      const snapshot = await this.db
        .collection("orders")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();

      return snapshot;
    } catch (error) {
      console.error("❌ Failed to get user orders:", error);
      throw new Error("取得使用者訂單失敗，請稍後再試。");
    }
  };

  // 建立訂單
  createOrder = async (orderData) => {
    try {
      const timestamp = new Date().getTime();
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
      const orderId = orderData.orderId || `ORDER_${dateStr}_${randomStr}`;

      // Normalize mobile field
      const mobile = orderData.shipping?.mobile;
      const mobileValue = typeof mobile === 'object'
        ? (mobile.value || `${mobile.dialCode || ''}${mobile.value || ''}`)
        : mobile || '';

      const order = {
        orderId: orderData.orderId || orderId,  // 支援預先生成的 orderId
        userId: orderData.userId,
        customerInfo: {
          fullname: orderData.shipping?.fullname || orderData.userName,
          companyName: orderData.shipping?.companyName || '',
          email: orderData.shipping?.email || orderData.userEmail,
          mobile: mobileValue,
          invoiceInfo: orderData.shipping?.invoiceInfo || '',
          address: orderData.shipping?.address || '',
          englishName: orderData.shipping?.englishName || '',
          dietPreference: orderData.shipping?.dietPreference || '',
          couponType: orderData.shipping?.couponType || '無',
          couponCode: orderData.shipping?.couponCode || '',
          infoSource: orderData.shipping?.infoSource || '',
          infoSourceOther: orderData.shipping?.infoSourceOther || ''
        },
        items: orderData.items || [],
        totalAmount: orderData.total || 0,
        subtotal: orderData.subtotal || 0,
        shippingFee: orderData.shippingFee || 0,
        reviewStatus: 'pending',
        orderStatus: 'processing',
        paymentStatus: 'pending',
        shippingStatus: 'pending',
        createdAt: timestamp,
        updatedAt: timestamp,
        registrationForm: orderData.registrationForm || null
      };

      await this.db.collection("orders").doc(orderId).set(order);

      return { orderId, order };
    } catch (error) {
      console.error("❌ Failed to create order:", error);
      throw new Error("建立訂單失敗，請稍後再試。");
    }
  };

  // 更新訂單審核狀態
  updateOrderStatus = async (orderId, status, reviewNote = '') => {
    try {
      const updateData = {
        reviewStatus: status, // 'approved', 'rejected', 'pending'
        reviewedAt: new Date().getTime(),
        reviewNote: reviewNote,
        updatedAt: new Date().getTime()
      };

      await this.db.collection("orders").doc(orderId).update(updateData);
      console.log(`✅ Updated order ${orderId} status to ${status}`);

      return updateData;
    } catch (error) {
      console.error("❌ Failed to update order status:", error);
      throw new Error("更新訂單狀態失敗，請稍後再試。");
    }
  };

  // 更新訂單的報名表單資訊
  updateOrderRegistrationForm = async (orderId, formData) => {
    try {
      await this.db.collection("orders").doc(orderId).update({
        registrationForm: formData,
        updatedAt: new Date().getTime()
      });
      console.log(`✅ Updated registration form for order ${orderId}`);
    } catch (error) {
      console.error("❌ Failed to update registration form:", error);
      throw new Error("更新報名表單資訊失敗，請稍後再試。");
    }
  };

  // USER MANAGEMENT ACTIONS ------------

  // 取得所有用戶列表
  getAllUsers = async () => {
    try {
      const snapshot = await this.db.collection("users").get();
      const users = [];
      snapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });
      return users;
    } catch (error) {
      console.error("Failed to get users:", error);
      throw new Error("無法取得用戶列表");
    }
  };

  // 取得用戶的訂單統計
  getUserOrderStats = async (userId) => {
    try {
      const snapshot = await this.db
        .collection("orders")
        .where("userId", "==", userId)
        .get();

      let orderCount = 0;
      let totalSpent = 0;

      snapshot.forEach((doc) => {
        const order = doc.data();
        orderCount++;
        totalSpent += order.totalAmount || 0;
      });

      return { orderCount, totalSpent };
    } catch (error) {
      console.error("Failed to get user order stats:", error);
      return { orderCount: 0, totalSpent: 0 };
    }
  };

  // 更新用戶資料
  updateUser = async (userId, updates) => {
    try {
      await this.db.collection("users").doc(userId).update({
        ...updates,
        updatedAt: new Date().toUTCString()
      });
      console.log(`✅ Updated user ${userId}`);
    } catch (error) {
      console.error("Failed to update user:", error);
      throw new Error("更新用戶資料失敗");
    }
  };

  // 更新用戶角色
  updateUserRole = async (userId, role) => {
    try {
      await this.db.collection("users").doc(userId).update({
        role,
        updatedAt: new Date().toUTCString()
      });
      console.log(`✅ Updated user ${userId} role to ${role}`);
    } catch (error) {
      console.error("Failed to update user role:", error);
      throw new Error("更新用戶角色失敗");
    }
  };

  // 停用/啟用用戶
  toggleUserStatus = async (userId, isActive) => {
    try {
      await this.db.collection("users").doc(userId).update({
        isActive,
        updatedAt: new Date().toUTCString()
      });
      console.log(`✅ User ${userId} is now ${isActive ? 'active' : 'inactive'}`);
    } catch (error) {
      console.error("Failed to toggle user status:", error);
      throw new Error("更新用戶狀態失敗");
    }
  };

  // 發送拒絕通知 Email
  sendRejectionEmail = async ({ orderId, customerEmail, customerName, reason }) => {
    try {
      // 動態導入 EmailJS（避免 SSR 問題）
      const emailjs = await import('@emailjs/browser');

      // EmailJS 設定
      const SERVICE_ID = 'service_9uqmwds';      // 例如：'service_abc123'
      const TEMPLATE_ID = 'template_3lzj7gz';    // 例如：'template_xyz789'
      const PUBLIC_KEY = 'Lu_-1Zzum7gYvL1UU';      // 例如：'user_ABC123XYZ'

      // 檢查是否已設定
      if (SERVICE_ID === 'YOUR_SERVICE_ID') {
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

  // 發送審核通過通知 Email
  sendApprovalEmail = async ({ orderId, customerEmail, customerName, orderUrl }) => {
    try {
      // 動態導入 EmailJS（避免 SSR 問題）
      const emailjs = await import('@emailjs/browser');

      // EmailJS 設定
      const SERVICE_ID = 'service_9uqmwds';
      const TEMPLATE_ID = 'template_34krn9i';    // 需要在 EmailJS 建立審核通過的模板
      const PUBLIC_KEY = 'Lu_-1Zzum7gYvL1UU';

      // 檢查是否已設定
      if (SERVICE_ID === 'YOUR_SERVICE_ID') {
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
          order_url: orderUrl,
          support_email: 'ares@ares-cert.com',
          support_phone: '06-2959696',
          company_name: 'Ares'
        },
        PUBLIC_KEY
      );

      console.log('✅ Approval email sent successfully:', response);
      return { success: true, message: 'Approval email sent', response };
    } catch (error) {
      console.error('❌ Failed to send approval email:', error);
      // Email 發送失敗不應該中斷審核流程
      return { success: false, message: 'Email failed but review completed', error };
    }
  };
}

const firebaseInstance = new Firebase();

export default firebaseInstance;
