// backend/src/models/Punto.js - VERSIÓN CORREGIDA CON PRECIOS ACTUALIZADOS
const mongoose = require('mongoose');

const puntoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  direccion: {
    type: String,
    required: true,
    trim: true
  },
  telefono: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  
  activo: {
    type: Boolean,
    default: true
  },
  
  // Configuración - ¡PRECIOS ACTUALIZADOS!
  configuracion: {
    tarifas: {
      // ✅ CARRO: Express y Premium (NO Elite)
      carro: {
        express: { type: Number, default: 15000 },
        // ❌ ELIMINADO: elite
        premium: { type: Number, default: 20000 }  // Cambiado de 35000 a 20000
      },
      
      // ✅ MOTO: Express, Elite y Premium (todos con nuevos precios)
      moto: {
        express: { type: Number, default: 12000 },  // Cambiado de 10000 a 12000
        elite: { type: Number, default: 15000 },    // Mantenido 15000
        premium: { type: Number, default: 17000 }   // Cambiado de 20000 a 17000
      },
      
      // ✅ TAXI: Solo Express (NO Elite, NO Premium)
      taxi: {
        express: { type: Number, default: 15000 }
        // ❌ ELIMINADO: elite y premium
      },
      
      // ✅ CAMIONETA: Express, Elite y Premium (todos a 15000)
      camioneta: {
        express: { type: Number, default: 15000 },  // Cambiado de 20000 a 15000
        elite: { type: Number, default: 15000 },    // Cambiado de 30000 a 15000
        premium: { type: Number, default: 15000 }   // Cambiado de 40000 a 15000
      }
    },
    
    lavados_para_gratis: { type: Number, default: 10 },
    comision_lavador_porcentaje: { type: Number, default: 40 }
  },
  
  estadisticas: {
    total_clientes: { type: Number, default: 0 },
    total_ordenes: { type: Number, default: 0 },
    total_ingresos: { type: Number, default: 0 },
    ultima_orden_fecha: Date
  },
  
  fecha_creacion: {
    type: Date,
    default: Date.now
  },
  fecha_actualizacion: {
    type: Date,
    default: Date.now
  }
});

// Actualizar fecha_actualizacion antes de guardar
puntoSchema.pre('save', function(next) {
  this.fecha_actualizacion = Date.now();
  next();
});

// Índices
puntoSchema.index({ nombre: 1 });
puntoSchema.index({ activo: 1 });
puntoSchema.index({ 'estadisticas.ultima_orden_fecha': -1 });

module.exports = mongoose.model('Punto', puntoSchema);