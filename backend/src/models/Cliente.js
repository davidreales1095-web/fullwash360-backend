// models/Cliente.js - VERSIÓN CORREGIDA CON RELACIÓN A VEHÍCULO
const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  punto_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Punto',
    required: true
  },
  registrado_por: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  nombre_completo: {
    type: String,
    required: true,
    trim: true
  },
  telefono: {
    type: String,
    required: true,
    trim: true
  },
  placa_vehiculo: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  tipo_lavado_preferido: {
    type: String,
    enum: ['express', 'elite', 'premium'],
    default: 'express'
  },
  direccion: String,
  // ✅ NUEVOS CAMPOS AGREGADOS
  vehiculo_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehiculo',
    default: null
  },
  lavadas_iniciales: {
    type: Number,
    default: 0,
    min: 0,
    max: 9
  },
  estado: {
    type: String,
    enum: ['activo', 'inactivo'],
    default: 'activo'
  },
  fecha_registro: {
    type: Date,
    default: Date.now
  },
  fecha_actualizacion: {
    type: Date,
    default: Date.now
  }
});

// ✅ INDICES MEJORADOS (sin unique para evitar errores)
clienteSchema.index({ punto_id: 1 });
clienteSchema.index({ placa_vehiculo: 1 });
clienteSchema.index({ punto_id: 1, placa_vehiculo: 1 });
clienteSchema.index({ vehiculo_id: 1 }); // ✅ NUEVO ÍNDICE PARA BÚSQUEDAS RÁPIDAS

// Actualizar fecha_actualizacion
clienteSchema.pre('save', function(next) {
  this.fecha_actualizacion = Date.now();
  next();
});

// ✅ MIDDLEWARE: Después de guardar, si lavadas_iniciales > 0, actualizar vehículo
clienteSchema.post('save', async function(doc) {
  try {
    if (doc.lavadas_iniciales > 0 && doc.vehiculo_id) {
      const Vehiculo = mongoose.model('Vehiculo');
      await Vehiculo.findByIdAndUpdate(doc.vehiculo_id, {
        'estadisticas.contador_actual': doc.lavadas_iniciales,
        'estadisticas.total_lavados': doc.lavadas_iniciales
      });
      console.log(`✅ Lavadas iniciales (${doc.lavadas_iniciales}) aplicadas a vehículo ${doc.vehiculo_id}`);
    }
  } catch (error) {
    console.error('❌ Error aplicando lavadas iniciales:', error);
  }
});

module.exports = mongoose.model('Cliente', clienteSchema);