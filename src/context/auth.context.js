import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext({
  userId: null,
  setUserId: () => {},
  clear: () => {},
});

function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const updateAuthContext = async () => {
      try {
        const query = `query { me }`;
        const response = await axios.post(
          process.env.REACT_APP_BACKEND_BASE_URL,
          {
            query,
          },
          {
            withCredentials: true,
          }
        );
        const id = response.data.data?.me;

        setUserId(id || null);
      } catch (error) {
        setUserId(null);
      } finally {
        setIsLoading(false);
      }
    };

    updateAuthContext();
  }, []);

  const login = (id) => {
    setUserId(id);
  };

  const logout = async () => {
    setUserId(null);
  };

  const value = {
    userId,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthProvider, useAuth };
