/* eslint-disable indent */
import { ImageLoader } from '@/components/common';
import { ACCOUNT_EDIT } from '@/constants/routes';
import { displayDate } from '@/helpers/utils';
import PropType from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';
import { withRouter } from 'react-router-dom';
import defaultAvatar from '@/images/defaultAvatar.jpg';
import defaultBanner from '@/images/defaultBanner.jpg';
const UserProfile = (props) => {
  const profile = useSelector((state) => state.profile);
  
  return (
    <div className="user-profile">
      <div className="user-profile-block">
        <div className="user-profile-banner">
          <div className="user-profile-banner-wrapper">
            <ImageLoader
              alt="橫幅圖片"
              className="user-profile-banner-img"
              src={defaultBanner}
            />
          </div>
          <div className="user-profile-avatar-wrapper">
            <ImageLoader
              alt="頭像"
              className="user-profile-img"
              src={defaultAvatar}
            />
          </div>
          <button
            className="button button-small user-profile-edit"
            onClick={() => props.history.push(ACCOUNT_EDIT)}
            type="button"
          >
            編輯帳號
          </button>
        </div>
        <div className="user-profile-details">
          <h2 className="user-profile-name">{profile.fullname}</h2>
          <span>電子郵件</span>
          <br />
          <h5>{profile.email}</h5>
          <span>地址</span>
          <br />
          {profile.address ? (
            <h5>{profile.address}</h5>
          ) : (
            <h5 className="text-subtle text-italic">尚未設定地址</h5>
          )}
          <span>手機號碼</span>
          <br />
          {profile.mobile ? (
            <h5>{profile.mobile.value}</h5>
          ) : (
            <h5 className="text-subtle text-italic">尚未設定手機號碼</h5>
          )}
          <span>加入日期</span>
          <br />
          {profile.dateJoined ? (
            <h5>{displayDate(profile.dateJoined)}</h5>
          ) : (
            <h5 className="text-subtle text-italic">無可用資料</h5>
          )}
        </div>
      </div>
    </div>
  );
};

UserProfile.propTypes = {
  history: PropType.shape({
    push: PropType.func
  }).isRequired
};

export default withRouter(UserProfile);
