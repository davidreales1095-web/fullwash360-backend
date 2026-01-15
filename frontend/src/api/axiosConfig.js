// src/api/axiosConfig.js - VERSIÓN CORREGIDA
import axios from 'axios';

// ✅ URL FIJA - CAMBIA ESTO INMEDIATAMENTE
const API_URL = 'https://fullwash360-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,  // ← ESTO ARREGLARÁ TODO
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ... el resto del código se mantiene igual
export default api;