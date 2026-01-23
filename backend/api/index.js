// backend/api/index.js - VERSIÓN COMPLETA Y FUNCIONAL
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware básico
app.use(cors({
  origin: ['https://fullwash360.vercel.app', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Conexión a MongoDB
const mongoURI = process.env.MONGODB_URI;
console.log('🚗 FullWash 360 API - Iniciando...');

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Atlas: CONECTADO'))
.catch(err => console.error('❌ MongoDB Error:', err.message));

// =======================
// MODELOS (INCLUIR DIRECTAMENTE)
// =======================
const orderSchema = new mongoose.Schema({
  numero_orden: String,
  placa: String,
  tipo_vehiculo: String,
  tipo_lavado: String,
  total: Number,
  metodo_pago: String,
  es_decima_gratis: Boolean,
  contador_lavada: Number,
  lavador_asignado: mongoose.Schema.Types.ObjectId,
  comision_lavador: {
    monto: Number,
    porcentaje: Number,
    lavador_id: mongoose.Schema.Types.ObjectId,
    lavador_nombre: String
  },
  cliente_nombre: String,
  fecha_creacion: { type: Date, default: Date.now },
  fecha_cobro: Date,
  estado: String
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

// =======================
// RUTAS DE ÓRDENES (DIRECTAS)
// =======================

// ✅ RUTA PRINCIPAL DE PRUEBA
app.get('/api/ordenes/test', (req, res) => {
  res.json({
    success: true,
    message: '✅ API de Órdenes funcionando',
    version: '2.0',
    timestamp: new Date().toISOString()
  });
});

// ✅ OBTENER ÓRDENES ACTIVAS
app.get('/api/ordenes/activas', async (req, res) => {
  try {
    const ordenes = await Order.find({ estado: 'activa' })
      .sort({ fecha_creacion: -1 })
      .limit(50);
    
    res.json({
      success: true,
      ordenes: ordenes.map(o => ({
        id: o._id,
        numero_orden: o.numero_orden,
        placa: o.placa,
        tipo_vehiculo: o.tipo_vehiculo,
        total: o.total,
        estado: o.estado,
        fecha_creacion: o.fecha_creacion
      })),
      total: ordenes.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ OBTENER HISTORIAL POR FECHA (LA QUE NECESITA TU FRONTEND)
app.get('/api/ordenes/historial/:fecha', async (req, res) => {
  try {
    const { fecha } = req.params;
    console.log('📅 Historial solicitado para:', fecha);
    
    let filtro = { estado: 'completada' };
    const ahora = new Date();
    
    // Construir filtro según fecha
    if (fecha === 'hoy') {
      const hoyInicio = new Date(ahora);
      hoyInicio.setHours(0, 0, 0, 0);
      const hoyFin = new Date(ahora);
      hoyFin.setHours(23, 59, 59, 999);
      filtro.fecha_cobro = { $gte: hoyInicio, $lte: hoyFin };
    } else if (fecha === 'ayer') {
      const ayer = new Date(ahora);
      ayer.setDate(ayer.getDate() - 1);
      const ayerInicio = new Date(ayer);
      ayerInicio.setHours(0, 0, 0, 0);
      const ayerFin = new Date(ayer);
      ayerFin.setHours(23, 59, 59, 999);
      filtro.fecha_cobro = { $gte: ayerInicio, $lte: ayerFin };
    } else if (fecha === 'mes') {
      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
      finMes.setHours(23, 59, 59, 999);
      filtro.fecha_cobro = { $gte: inicioMes, $lte: finMes };
    } else if (fecha !== 'todos') {
      // Fecha específica YYYY-MM-DD
      const inicioDia = new Date(fecha + 'T00:00:00.000Z');
      const finDia = new Date(fecha + 'T23:59:59.999Z');
      filtro.fecha_cobro = { $gte: inicioDia, $lte: finDia };
    }
    
    // Obtener órdenes
    const ordenes = await Order.find(filtro)
      .sort({ fecha_cobro: -1 })
      .limit(200);
    
    // Calcular estadísticas para el banner
    const total = ordenes.length;
    const totalIngresos = ordenes.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalComisiones = ordenes.reduce((sum, o) => sum + (o.comision_lavador?.monto || 0), 0);
    const gananciaNeta = totalIngresos - totalComisiones;
    
    // Formatear respuesta para tu frontend
    res.json({
      success: true,
      ordenes: ordenes.map(o => ({
        _id: o._id,
        numero_orden: o.numero_orden,
        placa: o.placa,
        tipo_vehiculo: o.tipo_vehiculo,
        tipo_lavado: o.tipo_lavado || 'express',
        total: o.total || 0,
        precio: o.total || 0,
        metodo_pago: o.metodo_pago || 'efectivo',
        es_decima_gratis: o.es_decima_gratis || false,
        contador_lavada: o.contador_lavada || 1,
        fecha_creacion: o.fecha_creacion,
        fecha_cobro: o.fecha_cobro,
        cliente_nombre: o.cliente_nombre || `Cliente ${o.placa}`,
        lavador_asignado: o.lavador_asignado,
        lavador_nombre: o.comision_lavador?.lavador_nombre || 'No asignado',
        lavador_id: o.comision_lavador?.lavador_id || o.lavador_asignado,
        comision_lavador: o.comision_lavador?.monto || 0,
        comision_porcentaje: o.comision_lavador?.porcentaje || 40
      })),
      estadisticas: {
        total,
        totalIngresos,
        totalComisiones,
        gananciaNeta,
        promedioOrden: total > 0 ? totalIngresos / total : 0,
        porcentajeComisiones: totalIngresos > 0 ? (totalComisiones / totalIngresos) * 100 : 0
      }
    });
    
  } catch (error) {
    console.error('❌ Error en historial:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener historial',
      error: error.message 
    });
  }
});

// ✅ OBTENER HISTORIAL CON FILTROS PERSONALIZADOS (POST)
app.post('/api/ordenes/historial-filtrado', async (req, res) => {
  try {
    const { fechaInicio, fechaFin, ...otrosFiltros } = req.body;
    console.log('🎯 Filtros personalizados:', req.body);
    
    let filtro = { estado: 'completada' };
    
    // Filtrar por rango de fechas
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio + 'T00:00:00.000Z');
      const fin = new Date(fechaFin + 'T23:59:59.999Z');
      filtro.fecha_cobro = { $gte: inicio, $lte: fin };
    }
    
    // Aplicar otros filtros
    if (otrosFiltros.tipoVehiculo && otrosFiltros.tipoVehiculo.length > 0) {
      filtro.tipo_vehiculo = { $in: otrosFiltros.tipoVehiculo };
    }
    
    if (otrosFiltros.tipoLavado && otrosFiltros.tipoLavado.length > 0) {
      filtro.tipo_lavado = { $in: otrosFiltros.tipoLavado };
    }
    
    if (otrosFiltros.lavadorId) {
      filtro.lavador_asignado = otrosFiltros.lavadorId;
    }
    
    // Obtener órdenes
    const ordenes = await Order.find(filtro)
      .sort({ fecha_cobro: -1 })
      .limit(500);
    
    // Calcular estadísticas
    const total = ordenes.length;
    const totalIngresos = ordenes.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalComisiones = ordenes.reduce((sum, o) => sum + (o.comision_lavador?.monto || 0), 0);
    const gananciaNeta = totalIngresos - totalComisiones;
    
    res.json({
      success: true,
      ordenes: ordenes.map(o => ({
        _id: o._id,
        numero_orden: o.numero_orden,
        placa: o.placa,
        tipo_vehiculo: o.tipo_vehiculo,
        tipo_lavado: o.tipo_lavado || 'express',
        total: o.total || 0,
        precio: o.total || 0,
        metodo_pago: o.metodo_pago || 'efectivo',
        es_decima_gratis: o.es_decima_gratis || false,
        contador_lavada: o.contador_lavada || 1,
        fecha_creacion: o.fecha_creacion,
        fecha_cobro: o.fecha_cobro,
        cliente_nombre: o.cliente_nombre || `Cliente ${o.placa}`,
        lavador_asignado: o.lavador_asignado,
        lavador_nombre: o.comision_lavador?.lavador_nombre || 'No asignado',
        lavador_id: o.comision_lavador?.lavador_id || o.lavador_asignado,
        comision_lavador: o.comision_lavador?.monto || 0,
        comision_porcentaje: o.comision_lavador?.porcentaje || 40
      })),
      estadisticas: {
        total,
        totalIngresos,
        totalComisiones,
        gananciaNeta,
        promedioOrden: total > 0 ? totalIngresos / total : 0,
        porcentajeComisiones: totalIngresos > 0 ? (totalComisiones / totalIngresos) * 100 : 0
      }
    });
    
  } catch (error) {
    console.error('❌ Error en historial filtrado:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener historial filtrado' 
    });
  }
});

// ✅ OBTENER TODAS LAS ÓRDENES (DEBUG)
app.get('/api/ordenes/todas', async (req, res) => {
  try {
    const ordenes = await Order.find({})
      .sort({ fecha_cobro: -1 })
      .limit(100);
    
    res.json({
      success: true,
      ordenes: ordenes.map(o => ({
        id: o._id,
        numero_orden: o.numero_orden,
        placa: o.placa,
        total: o.total,
        estado: o.estado,
        fecha_cobro: o.fecha_cobro,
        tipo_vehiculo: o.tipo_vehiculo
      })),
      total: ordenes.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =======================
// RUTAS DE SALUD
// =======================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy',
    uptime: process.uptime(),
    endpoints: [
      '/api/ordenes/activas',
      '/api/ordenes/historial/:fecha',
      '/api/ordenes/todas',
      '/api/health',
      '/api/test'
    ]
  });
});

app.get('/', (req, res) => {
  res.json({
    message: '🚗 FullWash 360 API - Historial Funcional',
    status: 'online',
    database: mongoose.connection.readyState === 1 ? 'conectado 🟢' : 'desconectado 🔴',
    endpoints: [
      'GET  /api/ordenes/activas',
      'GET  /api/ordenes/historial/:fecha',
      'POST /api/ordenes/historial-filtrado',
      'GET  /api/ordenes/todas',
      'GET  /api/health',
      'GET  /api/test'
    ]
  });
});

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    availableRoutes: [
      'GET  /api/ordenes/activas',
      'GET  /api/ordenes/historial/:fecha',
      'POST /api/ordenes/historial-filtrado',
      'GET  /api/health',
      'GET  /api/test'
    ]
  });
});

// Export para Vercel
module.exports = app;