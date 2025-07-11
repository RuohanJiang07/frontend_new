// Authentication utility functions for managing tokens and user data

export interface UserData {
  access_token: string;
  refresh_token: string;
  user_id: string;
}

const ACCESS_TOKEN_KEY = 'hyperknow_access_token';
const REFRESH_TOKEN_KEY = 'hyperknow_refresh_token';
const USER_ID_KEY = 'hyperknow_user_id';

export const saveUserData = (userData: UserData): void => {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, userData.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, userData.refresh_token);
    localStorage.setItem(USER_ID_KEY, userData.user_id);
  } catch (error) {
    console.error('Error saving user data to localStorage:', error);
  }
};

export const getUserData = (): UserData | null => {
  try {
    const access_token = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refresh_token = localStorage.getItem(REFRESH_TOKEN_KEY);
    const user_id = localStorage.getItem(USER_ID_KEY);

    if (access_token && refresh_token && user_id) {
      return {
        access_token,
        refresh_token,
        user_id,
      };
    }
    return null;
  } catch (error) {
    console.error('Error retrieving user data from localStorage:', error);
    return null;
  }
};

export const clearUserData = (): void => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
  } catch (error) {
    console.error('Error clearing user data from localStorage:', error);
  }
};

export const isAuthenticated = (): boolean => {
  const userData = getUserData();
  return userData !== null;
};

export const getAccessToken = (): string | null => {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};