// backend/index.js - VERSIÓN SIMPLE PARA VERCEL
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Configuración básica
app.use(cors({
  origin: ['https://fullwash360.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Conexión a MongoDB
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('❌ ERROR: MONGODB_URI no definida');
} else {
  console.log('🔗 Conectando a MongoDB...');
  mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Error MongoDB:', err.message));
}

// Rutas básicas
app.get('/', (req, res) => {
  res.json({
    message: '🚗 FullWash 360 API',
    status: 'online',
    database: mongoose.connection.readyState === 1 ? 'conectado 🟢' : 'desconectado 🔴',
    endpoints: {
      test: '/api/test',
      health: '/api/health',
      orders: '/api/orders'
    }
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    message: '✅ Backend funcionando',
    timestamp: new Date().toISOString(),
    mongo: mongoose.connection.readyState === 1 ? 'conectado' : 'desconectado'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy'
  });
});

// Exportar para Vercel
module.exports = app;