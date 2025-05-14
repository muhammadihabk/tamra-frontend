import { Routes, Route } from 'react-router-dom';
import GlobalNavigation from './routes/global-navigation/global-navigation.component';
import LandingPage from './routes/landing-page/landing-page.component';
import { AuthProvider } from './context/auth.context';
import SignUp from './routes/sign-up/sign-up.component';
import Login from './routes/login/login.component';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<GlobalNavigation />}>
          <Route index element={<LandingPage />} />
          <Route path="auth/signup" element={<SignUp />} />
          <Route path="auth/login" element={<Login />} />

          <Route path="me" element={<h1>Profile</h1>} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
