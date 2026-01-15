const express = require('express');
const router = express.Router();
const User = require('../models/Usuario');
const bcrypt = require('bcryptjs');

// LOGIN sin token
router.post('/login', async (req, res) => {
  try {
    const { codigo, password } = req.body;

    if (!codigo || !password) {
      return res.status(400).json({
        success: false,
        error: 'Debe enviar código y contraseña'
      });
    }

    const usuario = await User.findOne({ codigo: codigo.toUpperCase(), activo: true });

    if (!usuario) {
      return res.status(400).json({
        success: false,
        error: 'Usuario no encontrado o inactivo'
      });
    }

    const validPassword = await bcrypt.compare(password, usuario.password);

    if (!validPassword) {
      return res.status(400).json({
        success: false,
        error: 'Contraseña incorrecta'
      });
    }

    // Respuesta sin token
    res.json({
      success: true,
      usuario: {
        id: usuario._id,
        codigo: usuario.codigo,
        nombre: usuario.nombre,
        rol: usuario.rol,
        punto_id: usuario.punto_id,
        activo: usuario.activo
      }
    });

  } catch (error) {
    console.error('Error login:', error);
    res.status(500).json({
      success: false,
      error: 'Error en login'
    });
  }
});

module.exports = router;
