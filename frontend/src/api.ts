import axios from 'axios';

const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
});

export interface Recipient {
  id: string;
  name: string;
  address?: string | null;
  status: string;
  note?: string | null;
}

export interface Animal {
  id: string;
  donor: string;
  type: string;
  weight: number;
  status: string;
  address?: string | null;
  note?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Interceptor untuk menambahkan token ke setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor untuk handle token expired / unauthorized — auto-redirect ke login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const loginUser = async (credentials: LoginCredentials) => {
  const response = await api.post('/login', credentials);
  return response.data;
};

export const getRecipients = async (): Promise<Recipient[]> => {
  const response = await api.get('/recipients');
  return response.data;
};

export const saveRecipient = async (recipient: Recipient) => {
  const response = await api.post('/recipients', recipient);
  return response.data;
};

export const getAnimals = async (): Promise<Animal[]> => {
  const response = await api.get('/animals');
  return response.data;
};

export const saveAnimal = async (animal: Animal) => {
  const response = await api.post('/animals', animal);
  return response.data;
};

export default api;
