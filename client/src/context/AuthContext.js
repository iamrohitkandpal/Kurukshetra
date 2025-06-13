import { createContext } from 'react';

const AuthContext = createContext({
  user: null,
  token: null,
  setUser: () => {},
  setToken: () => {}
});

export default AuthContext;
