import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/auth.context';
import Spinner from '../../components/spinner/spinner.component';

const PrivateRoute = () => {
  const { userId, isLoading } = useAuth();
  if (isLoading) {
    return <Spinner />;
  }

  return userId ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoute;
