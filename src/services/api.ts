import config from '../config';
import { User } from '../types';

// Default API response structure
interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Auth response types
interface LoginResponse {
  user: User;
  token: string;
  message?: string;
}

interface SignupResponse {
  user: User;
  token: string;
  message?: string;
}

/**
 * Generic fetch function for API calls
 */
async function fetchApi<T>(
  endpoint: string, 
  method: string = 'GET', 
  body?: any, 
  headers: HeadersInit = {}
): Promise<ApiResponse<T>> {
  const url = `${config.API_URL}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      ...config.API_HEADERS,
      ...headers,
    },
    credentials: 'include',
  };

  // Add body for non-GET requests
  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  // Add auth token if available
  const token = localStorage.getItem('recipehub_token');
  if (token) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      return { 
        error: data.error || `Error: ${response.status}` 
      };
    }

    return { data };
  } catch (error) {
    console.error('API request failed:', error);
    return { 
      error: 'Network error or server unreachable' 
    };
  }
}

// API endpoints
const api = {
  // Auth endpoints
  auth: {
    login: (email: string, password: string) => 
      fetchApi<LoginResponse>('/api/auth/login', 'POST', { email, password }),
    
    signup: (name: string, email: string, password: string) => 
      fetchApi<SignupResponse>('/api/auth/signup', 'POST', { name, email, password }),
  },
  
  // Recipes endpoints
  recipes: {
    getAll: () => fetchApi('/api/recipes'),
    
    getById: (id: string) => fetchApi(`/api/recipes/${id}`),
    
    create: (recipeData: any) => fetchApi('/api/recipes', 'POST', recipeData),
    
    update: (id: string, recipeData: any) => 
      fetchApi(`/api/recipes/${id}`, 'PUT', recipeData),
    
    delete: (id: string) => fetchApi(`/api/recipes/${id}`, 'DELETE'),
    
    getPublic: () => fetchApi('/api/recipes/public'),
  },
  
  // Users endpoints
  users: {
    getProfile: () => fetchApi('/api/users/profile'),
    
    updateProfile: (userData: any) => 
      fetchApi('/api/users/profile', 'PUT', userData),
  }
};

export default api; 