import { createContext, useContext, useState } from 'react';

const AuthContext = createContext({
  token: null,
  setToken: () => {},
  clearToken: () => {},
});

function AuthProvider({ children }) {
  const [token, setToken] = useState(null);

  const value = {
    token,
    setToken: (newToken) => setToken(newToken),
    clearToken: () => setToken(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  return useContext(AuthContext);
}

export { AuthProvider, useAuth };
