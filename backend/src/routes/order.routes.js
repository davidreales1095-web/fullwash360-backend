const express = require('express');
const router = express.Router();
const Orden = require('../models/Orden');
const {
  createOrder, 
  cobrarOrden, 
  getOrdenesActivas,
  getTodasOrdenes,
  getHistorialOrdenes,
  getEstadisticasComisiones,
  obtenerEstadisticas,           // ✅ NUEVO - Para dashboard
  obtenerEstadisticasDetalladas  // ✅ NUEVO - Para gráficos
} = require('../controllers/orderController'); // ✅ CORREGIDO: ordenesController → orderController

// =======================
// RUTAS SIMPLIFICADAS (SIN AUTH)
// =======================

// Crear nueva orden
router.post('/', createOrder);

// Cobrar orden
router.put('/:id/cobrar', cobrarOrden);

// Obtener órdenes activas
router.get('/activas', getOrdenesActivas);

// Ruta para debug: obtener todas las órdenes
router.get('/debug/todas', getTodasOrdenes);

// =======================
// ✅ NUEVAS RUTAS PARA DASHBOARD
// =======================

// 📊 OBTENER ESTADÍSTICAS PARA DASHBOARD
router.get('/estadisticas', obtenerEstadisticas);

// 📈 OBTENER ESTADÍSTICAS DETALLADAS (PARA GRÁFICOS)
router.get('/estadisticas/detalladas', obtenerEstadisticasDetalladas);

// 💰 OBTENER ESTADÍSTICAS DE COMISIONES POR LAVADOR
router.get('/comisiones/:lavador_id', getEstadisticasComisiones);

// 📄 OBTENER HISTORIAL DE ÓRDENES (CON PAGINACIÓN)
router.get('/historial', getHistorialOrdenes);

// =======================
// RUTAS PARA HISTORIAL (EXISTENTES)
// =======================

// Obtener órdenes por fecha específica (YYYY-MM-DD)
router.get('/fecha/:fecha', async (req, res) => {
  try {
    const { fecha } = req.params;
    const fechaInicio = new Date(fecha);
    fechaInicio.setHours(0, 0, 0, 0);
    const fechaFin = new Date(fecha);
    fechaFin.setHours(23, 59, 59, 999);

    const ordenes = await Orden.find({
      fecha_cobro: { $gte: fechaInicio, $lte: fechaFin },
      estado: 'completada'
    })
    .populate('lavador_asignado', 'nombre codigo')
    .populate('usuario_id', 'nombre')
    .sort({ fecha_cobro: -1 });

    res.json({ success: true, ordenes });
  } catch (error) {
    console.error('Error obteniendo órdenes por fecha:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Obtener órdenes por rango de fechas (YYYY-MM-DD/YYYY-MM-DD)
router.get('/rango/:inicio/:fin', async (req, res) => {
  try {
    const { inicio, fin } = req.params;
    const fechaInicio = new Date(inicio);
    fechaInicio.setHours(0, 0, 0, 0);
    const fechaFin = new Date(fin);
    fechaFin.setHours(23, 59, 59, 999);

    const ordenes = await Orden.find({
      fecha_cobro: { $gte: fechaInicio, $lte: fechaFin },
      estado: 'completada'
    })
    .populate('lavador_asignado', 'nombre codigo')
    .populate('usuario_id', 'nombre')
    .sort({ fecha_cobro: -1 });

    res.json({ success: true, ordenes });
  } catch (error) {
    console.error('Error obteniendo órdenes por rango:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Obtener todas las órdenes (sin debug)
router.get('/todas', async (req, res) => {
  try {
    const ordenes = await Orden.find({ estado: 'completada' })
      .populate('lavador_asignado', 'nombre codigo')
      .populate('usuario_id', 'nombre')
      .sort({ fecha_cobro: -1 })
      .limit(1000); // Limitar a 1000 órdenes

    res.json({ success: true, ordenes });
  } catch (error) {
    console.error('Error obteniendo todas las órdenes:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Obtener órdenes con filtros avanzados
router.get('/filtradas', async (req, res) => {
  try {
    const {
      fechaInicio,
      fechaFin,
      tipoVehiculo,
      tipoLavado,
      metodoPago,
      lavadorId,
      minMonto,
      maxMonto
    } = req.query;

    let filtro = { estado: 'completada' };

    // Filtro por rango de fechas
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      inicio.setHours(0, 0, 0, 0);
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);
      filtro.fecha_cobro = { $gte: inicio, $lte: fin };
    }

    // Filtro por tipo de vehículo
    if (tipoVehiculo) {
      filtro.tipo_vehiculo = tipoVehiculo;
    }

    // Filtro por tipo de lavado
    if (tipoLavado) {
      filtro['servicios.tipo_lavado'] = tipoLavado;
    }

    // Filtro por método de pago
    if (metodoPago) {
      filtro.metodo_pago = metodoPago;
    }

    // Filtro por lavador
    if (lavadorId) {
      filtro.lavador_asignado = lavadorId;
    }

    // Filtro por rango de montos
    if (minMonto || maxMonto) {
      filtro.total = {};
      if (minMonto) filtro.total.$gte = Number(minMonto);
      if (maxMonto) filtro.total.$lte = Number(maxMonto);
    }

    const ordenes = await Orden.find(filtro)
      .populate('lavador_asignado', 'nombre codigo')
      .populate('usuario_id', 'nombre')
      .sort({ fecha_cobro: -1 })
      .limit(500);

    res.json({ success: true, ordenes });
  } catch (error) {
    console.error('Error obteniendo órdenes filtradas:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =======================
// RUTAS DE PRUEBA
// =======================

// Ruta de prueba para verificar que el servidor funciona
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API de órdenes funcionando',
    timestamp: new Date().toISOString()
  });
});

// Ruta para crear una orden de prueba
router.post('/test/crear', async (req, res) => {
  try {
    const orden = new Orden({
      punto_id: '000000000000000000000002',
      usuario_id: '000000000000000000000001',
      creado_por: '000000000000000000000001',
      placa: 'TEST123',
      tipo_vehiculo: 'carro',
      servicios: [{
        nombre: 'Lavado express',
        tipo: 'lavado',
        tipo_lavado: 'express',
        precio: 15000,
        duracion_minutos: 30
      }],
      subtotal: 15000,
      total: 15000,
      estado: 'activa'
    });

    await orden.save();

    res.json({ 
      success: true, 
      message: 'Orden de prueba creada',
      orden: orden.toObject() 
    });
    
  } catch (error) {
    console.error('Error creando orden de prueba:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;