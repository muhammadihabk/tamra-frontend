import GlobalNavigation from './routes/global-navigation/global-navigation.component';
import LandingPage from './routes/landing-page/landing-page.component';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<GlobalNavigation />}>
        <Route index element={<LandingPage />} />
      </Route>
    </Routes>
  );
}

export default App;
