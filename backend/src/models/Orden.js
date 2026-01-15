const mongoose = require('mongoose');

const ordenSchema = new mongoose.Schema({
  numero_orden: { type: String, unique: true, index: true },
  punto_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Punto', required: true, index: true },
  usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, index: true },
  creado_por: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  cliente_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', default: null },
  vehiculo_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehiculo', default: null },
  placa: { type: String, required: true, uppercase: true, index: true },
  tipo_vehiculo: { type: String, enum: ['carro','moto','taxi','camioneta'], default: 'carro' },
  servicios: [{
    nombre: { type: String, required: true },
    tipo: { type: String, enum: ['lavado','pulido','encerado','interior','motor','otros'], default: 'lavado' },
    tipo_lavado: { type: String, enum: ['express','elite','premium'], default: 'express' },
    precio: { type: Number, required: true, min: 0 },
    duracion_minutos: { type: Number, default: 30 }
  }],
  subtotal: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  metodo_pago: { type: String, enum: ['efectivo','tarjeta','transferencia','yape','plin','otros'], default: 'efectivo' },
  pago_recibido: { type: Number, default: 0 },
  vuelto: { type: Number, default: 0 },
  fecha_creacion: { type: Date, default: Date.now, index: true },
  fecha_entrada: { type: Date, default: Date.now },
  fecha_cobro: { type: Date, default: null },
  fecha_salida_real: { type: Date, default: null },
  tiempo_total_minutos: { type: Number },
  lavador_asignado: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', index: true, default: null },
  comision_lavador: {
    lavador_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', index: true, default: null },
    lavador_nombre: { type: String, default: '' },
    monto: { type: Number, min: 0, default: 0 },
    porcentaje: { type: Number, default: 40 },
    pagado: { type: Boolean, default: false },
    fecha_pago: { type: Date, default: null }
  },
  contador_lavada: { 
    type: Number, 
    default: 1,
    min: 1,        // ✅ AÑADIDO
    max: 10        // ✅ AÑADIDO
  },
  es_decima_gratis: { type: Boolean, default: false },
  total_lavadas_meta: { type: Number, default: 10 },
  notas_cliente: { type: String, default: '' },
  impreso: { type: Boolean, default: false },
  estado: { type: String, enum: ['activa','completada','cancelada'], default: 'activa', index: true }
}, { timestamps: true });

// Índices
ordenSchema.index({ punto_id: 1, fecha_creacion: -1 });
ordenSchema.index({ punto_id: 1, fecha_cobro: -1 });
ordenSchema.index({ lavador_asignado: 1, fecha_cobro: -1 });
ordenSchema.index({ placa: 1, punto_id: 1 });
ordenSchema.index({ estado: 1, punto_id: 1 }); // Nuevo índice para órdenes activas

// Número de orden automático
ordenSchema.pre('save', async function(next) {
  if (!this.isNew || this.numero_orden) return next();
  try {
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const totalHoy = await this.constructor.countDocuments({ fecha_creacion: { $gte: hoy } });
    const fecha = hoy.toISOString().slice(0,10).replace(/-/g,'');
    this.numero_orden = `ORD-${fecha}-${String(totalHoy+1).padStart(4,'0')}`;
    next();
  } catch(err) {
    this.numero_orden = `ERR-${Date.now()}`;
    next();
  }
});

// Middleware para calcular comisión automáticamente cuando se marca como completada
ordenSchema.pre('save', function(next) {
  // Si se está completando la orden y tiene lavador, calcular comisión
  if (this.estado === 'completada' && this.lavador_asignado && !this.comision_lavador.monto) {
    const porcentaje = this.comision_lavador.porcentaje || 40;
    this.comision_lavador.monto = (this.total * porcentaje) / 100;
    this.comision_lavador.lavador_id = this.lavador_asignado;
    this.comision_lavador.pagado = false;
    this.comision_lavador.fecha_pago = null;
  }
  
  // ✅ COMENTADO: Ya se maneja en el controlador
  // Si es la décima gratis, ajustar total a 0
  // if (this.es_decima_gratis && this.estado === 'completada') {
  //   this.total = 0;
  //   this.comision_lavador.monto = 0;
  // }
  
  next();
});

// Método para cobrar la orden (desde el controller)
ordenSchema.methods.cobrarOrden = function(lavadorId, lavadorNombre) {
  this.estado = 'completada';
  this.fecha_cobro = new Date();
  this.lavador_asignado = lavadorId;
  
  // Si no tiene nombre de lavador, asignarlo
  if (!this.comision_lavador.lavador_nombre && lavadorNombre) {
    this.comision_lavador.lavador_nombre = lavadorNombre;
  }
  
  return this.save();
};

// Método estático para obtener órdenes activas por punto
ordenSchema.statics.obtenerOrdenesActivas = function(puntoId) {
  return this.find({
    punto_id: puntoId,
    estado: 'activa',
    lavador_asignado: null // Solo órdenes sin lavador asignado
  })
    .populate('vehiculo_id', 'placa marca modelo color')
    .populate('cliente_id', 'nombre telefono')
    .sort({ fecha_creacion: -1 });
};

// Método estático para obtener historial por punto
ordenSchema.statics.obtenerHistorial = function(puntoId, fechaInicio, fechaFin) {
  const query = {
    punto_id: puntoId,
    estado: 'completada'
  };
  
  if (fechaInicio && fechaFin) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    fin.setHours(23, 59, 59, 999);
    
    query.fecha_cobro = {
      $gte: inicio,
      $lte: fin
    };
  }
  
  return this.find(query)
    .populate('vehiculo_id', 'placa marca modelo')
    .populate('lavador_asignado', 'nombre codigo')
    .populate('cliente_id', 'nombre')
    .sort({ fecha_cobro: -1 });
};

module.exports = mongoose.model('Order', ordenSchema, 'ordenes');