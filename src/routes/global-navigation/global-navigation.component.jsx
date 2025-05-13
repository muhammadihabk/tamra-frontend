import { Link, Outlet } from 'react-router-dom';
import './global-navigation.styles.scss';
import { Fragment } from 'react';

function GlobalNavigation() {
  return (
    <Fragment>
      <nav>
        <ul>
          <li>
            <Link to="/">
              <img src={'/images/logo.png'} alt="Tamra Logo" />
            </Link>
          </li>
          <div>
            <li>
              <Link to="/auth/login">Login</Link>
            </li>
            <li>
              <Link to="/auth/signup">Join</Link>
            </li>
          </div>
        </ul>
      </nav>
      <Outlet />
    </Fragment>
  );
}

export default GlobalNavigation;
