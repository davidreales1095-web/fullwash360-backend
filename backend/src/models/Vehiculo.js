// models/Vehiculo.js - VERSIÓN CORREGIDA
const mongoose = require('mongoose');

const vehiculoSchema = new mongoose.Schema({
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
  registrado_por: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  placa: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  marca: {
    type: String,
    default: 'NO REGISTRADA',
    trim: true
  },
  modelo: {
    type: String,
    default: 'NO REGISTRADO',
    trim: true
  },
  tipo_vehiculo: {
    type: String,
    enum: ['carro', 'moto', 'taxi', 'camioneta'],
    default: 'carro'
  },
  estadisticas: {
    total_lavados: { type: Number, default: 0 },
    // ✅ CORREGIDO: 0-9 (lavadas realizadas)
    contador_actual: { type: Number, default: 0, min: 0, max: 9 },
    lavados_gratis: { type: Number, default: 0 },
    ultimo_lavado: Date,
    primer_lavado: { type: Date, default: Date.now }
  },
  estado: {
    type: String,
    enum: ['activo', 'inactivo'],
    default: 'activo'
  },
  fecha_registro: {
    type: Date,
    default: Date.now
  }
});

// Índices
vehiculoSchema.index({ punto_id: 1 });
vehiculoSchema.index({ placa: 1 });
vehiculoSchema.index({ punto_id: 1, placa: 1 });
vehiculoSchema.index({ cliente_id: 1 });

module.exports = mongoose.model('Vehiculo', vehiculoSchema);