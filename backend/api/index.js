// backend/api/index.js - Versión simplificada para Vercel
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware básico
app.use(cors({
  origin: ['https://fullwash360.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Conexión a MongoDB
const mongoURI = process.env.MONGODB_URI;
console.log('🔗 Conectando a MongoDB...');

// Conectar a MongoDB (versión simplificada)
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Conectado a MongoDB Atlas');
})
.catch(err => {
  console.error('❌ Error MongoDB:', err.message);
});

// Rutas básicas
app.get('/', (req, res) => {
  res.json({
    message: '🚗 FullWash 360 API - Vercel Edition',
    status: 'online',
    database: mongoose.connection.readyState === 1 ? 'conectado 🟢' : 'desconectado 🔴',
    endpoints: ['/api/test', '/api/health', '/api/debug']
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    message: '✅ Backend FullWash 360 funcionando en Vercel',
    timestamp: new Date().toISOString(),
    mongo: mongoose.connection.readyState === 1 ? 'conectado' : 'desconectado'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy',
    uptime: process.uptime()
  });
});

// Export para Vercel Serverless
module.exports = (req, res) => {
  return app(req, res);
};