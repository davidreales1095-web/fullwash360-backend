// backend/src/routes/stats.routes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Orden');

// 📊 ENDPOINT SIMPLE PARA EL HEADER
router.get('/header', async (req, res) => {
  try {
    console.log('📊 [Stats] Solicitando datos para header...');
    
    // Fecha de hoy
    const hoy = new Date();
    const inicioDia = new Date(hoy);
    inicioDia.setHours(0, 0, 0, 0);
    const finDia = new Date(hoy);
    finDia.setHours(23, 59, 59, 999);

    // 1. Contar órdenes de HOY
    const ordenesHoy = await Order.countDocuments({
      fecha_creacion: { $gte: inicioDia, $lte: finDia },
      estado: 'completada'
    });

    // 2. Sumar ingresos de HOY
    const ingresosResult = await Order.aggregate([
      {
        $match: {
          fecha_creacion: { $gte: inicioDia, $lte: finDia },
          estado: 'completada'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);

    const ingresosHoy = ingresosResult[0]?.total || 0;

    console.log('✅ [Stats] Datos calculados:', { ordenesHoy, ingresosHoy });

    // Respuesta SIMPLE para el header
    res.json({
      success: true,
      ordenesHoy: ordenesHoy,
      ingresosHoy: ingresosHoy,
      fecha: hoy.toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [Stats] Error:', error);
    
    // En caso de error, devolver 0
    res.json({
      success: true,
      ordenesHoy: 0,
      ingresosHoy: 0,
      error: 'Error calculando estadísticas',
      timestamp: new Date().toISOString()
    });
  }
});

// 📊 ENDPOINT PARA PRUEBA RÁPIDA
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'API de estadísticas funcionando',
    endpoints: {
      header: '/api/stats/header',
      test: '/api/stats/test'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;