import { createContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (name, bio) => {
    try {
      const { data } = await api.put('/auth/profile', { name, bio });
      // update local storage and state
      const updatedUser = { ...user, name: data.name, bio: data.bio };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, loading, error, setError }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
