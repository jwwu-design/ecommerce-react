import { EditOutlined, LoadingOutlined } from '@ant-design/icons';
import { Boundary, ImageLoader } from '@/components/common';
import { Formik } from 'formik';
import {
  useDocumentTitle, useFileHandler, useModal, useScrollTop
} from '@/hooks';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '@/redux/actions/miscActions';
import { updateProfile } from '@/redux/actions/profileActions';
import * as Yup from 'yup';
import ConfirmModal from './ConfirmModal';
import EditForm from './EditForm';

const FormSchema = Yup.object().shape({
  fullname: Yup.string()
    .min(2, '姓名至少需要 2 個字元。')
    .max(60, '姓名長度不能超過 60 個字元。')
    .required('姓名為必填欄位'),
  email: Yup.string()
    .email('電子郵件格式不正確。')
    .required('電子郵件為必填欄位。'),
  address: Yup.string(),
  mobile: Yup.object()
    .shape({
      country: Yup.string(),
      countryCode: Yup.string(),
      dialCode: Yup.string(),
      value: Yup.string()
    })
});

const EditProfile = () => {
  useDocumentTitle('編輯帳號資料 | Ares');
  useScrollTop();

  const modal = useModal();
  const dispatch = useDispatch();

  useEffect(() => () => {
    dispatch(setLoading(false));
  }, []);

  const { profile, auth, isLoading } = useSelector((state) => ({
    profile: state.profile,
    auth: state.auth,
    isLoading: state.app.loading
  }));

  const initFormikValues = {
    fullname: profile.fullname || '',
    email: profile.email || '',
    address: profile.address || '',
    mobile: profile.mobile || {}
  };

  const {
    imageFile,
    isFileLoading,
    onFileChange
  } = useFileHandler({ avatar: {}, banner: {} });

  const update = (form, credentials = {}) => {
    dispatch(updateProfile({
      updates: {
        fullname: form.fullname,
        email: form.email,
        address: form.address,
        mobile: form.mobile,
        avatar: profile.avatar,
        banner: profile.banner
      },
      files: {
        bannerFile: imageFile.banner.file,
        avatarFile: imageFile.avatar.file
      },
      credentials
    }));
  };

  const onConfirmUpdate = (form, password) => {
    if (password) {
      update(form, { email: form.email, password });
    }
  };

  const onSubmitUpdate = (form) => {
    // 檢查資料是否有變更
    const fieldsChanged = Object.keys(form).some((key) => profile[key] !== form[key]);

    if (fieldsChanged || (Boolean(imageFile.banner.file || imageFile.avatar.file))) {
      if (form.email !== profile.email) {
        modal.onOpenModal();
      } else {
        update(form);
      }
    }
  };

  return (
    <Boundary>
      <div className="edit-user">
        <h3 className="text-center">編輯帳號資料</h3>
        <Formik
          initialValues={initFormikValues}
          validateOnChange
          validationSchema={FormSchema}
          onSubmit={onSubmitUpdate}
        >
          {() => (
            <>
              <div className="user-profile-banner">
                <div className="user-profile-banner-wrapper">
                  <ImageLoader
                    alt="橫幅圖片"
                    className="user-profile-banner-img"
                    src={imageFile.banner.url || profile.banner}
                  />
                  {isFileLoading ? (
                    <div className="loading-wrapper">
                      <LoadingOutlined />
                    </div>
                  ) : (
                    <label
                      className="edit-button edit-banner-button"
                      htmlFor="edit-banner"
                    >
                      <input
                        accept="image/x-png,image/jpeg"
                        disabled={isLoading}
                        hidden
                        id="edit-banner"
                        onChange={(e) => onFileChange(e, { name: 'banner', type: 'single' })}
                        type="file"
                      />
                      <EditOutlined />
                    </label>
                  )}
                </div>
                <div className="user-profile-avatar-wrapper">
                  <ImageLoader
                    alt="大頭貼"
                    className="user-profile-img"
                    src={imageFile.avatar.url || profile.avatar}
                  />
                  {isFileLoading ? (
                    <div className="loading-wrapper">
                      <LoadingOutlined />
                    </div>
                  ) : (
                    <label
                      className="edit-button edit-avatar-button"
                      htmlFor="edit-avatar"
                    >
                      <input
                        accept="image/x-png,image/jpeg"
                        disabled={isLoading}
                        hidden
                        id="edit-avatar"
                        onChange={(e) => onFileChange(e, { name: 'avatar', type: 'single' })}
                        type="file"
                      />
                      <EditOutlined />
                    </label>
                  )}
                </div>
              </div>
              <EditForm
                authProvider={auth.provider}
                isLoading={isLoading}
              />
              <ConfirmModal
                onConfirmUpdate={onConfirmUpdate}
                modal={modal}
              />
            </>
          )}
        </Formik>
      </div>
    </Boundary>
  );
};

export default EditProfile;
