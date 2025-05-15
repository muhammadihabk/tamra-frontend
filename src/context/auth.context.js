import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext({
  isUserAuthorized: null,
  setIsUserAuthorized: () => {},
  clear: () => {},
});

function AuthProvider({ children }) {
  const [isUserAuthorized, setIsUserAuthorized] = useState(null);

  useEffect(() => {
    const updateAuthContext = async () => {
      try {
        const query = `
          query {
            me
          }
        `;
        const response = await axios.post(
          process.env.REACT_APP_BACKEND_BASE_URL,
          {
            query,
          },
          {
            withCredentials: true,
          }
        );

        if (!response.data.data?.me) {
          return;
        }

        setIsUserAuthorized(true);
      } catch (error) {
        return;
      }
    };

    updateAuthContext();
  }, []);

  const value = {
    isUserAuthorized,
    setIsUserAuthorized: (v) => setIsUserAuthorized(v),
    clear: () => setIsUserAuthorized(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  return useContext(AuthContext);
}

export { AuthProvider, useAuth };
