import { useState, useEffect, useCallback } from 'react';
import firebase from '@react-native-firebase/app';
import AuthService from '../services/auth/AuthService';

const authService = new AuthService(firebase);

export function useAuth() {
  const [state, setState] = useState({
    currentUser: null,
    loading: true,
    error: null
  });

  const signIn = useCallback(async (email, password) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const user = await authService.signIn(email, password);
      setState(prev => ({
        ...prev,
        currentUser: user,
        loading: false,
        error: null
      }));
      return user;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
      throw error;
    }
  }, []);

  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      await authService.signOut();
      setState(prev => ({
        ...prev,
        currentUser: null,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
      throw error;
    }
  };

  return {
    ...state,
    signIn,
    signOut,
    clearError: () => setState(prev => ({ ...prev, error: null }))
  };
}
