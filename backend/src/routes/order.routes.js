const express = require('express');
const router = express.Router();
const {
  createOrder,
  cobrarOrden,
  getOrdenesActivas,
  getHistorialOrdenes,           // ✅ Única ruta para historial (con todos los filtros)
  getEstadisticasComisiones,
  obtenerEstadisticas,
  obtenerEstadisticasDetalladas
} = require('../controllers/orderController');

// =======================
// RUTAS PRINCIPALES
// =======================

// Crear nueva orden
router.post('/', createOrder);

// Cobrar orden
router.put('/:id/cobrar', cobrarOrden);

// Obtener órdenes activas
router.get('/activas', getOrdenesActivas);

// ✅ HISTORIAL: Única ruta con filtros, paginación y ordenamiento
router.get('/historial', getHistorialOrdenes);

// =======================
// ESTADÍSTICAS Y COMISIONES
// =======================
router.get('/estadisticas', obtenerEstadisticas);
router.get('/estadisticas/detalladas', obtenerEstadisticasDetalladas);
router.get('/comisiones/:lavador_id', getEstadisticasComisiones);

// =======================
// RUTAS DE PRUEBA (SOLO DESARROLLO, OPCIONAL)
// =======================
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API de órdenes funcionando',
    timestamp: new Date().toISOString()
  });
});

// ✅ Solo para debug rápido (opcional, puedes eliminarlo)
router.get('/debug/todas', async (req, res) => {
  try {
    const Order = require('../models/Orden');
    const ordenes = await Order.find().sort({ fecha_creacion: -1 }).limit(50).lean();
    res.json({ success: true, ordenes, total: ordenes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;