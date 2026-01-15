const express = require('express');
const router = express.Router();
const User = require('../models/Usuario');
const { auth, authorize } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// DESARROLLO: aplica middleware auth simulado
router.use(auth);

// Listar todos los usuarios
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('punto_id', 'nombre');
    res.json({ success: true, total: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Listar lavadores
router.get('/lavadores', async (req, res) => {
  try {
    const lavadores = await User.find({ rol: 'lavador' }).select('codigo nombre rol');
    res.json({ success: true, lavadores });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Crear usuario
router.post('/', async (req, res) => {
  try {
    const { codigo, nombre, password, rol } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ codigo, nombre, password: hashedPassword, rol, activo: true });
    await user.save();
    const resp = user.toObject();
    delete resp.password;
    res.status(201).json({ success: true, usuario: resp });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
