import { BasketToggle } from '@/components/basket';
import { HOME, SIGNIN, SHOP, FEATURED_PRODUCTS, RECOMMENDED_PRODUCTS, CONTACT, ACCOUNT, SIGNOUT, SEARCH } from '@/constants/routes';
import logo from '@/images/logo-full.png';
import PropType from 'prop-types';
import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Badge from './Badge';
import FiltersToggle from './FiltersToggle';
import SearchBar from './SearchBar';

const Navigation = (props) => {
  const {
    isAuthenticating, basketLength, disabledPaths, user
  } = props;
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const onClickLink = (e) => {
    if (isAuthenticating) e.preventDefault();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="mobile-navigation">
      <div className="mobile-navigation-main">
        <div className="mobile-navigation-logo">
          <Link onClick={onClickLink} to={HOME}>
            <img alt="亞瑞仕知識學苑" src={logo} />
          </Link>
        </div>

        <BasketToggle>
          {({ onClickToggle }) => (
            <button
              className="button-link navigation-menu-link basket-toggle"
              onClick={onClickToggle}
              disabled={disabledPaths.includes(pathname)}
              type="button"
            >
              <Badge count={basketLength}>
                <i className="fa fa-shopping-bag" style={{ fontSize: '2rem' }} />
              </Badge>
            </button>
          )}
        </BasketToggle>

        {/* Hamburger Icon */}
        <button
          className="hamburger-menu-button"
          onClick={toggleMenu}
          type="button"
          aria-label="選單"
        >
          <i className="fa fa-bars" style={{ fontSize: '2rem' }} />
        </button>
      </div>

      <div className="mobile-navigation-sec">
        <SearchBar />
        {(pathname === SHOP || pathname === SEARCH) && (
          <FiltersToggle>
            <button className="button-link button-small" type="button">
              <i className="fa fa-filter" />
            </button>
          </FiltersToggle>
        )}
      </div>

      {/* Hamburger Drawer */}
      {isMenuOpen && <div className="hamburger-overlay" onClick={closeMenu} />}
      <div className={`hamburger-drawer ${isMenuOpen ? 'open' : ''}`}>
        <div className="hamburger-drawer-header">
          <h3>選單</h3>
          <button
            className="hamburger-close-button"
            onClick={closeMenu}
            type="button"
            aria-label="關閉選單"
          >
            <i className="fa fa-times" />
          </button>
        </div>

        <div className="hamburger-drawer-content">
          {/* Navigation Links */}
          <div className="hamburger-section">
            <ul className="hamburger-nav-list">
              <li>
                <NavLink exact to={HOME} onClick={closeMenu}>
                  <i className="fa fa-home" /> 首頁
                </NavLink>
              </li>
              <li>
                <NavLink to={SHOP} onClick={closeMenu}>
                  <i className="fa fa-shopping-cart" /> ISO 課程
                </NavLink>
              </li>
              <li>
                <NavLink to={FEATURED_PRODUCTS} onClick={closeMenu}>
                  <i className="fa fa-star" /> 近期課程
                </NavLink>
              </li>
              <li>
                <NavLink to={RECOMMENDED_PRODUCTS} onClick={closeMenu}>
                  <i className="fa fa-trophy" /> 永續治理領袖前哨站
                </NavLink>
              </li>
              <li>
                <NavLink to={CONTACT} onClick={closeMenu}>
                  <i className="fa fa-envelope" /> 聯絡我們
                </NavLink>
              </li>
            </ul>
          </div>

          {/* User Section */}
          <div className="hamburger-section hamburger-user-section">
            {user ? (
              <>
                <h4 className="hamburger-section-title">帳戶管理</h4>
                <ul className="hamburger-nav-list">
                  <li>
                    <NavLink to={ACCOUNT} onClick={closeMenu}>
                      <i className="fa fa-user" /> 個人資訊
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to={SIGNOUT} onClick={closeMenu}>
                      <i className="fa fa-sign-out" /> 登出
                    </NavLink>
                  </li>
                </ul>
              </>
            ) : (
              <>
                <h4 className="hamburger-section-title">會員專區</h4>
                <ul className="hamburger-nav-list">
                  <li>
                    <NavLink to={SIGNIN} onClick={closeMenu}>
                      <i className="fa fa-sign-in" /> 登入
                    </NavLink>
                  </li>
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

Navigation.propTypes = {
  isAuthenticating: PropType.bool.isRequired,
  basketLength: PropType.number.isRequired,
  disabledPaths: PropType.arrayOf(PropType.string).isRequired,
  user: PropType.oneOfType([
    PropType.bool,
    PropType.object
  ]).isRequired
};

export default Navigation;
