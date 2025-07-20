export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    access_token: string;
    refresh_token: string;
    user_id: string;
  };
  error?: {
    code: number;
    message: string;
  };
}

const API_BASE_URL = 'https://backend-aec-experimental.onrender.com';

export const loginUser = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: LoginResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Login API error:', error);
    return {
      success: false,
      error: {
        code: 500,
        message: 'Network error. Please check your connection and try again.',
      },
    };
  }
};