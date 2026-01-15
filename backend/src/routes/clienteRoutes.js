// routes/clienteRoutes.js - VERSIÓN CORREGIDA
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// ✅ RUTA PARA CREAR CLIENTE (SIN AUTH)
router.post('/', clienteController.crearCliente);

// ✅ RUTA CORREGIDA: Cambiar '/placa/:placa' por '/buscar/:placa'
router.get('/buscar/:placa', clienteController.buscarClientePorPlaca);

// ✅ RUTA PARA OBTENER TODOS LOS CLIENTES
router.get('/', clienteController.obtenerClientes);

// ✅ RUTA PARA BUSCAR CLIENTES (BÚSQUEDA POR TEXTO)
router.get('/buscar', clienteController.buscarClientes);

module.exports = router;