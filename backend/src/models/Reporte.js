// backend/src/models/Reporte.js
const mongoose = require('mongoose');

const reporteSchema = new mongoose.Schema({
  // Identificación
  codigo_reporte: {
    type: String,
    unique: true,
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  
  // Referencias
  punto_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Punto',
    required: true
  },
  generado_por: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  
  // Tipo y parámetros
  tipo_reporte: {
    type: String,
    enum: [
      'ventas_diarias', 
      'ventas_mensuales', 
      'clientes_nuevos',
      'lavados_gratis',
      'rendimiento_empleados',
      'inventario',
      'personalizado'
    ],
    required: true
  },
  parametros: {
    fecha_inicio: Date,
    fecha_fin: Date,
    usuario_id: mongoose.Schema.Types.ObjectId,
    cliente_id: mongoose.Schema.Types.ObjectId,
    tipo_vehiculo: String,
    estado_orden: String
  },
  
  // Datos del reporte
  datos: mongoose.Schema.Types.Mixed, // Puede contener cualquier estructura
  
  // Archivo generado
  formato: {
    type: String,
    enum: ['json', 'pdf', 'excel', 'html'],
    default: 'json'
  },
  archivo_url: String,
  archivo_size: Number,
  
  // Estadísticas del reporte
  estadisticas: {
    total_registros: Number,
    total_ventas: Number,
    periodo_dias: Number
  },
  
  // Estado
  estado: {
    type: String,
    enum: ['generando', 'completado', 'error', 'programado'],
    default: 'generando'
  },
  
  // Programación (para reportes recurrentes)
  programacion: {
    recurrente: { type: Boolean, default: false },
    frecuencia: {
      type: String,
      enum: ['diario', 'semanal', 'mensual', 'anual']
    },
    dia_semana: Number,
    dia_mes: Number,
    hora_envio: String
  },
  
  // Destinatarios
  destinatarios: [String], // Emails
  
  // Fechas
  fecha_generacion: {
    type: Date,
    default: Date.now
  },
  fecha_proxima_ejecucion: Date
});

// Índices
reporteSchema.index({ codigo_reporte: 1 });
reporteSchema.index({ punto_id: 1, tipo_reporte: 1 });
reporteSchema.index({ fecha_generacion: -1 });
reporteSchema.index({ estado: 1 });

// Generar código de reporte automático
reporteSchema.pre('save', function(next) {
  if (this.isNew) {
    const now = new Date();
    const timestamp = now.getTime();
    const random = Math.floor(Math.random() * 1000);
    this.codigo_reporte = `REP-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Reporte', reporteSchema);