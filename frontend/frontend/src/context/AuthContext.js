import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const API_URL = process.env.REACT_APP_API_URL || 'https://fuelsync-backend.onrender.com/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        setUser(JSON.parse(savedUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      const { token, ...userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(userData);
      toast.success('Login successful!');
      return { success: true, data: userData };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);

      const { token, ...userInfo } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userInfo));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(userInfo);
      toast.success('Registration successful!');
      return { success: true, data: userInfo };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};