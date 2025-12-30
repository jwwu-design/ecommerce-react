import * as Route from '@/constants/routes';
import logo from '@/images/logo-full.png';
import React from 'react';
import { useLocation } from 'react-router-dom';

const Footer = () => {
  const { pathname } = useLocation();

  const visibleOnlyPath = [
    Route.HOME,
    Route.SHOP
  ];

  return !visibleOnlyPath.includes(pathname) ? null : (
    <footer className="footer">
      <div className="footer-col-1">
        <strong>
          <span>
            <a href="/files/亞瑞仕知識學苑_隱私權政策.docx" download="亞瑞仕知識學苑_隱私權政策.docx">
              隱私權政策
            </a>
            <a href="/files/亞瑞仕知識學苑_會員條款.docx" download="亞瑞仕知識學苑_會員條款.docx">
              會員條款
            </a>
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
            <a href="/files/亞瑞仕知識學苑_購物須知.docx" download="亞瑞仕知識學苑_購物須知.docx">
              購物須知
            </a>
            <a href="/files/亞瑞仕知識學苑_常見問題.docx" download="亞瑞仕知識學苑_常見問題.docx">
              常見問題
            </a>
          </span>
        </strong>
      </div>
    </footer>
  );
};

export default Footer;
