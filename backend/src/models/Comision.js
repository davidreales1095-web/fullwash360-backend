const mongoose = require('mongoose');

const comisionSchema = new mongoose.Schema({

  // ===================== LAVADOR =====================
  lavador_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    index: true
  },

  lavador_nombre: {
    type: String,
    required: true
  },

  lavador_codigo: {
    type: String,
    required: true
  },

  // ===================== CONTEXTO =====================
  punto_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Punto',
    required: true,
    index: true
  },

  // 👉 FECHA NORMALIZADA (DÍA)
  fecha: {
    type: Date,
    required: true,
    index: true
  },

  // ===================== TOTALES =====================
  total_comision: {
    type: Number,
    default: 0,
    min: 0
  },

  total_ordenes: {
    type: Number,
    default: 0,
    min: 0
  },

  // ===================== DETALLE =====================
  ordenes: [{
    orden_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    placa: {
      type: String,
      uppercase: true
    },
    monto: {
      type: Number,
      required: true
    },
    porcentaje: {
      type: Number,
      default: 40
    },
    fecha: {
      type: Date,
      default: Date.now
    }
  }],

  // ===================== ESTADO DE PAGO =====================
  pagada: {
    type: Boolean,
    default: false
  },

  fecha_pago: {
    type: Date,
    default: null
  }

}, { timestamps: true });


// ===================== ÍNDICES =====================
comisionSchema.index({ fecha: 1, lavador_id: 1, punto_id: 1 }, { unique: true });


// ===================== NORMALIZAR FECHA (00:00:00) =====================
comisionSchema.pre('validate', function (next) {
  if (this.fecha) {
    this.fecha.setHours(0, 0, 0, 0);
  }
  next();
});

module.exports = mongoose.model('Comision', comisionSchema);
