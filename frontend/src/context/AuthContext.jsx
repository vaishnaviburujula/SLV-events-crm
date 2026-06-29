import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.data);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error verifying token on mount:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check your credentials.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (formData) => {
    try {
      const res = await api.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.data.success) {
        const updatedUser = res.data.data;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true, user: updatedUser };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to update profile.',
      };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await api.put('/auth/change-password', { currentPassword, newPassword });
      if (res.data.success) {
        return { success: true, message: res.data.message };
      }
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to change password.',
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateProfile,
    changePassword,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
