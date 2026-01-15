// Configuración centralizada de API para FullWash 360 - VITE VERSION
export const getApiBaseUrl = () => {
  // Vite usa import.meta.env, no process.env
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};

const API_BASE = getApiBaseUrl();

// URLs centralizadas para toda la aplicación
export const API_URLS = {
  BASE: API_BASE,
  API: `${API_BASE}/api`,
  AUTH: `${API_BASE}/api/auth`,
  ORDERS: `${API_BASE}/api/orders`,
  CLIENTES: `${API_BASE}/api/clientes`,
  LAVADORES: `${API_BASE}/api/lavadores`,
  VEHICULOS: `${API_BASE}/api/vehiculos`,
  REPORTES: `${API_BASE}/api/reportes`,
  USUARIOS: `${API_BASE}/api/usuarios`,
  HEALTH: `${API_BASE}/api/health`
};

// Instancia de axios preconfigurada
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: API_URLS.API,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/#/login';
    }
    return Promise.reject(error);
  }
);