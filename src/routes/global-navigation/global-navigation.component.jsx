import { Link } from 'react-router-dom';
import './global-navigation.styles.scss';

function GlobalNavigation() {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">
            <img src="images/logo.png" alt="Tamra Logo" />
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
  );
}

export default GlobalNavigation;
