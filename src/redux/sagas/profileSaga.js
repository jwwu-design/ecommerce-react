import { UPDATE_EMAIL, UPDATE_PROFILE } from '@/constants/constants';
import { ACCOUNT } from '@/constants/routes';
import { displayActionMessage } from '@/helpers/utils';
import { call, put, select } from 'redux-saga/effects';
import { history } from '@/routers/AppRouter';
import firebase from '@/services/firebase';
import { setLoading } from '../actions/miscActions';
import { updateProfileSuccess } from '../actions/profileActions';

function* profileSaga({ type, payload }) {
  switch (type) {
    case UPDATE_EMAIL: {
      try {
        yield put(setLoading(false));
        yield call(firebase.updateEmail, payload.password, payload.newEmail);

        yield put(setLoading(false));
        yield call(history.push, '/profile');
        yield call(displayActionMessage, '電子郵件更新成功！', 'success');
      } catch (e) {
        console.log(e.message);
      }
      break;
    }
    case UPDATE_PROFILE: {
      try {
        const state = yield select();
        const { email, password } = payload.credentials;
        const { avatarFile, bannerFile } = payload.files;

        yield put(setLoading(true));

        // if email & password exist && the email has been edited
        // update the email
        if (email && password && email !== state.profile.email) {
          yield call(firebase.updateEmail, password, email);
        }

        if (avatarFile || bannerFile) {
          const bannerURL = bannerFile ? yield call(firebase.storeImage, state.auth.id, 'banner', bannerFile) : payload.updates.banner;
          const avatarURL = avatarFile ? yield call(firebase.storeImage, state.auth.id, 'avatar', avatarFile) : payload.updates.avatar;
          const updates = { ...payload.updates, avatar: avatarURL, banner: bannerURL };

          yield call(firebase.updateProfile, state.auth.id, updates);
          yield put(updateProfileSuccess(updates));
        } else {
          yield call(firebase.updateProfile, state.auth.id, payload.updates);
          yield put(updateProfileSuccess(payload.updates));
        }

        yield put(setLoading(false));
        yield call(history.push, ACCOUNT);
        yield call(displayActionMessage, '個人資料更新成功！', 'success');
      } catch (e) {
        console.log(e);
        yield put(setLoading(false));
        if (e.code === 'auth/wrong-password') {
          yield call(displayActionMessage, '密碼錯誤，個人資料更新失敗', 'error');
        } else {
          yield call(displayActionMessage, `更新個人資料失敗：${e.message ? e.message : ''}`, 'error');
        }
      }
      break;
    }
    default: {
      throw new Error('發生未預期的操作類型。');
    }
  }
}

export default profileSaga;
