// backend/src/models/LavadoGratis.js
const mongoose = require('mongoose');

const lavadoGratisSchema = new mongoose.Schema({
  // Referencias
  punto_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Punto',
    required: true
  },
  cliente_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  vehiculo_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehiculo',
    required: true
  },
  
  // Contadores
  lavados_pagados: {
    type: Number,
    default: 0,
    min: 0
  },
  lavados_gratis_obtenidos: {
    type: Number,
    default: 0,
    min: 0
  },
  lavados_necesarios_para_gratis: {
    type: Number,
    default: 10
  },
  
  // Estado
  estado: {
    type: String,
    enum: ['activo', 'inactivo', 'pendiente_gratis'],
    default: 'activo'
  },
  
  // Historial de lavados gratis obtenidos
  historial_gratis: [{
    fecha: { type: Date, default: Date.now },
    orden_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Orden' },
    utilizado_en_orden: { type: mongoose.Schema.Types.ObjectId, ref: 'Orden' }
  }],
  
  // Fechas
  fecha_registro: {
    type: Date,
    default: Date.now
  },
  fecha_ultimo_lavado: Date,
  fecha_proximo_gratis_estimada: Date
});

// Índices
lavadoGratisSchema.index({ punto_id: 1, cliente_id: 1 });
lavadoGratisSchema.index({ punto_id: 1, vehiculo_id: 1 });
lavadoGratisSchema.index({ estado: 1 });

module.exports = mongoose.model('LavadoGratis', lavadoGratisSchema);