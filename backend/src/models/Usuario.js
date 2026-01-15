// backend/src/models/Usuario.js - VERSIÓN COMPLETA CON SISTEMA DE COMISIONES
const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  // Identificación
  codigo: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  
  // ✅ ROL CORREGIDO: Ahora incluye 'lavador'
  rol: {
    type: String,
    enum: ['superadmin', 'admin', 'colaborador', 'cajero', 'lavador'],
    default: 'colaborador'
  },
  punto_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Punto',
    index: true
  },
  
  // Información de trabajo
  telefono: String,
  direccion: String,
  fecha_nacimiento: Date,
  
  // ✅ CORRECTO: Campo "activo" (Boolean)
  activo: {
    type: Boolean,
    default: true
  },
  
  // ✅ Campos antiguos para compatibilidad (TEMPORAL)
  estado: {
    type: String,
    enum: ['activo', 'inactivo'],
    default: 'activo'
  },
  
  permisos: {
    crear_ordenes: { type: Boolean, default: true },
    registrar_clientes: { type: Boolean, default: true },
    ver_reportes: { type: Boolean, default: false },
    gestionar_usuarios: { type: Boolean, default: false }
  },
  
  // ✅ NUEVO: SISTEMA DE COMISIONES PARA LAVADORES
  saldo_comisiones: {
    type: Number,
    default: 0,
    min: 0
  },
  comisiones_mes_actual: {
    type: Number,
    default: 0,
    min: 0
  },
  porcentaje_comision: {
    type: Number,
    default: 40,
    min: 0,
    max: 100,
    validate: {
      validator: Number.isInteger,
      message: 'El porcentaje de comisión debe ser un número entero'
    }
  },
  
  // ✅ Estadísticas mejoradas para lavadores
  estadisticas: {
    ordenes_hoy: { type: Number, default: 0 },
    ordenes_mes: { type: Number, default: 0 },
    total_ordenes: { type: Number, default: 0 },
    total_ingresos: { type: Number, default: 0 },
    // ✅ NUEVO: Estadísticas específicas de comisiones
    total_comisiones: { type: Number, default: 0 },
    promedio_comision_por_orden: { type: Number, default: 0 }
  },
  
  // Auditoría
  fecha_registro: {
    type: Date,
    default: Date.now
  },
  ultimo_login: Date,
  creado_por: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  }
});

// ========== MÉTODOS MEJORADOS ==========

// 1. Encriptar contraseña antes de guardar (MEJORADO)
usuarioSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    // Si la contraseña ya parece un hash bcrypt, no la vuelvas a hashear
    if (this.password && this.password.startsWith('$2a$')) {
      console.log(`⚠️  ${this.codigo}: Password ya encriptada, omitiendo...`);
      return next();
    }
    
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log(`✅ ${this.codigo}: Password encriptada`);
    next();
  } catch (error) {
    console.error(`❌ Error encriptando password para ${this.codigo}:`, error);
    next(error);
  }
});

// 2. Asegurar que "activo" y "estado" sean consistentes (NUEVO)
usuarioSchema.pre('save', function(next) {
  // Si hay "estado", sincronizar con "activo"
  if (this.estado) {
    this.activo = this.estado === 'activo';
  }
  // Si hay "activo", sincronizar con "estado"
  if (this.activo !== undefined) {
    this.estado = this.activo ? 'activo' : 'inactivo';
  }
  next();
});

// ✅ 3. NUEVO: Actualizar estadísticas de comisiones cuando cambia saldo
usuarioSchema.pre('save', function(next) {
  // Solo para usuarios con rol 'lavador'
  if (this.rol === 'lavador') {
    // Actualizar estadísticas
    this.estadisticas.total_comisiones = this.saldo_comisiones || 0;
    
    // Calcular promedio si hay órdenes
    if (this.estadisticas.total_ordenes > 0) {
      this.estadisticas.promedio_comision_por_orden = 
        this.saldo_comisiones / this.estadisticas.total_ordenes;
    }
  }
  next();
});

// 4. Método para comparar contraseñas (MEJORADO)
usuarioSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    const bcrypt = require('bcryptjs');
    
    // Verificar que candidatePassword no esté vacía
    if (!candidatePassword || candidatePassword.trim() === '') {
      console.error(`❌ Contraseña vacía para ${this.codigo}`);
      return false;
    }
    
    // Verificar que this.password exista
    if (!this.password) {
      console.error(`❌ Usuario ${this.codigo} no tiene password almacenada`);
      return false;
    }
    
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    
    if (isMatch) {
      console.log(`✅ Contraseña válida para ${this.codigo}`);
    } else {
      console.log(`❌ Contraseña incorrecta para ${this.codigo}`);
    }
    
    return isMatch;
  } catch (error) {
    console.error(`❌ Error comparando contraseña para ${this.codigo}:`, error);
    return false;
  }
};

// 5. Método para crear hash de contraseña (NUEVO - útil para migraciones)
usuarioSchema.statics.hashPassword = async function(password) {
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// ✅ 6. NUEVO: Método para sumar comisión a lavador
usuarioSchema.methods.sumarComision = async function(montoComision) {
  try {
    if (this.rol !== 'lavador') {
      throw new Error('Solo los lavadores pueden recibir comisiones');
    }
    
    // Actualizar saldo
    this.saldo_comisiones = (this.saldo_comisiones || 0) + montoComision;
    
    // Actualizar mes actual (solo si estamos en el mismo mes)
    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const añoActual = ahora.getFullYear();
    const ultimaActualizacion = this.ultimo_login || this.fecha_registro;
    
    if (ultimaActualizacion) {
      const ultimaFecha = new Date(ultimaActualizacion);
      if (ultimaFecha.getMonth() === mesActual && ultimaFecha.getFullYear() === añoActual) {
        this.comisiones_mes_actual = (this.comisiones_mes_actual || 0) + montoComision;
      } else {
        // Nuevo mes, reiniciar contador
        this.comisiones_mes_actual = montoComision;
      }
    }
    
    // Incrementar contador de órdenes
    this.estadisticas.total_ordenes = (this.estadisticas.total_ordenes || 0) + 1;
    
    await this.save();
    console.log(`✅ Comisión de $${montoComision} agregada a ${this.codigo}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error sumando comisión a ${this.codigo}:`, error);
    return false;
  }
};

// 7. Eliminar contraseña de las respuestas JSON
usuarioSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// ✅ Índices mejorados para búsqueda de lavadores
usuarioSchema.index({ codigo: 1 }, { unique: true });
usuarioSchema.index({ rol: 1 });
usuarioSchema.index({ punto_id: 1 });
usuarioSchema.index({ activo: 1 });
usuarioSchema.index({ estado: 1 });
usuarioSchema.index({ 'estadisticas.total_ordenes': -1 }); // Para ranking lavadores
usuarioSchema.index({ saldo_comisiones: -1 }); // Para consultas de comisiones

module.exports = mongoose.model('Usuario', usuarioSchema);