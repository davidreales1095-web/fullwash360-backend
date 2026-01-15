// src/config.js - VERSIÓN CORREGIDA
const CONFIG = {
  // Punto de lavado por defecto
  PUNTO_ID: '000000000000000000000002',
  
  // Usuario por defecto (en desarrollo)
  USUARIO_ID: '000000000000000000000001',
  
  // URL del backend
  API_URL: 'http://localhost:5000/api',
  
  // Precios por defecto (por si el backend no responde)
  PRECIOS_DEFAULT: {
    carro: { express: 15000, premium: 20000 },
    moto: { express: 12000, elite: 15000, premium: 17000 },
    taxi: { express: 15000 },
    camioneta: { express: 15000, elite: 15000, premium: 15000 }
  }
};

export { CONFIG };