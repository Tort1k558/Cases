import React, { createContext, useState, useEffect } from 'react';
import api, { baseURL } from './Api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/profile/');
        setUser(response.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [loading]);

  const login = async (credentials) => {
    window.location.href = baseURL + '/api/profile/steam/login/';
  };

  const logout = async () => {
    try {
      await api.post('/profile/steam/logout/');
      setLoading(true);
    } catch (error) {
      console.error('Logout failed:', error);
      setLoading(true);
    }
  };

  const openCase = async (caseId) => {
    try {
      const response = await api.post(`/case/${caseId}/`);
      setLoading(true);
      return response.data;
    } catch (error) {
      throw new Error(error.response.data.error)
    }
  };
  
  const setTradeLink = async (tradeLink) => {
    try {
      const response = await api.post(`set-trade-link/`, {'trade_link':tradeLink});
      setLoading(true);
      return response.data;
    } catch (error) {
      console.error('Error set trade link:', error);
    }
  };

  const withdrawItem = async (history_id) => {
    try {
      const response = await api.post(`withdraw-item/`, {'history_id':history_id});
      setLoading(true);
      return response.data;
    } catch (error) {
      console.error('Error withdraw item:', error);
    }
  };
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, openCase, setTradeLink, withdrawItem}}>
      {children}
    </AuthContext.Provider>
  );
};

