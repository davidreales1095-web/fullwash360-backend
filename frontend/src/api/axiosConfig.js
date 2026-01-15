// src/api/axiosConfig.js - VERSIÓN CORREGIDA
import axios from 'axios';

// ✅ USAR VARIABLE DE ENTORNO VITE
// En desarrollo: localhost:5000
// En producción: https://fullwash360-backend.onrender.com
const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,  // ← ¡Ya no está hardcodeado!
  timeout: 10000,    // Aumenté el timeout a 10 segundos para producción
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ INTERCEPTOR PARA AGREGAR TOKEN (si existe)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ INTERCEPTOR PARA MANEJAR ERRORES 401 (no autorizado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirigir al login (usando HashRouter)
      window.location.href = '/#/login';
    }
    return Promise.reject(error);
  }
);

export default api;