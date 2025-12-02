import { ADMIN_DASHBOARD } from '@/constants/routes';
import logo from '@/images/logo-full.png';
import React from 'react';
import { useSelector } from 'react-redux';
import UserAvatar from '@/views/account/components/UserAvatar';
import {
  Link, NavLink, useLocation
} from 'react-router-dom';
import * as ROUTE from '@/constants/routes';

const AdminNavigation = () => {
  const { isAuthenticating, profile } = useSelector((state) => ({
    isAuthenticating: state.app.isAuthenticating,
    profile: state.profile
  }));

  return (
    <nav className="navigation navigation-admin">
      <div className="logo">
        <Link to={ADMIN_DASHBOARD} style={{ display: 'flex', alignItems: 'center' }}>
          <img alt="Logo" src={logo} />
          <li>管理員面板</li>
          <li><NavLink activeClassName="navigation-menu-active" to={ROUTE.HOME}>網站前臺</NavLink></li>
        </Link>
      </div>
      <ul className="navigation-menu">
        <li className="navigation-menu-item">
          <UserAvatar
            isAuthenticating={isAuthenticating}
            profile={profile}
          />
        </li>
      </ul>
    </nav>
  );
};

export default AdminNavigation;
