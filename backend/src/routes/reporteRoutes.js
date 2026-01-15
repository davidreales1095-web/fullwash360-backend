const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getReporteDiario, getReporteComisiones } = require('../controllers/reporteController');
const { getOrdenesActivas } = require('../controllers/orderController');

router.use(auth);

router.get('/diario', getReporteDiario);
router.get('/comisiones', getReporteComisiones);
router.get('/ordenes-activas', getOrdenesActivas);

module.exports = router;
