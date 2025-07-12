export interface UserData {
  access_token: string;
  refresh_token: string;
  user_id: string;
}

export const saveUserData = (userData: UserData): void => {
  try {
    // Save tokens to localStorage
    localStorage.setItem('hyperknow_access_token', userData.access_token);
    localStorage.setItem('hyperknow_refresh_token', userData.refresh_token);
    localStorage.setItem('hyperknow_user_id', userData.user_id);
    
    console.log('User data saved successfully');
  } catch (error) {
    console.error('Failed to save user data:', error);
  }
};

export const getUserData = (): UserData | null => {
  try {
    const access_token = localStorage.getItem('hyperknow_access_token');
    const refresh_token = localStorage.getItem('hyperknow_refresh_token');
    const user_id = localStorage.getItem('hyperknow_user_id');
    
    if (access_token && refresh_token && user_id) {
      return {
        access_token,
        refresh_token,
        user_id
      };
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get user data:', error);
    return null;
  }
};

export const clearUserData = (): void => {
  try {
    localStorage.removeItem('hyperknow_access_token');
    localStorage.removeItem('hyperknow_refresh_token');
    localStorage.removeItem('hyperknow_user_id');
    localStorage.removeItem('current_workspace_id');
    
    console.log('User data cleared successfully');
  } catch (error) {
    console.error('Failed to clear user data:', error);
  }
};

export const isAuthenticated = (): boolean => {
  const userData = getUserData();
  return userData !== null;
};

export const getAccessToken = (): string | null => {
  try {
    return localStorage.getItem('hyperknow_access_token');
  } catch (error) {
    console.error('Failed to get access token:', error);
    return null;
  }
};