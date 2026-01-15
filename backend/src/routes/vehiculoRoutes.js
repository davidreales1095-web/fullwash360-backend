// backend/src/routes/vehiculoRoutes.js
const express = require('express');
const router = express.Router();
const vehiculoController = require('../controllers/vehiculoController');
const { auth } = require('../middleware/auth');

router.use(auth);

// Buscar vehículo por placa
router.get('/placa/:placa', vehiculoController.buscarVehiculoPorPlaca);

// Obtener últimas órdenes de un vehículo
router.get('/:placa/ordenes-recientes', vehiculoController.getRecentOrders);

module.exports = router;
