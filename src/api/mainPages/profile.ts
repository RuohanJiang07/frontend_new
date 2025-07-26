export interface Profile {
  profile_id: string;
  description: string;
  profile_name: string;
  created_datetime: string;
  education_levels: string[];
  area_of_expertise: string;
  additional_comments: string;
  learning_preferences: string[];
}

export interface ProfileListResponse {
  success: boolean;
  profiles: Profile[];
  total_count: number;
}

export interface SaveProfileRequest {
  profile_info: {
    profile_name: string;
    description: string;
    education_levels: string[];
    area_of_expertise: string;
    learning_preferences: string[];
    additional_comments: string;
  };
}

export interface SaveProfileResponse {
  success: boolean;
  message: string;
  profile_id: string;
}

export const getAllProfiles = async (): Promise<ProfileListResponse> => {
  const token = localStorage.getItem('hyperknow_access_token');
  
  if (!token) {
    throw new Error('No access token found');
  }

  const response = await fetch('https://backend-aec-experimental.onrender.com/api/v1/profile/list_all_profiles', {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch profiles: ${response.status}`);
  }

  return response.json();
};

export const saveProfile = async (profileData: SaveProfileRequest): Promise<SaveProfileResponse> => {
  const token = localStorage.getItem('hyperknow_access_token');
  
  if (!token) {
    throw new Error('No access token found');
  }

  const response = await fetch('https://backend-aec-experimental.onrender.com/api/v1/profile/save_profile', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });

  if (!response.ok) {
    throw new Error(`Failed to save profile: ${response.status}`);
  }

  return response.json();
};
