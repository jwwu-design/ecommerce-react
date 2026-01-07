import * as Route from '@/constants/routes';
import logo from '@/images/logo-full.png';
import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Footer = () => {
  const { pathname } = useLocation();

  const visibleOnlyPath = [
    Route.HOME,
    Route.SHOP,
    Route.PRIVACY_POLICY,
    Route.TERMS,
    Route.SHOPPING_GUIDE,
    Route.FAQ
  ];

  return !visibleOnlyPath.includes(pathname) ? null : (
    <footer className="footer">
      <div className="footer-col-1">
        <strong>
          <span>
            <Link to={Route.PRIVACY_POLICY}>
              隱私權政策
            </Link>
            <Link to={Route.TERMS}>
              會員條款
            </Link>
          </span>
        </strong>
      </div>
      <div className="footer-col-2">
        {/* <img alt="Footer logo" className="footer-logo" src={logo} /> */}
        <h5>
          版權所有 ARES 亞瑞仕國際驗證股份有限公司
          &copy;&nbsp;
          {new Date().getFullYear()}
        </h5>
      </div>
      <div className="footer-col-3">
        <strong>
          <span>
            <Link to={Route.SHOPPING_GUIDE}>
              購物須知
            </Link>
            <Link to={Route.FAQ}>
              常見問題
            </Link>
          </span>
        </strong>
      </div>
    </footer>
  );
};

export default Footer;
