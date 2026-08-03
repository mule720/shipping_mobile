import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { graphqlClient } from '../api/client';
import type { User, Company, AuthState } from '../types';

interface StoreState extends AuthState {
  primaryColor: string;
  login: (token: string, refreshToken: string, user: User, company: Company) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
  setPrimaryColor: (color: string) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  user: null,
  company: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  primaryColor: '#4f46e5',

  login: async (token, refreshToken, user, company) => {
    graphqlClient.setToken(token);
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('refresh_token', refreshToken);
    await AsyncStorage.setItem('auth_state', JSON.stringify({ user, company }));
    set({
      token,
      refreshToken,
      user,
      company,
      isAuthenticated: true,
      primaryColor: company.primaryColor || '#4f46e5',
    });
  },

  logout: async () => {
    graphqlClient.setToken(null);
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('refresh_token');
    await AsyncStorage.removeItem('auth_state');
    set({
      token: null,
      refreshToken: null,
      user: null,
      company: null,
      isAuthenticated: false,
      primaryColor: '#4f46e5',
    });
  },

  loadSession: async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const authStateStr = await AsyncStorage.getItem('auth_state');
      if (token && authStateStr) {
        const { user, company } = JSON.parse(authStateStr);
        graphqlClient.setToken(token);
        set({
          token,
          user,
          company,
          isAuthenticated: true,
          primaryColor: company?.primaryColor || '#4f46e5',
        });
      }
    } catch {
      // session restore failed — stay logged out
    }
  },

  setPrimaryColor: (color) => set({ primaryColor: color }),
}));
