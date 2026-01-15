const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');
// const { auth } = require('../middleware/auth'); // si no usas auth, comentar o eliminar

// Órdenes activas
router.get('/ordenes-activas', reportesController.getOrdenesActivas);

// Historial por placa
router.get('/historial/:placa', reportesController.getHistoryByPlate);

// Historial por lavador
router.get('/historial-lavador/:lavador_id', reportesController.getHistoryByLavador);

// Estadísticas generales
router.get('/stats', reportesController.getStats);

// Comisiones diarias
router.get('/comisiones/diarias', reportesController.getComisionesDiarias);

// Orden por ID
router.get('/orden/:id', reportesController.getOrderById);

module.exports = router;

