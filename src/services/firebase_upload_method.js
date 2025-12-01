uploadRegistrationForm = async (userId, userName, file) => {
  try {
    const timestamp = new Date().getTime();
    const fileName = `${timestamp}.docx`;
    // 使用 userName-userId 格式，方便識別
    // 清理使用者名稱中的特殊字元
    const sanitizedUserName = userName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
    const folderName = `${sanitizedUserName}-${userId}`;
    const fileRef = this.storage.ref(`registration-forms/submissions/${folderName}/${fileName}`);

    const snapshot = await fileRef.put(file);
    const downloadURL = await snapshot.ref.getDownloadURL();

    return { downloadURL, fileName, timestamp };
  } catch (error) {
    throw new Error("上傳報名表單失敗，請稍後再試。");
  }
};