import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/auth.context';

const PrivateRoute = () => {
  const { isUserAuthorized } = useAuth();

  return isUserAuthorized ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoute;
