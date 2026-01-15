// backend/server.js - VERSIÓN PARA VERCEL
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ======================
// 1. MIDDLEWARES
// ======================
// CORS para permitir Vercel y local
app.use(cors({
  origin: ['https://fullwash360.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// 2. CONEXIÓN MONGODB MEJORADA
// ======================
console.log('🔗 Conectando a MongoDB...');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fullwash360;';
console.log('URI:', mongoURI);

async function connectToDatabase() {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
    
    console.log('✅ Conectado a MongoDB');
    console.log(`📊 Base de datos: ${mongoose.connection.db.databaseName}`);
    console.log(`📦 Estado: ${mongoose.connection.readyState === 1 ? 'Conectado 🟢' : 'Desconectado 🔴'}`);
    
    await verificarDatos();
    return true;
  } catch (err) {
    console.error('❌ Error conectando a MongoDB:', err.message);
    
    if (mongoURI.includes(';')) {
      console.log('🔄 Intentando conexión sin punto y coma...');
      const mongoURISinPuntoComa = mongoURI.replace(';', '');
      try {
        await mongoose.connect(mongoURISinPuntoComa, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log('✅ Conectado a MongoDB sin punto y coma');
        return true;
      } catch (error2) {
        console.error('❌ Error en segunda conexión:', error2.message);
      }
    }
    
    return false;
  }
}

async function verificarDatos() {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`📦 Colecciones encontradas: ${collections.length}`);
    
    const usuarios = await db.collection('usuarios').countDocuments();
    console.log(`👥 Total usuarios: ${usuarios}`);
    
    const lavadores = await db.collection('usuarios')
      .find({ rol: 'lavador' })
      .toArray();
    
    console.log(`🚗 Lavadores encontrados: ${lavadores.length}`);
    
    if (lavadores.length === 0) {
      console.warn('⚠️  ADVERTENCIA: No se encontraron lavadores en la base de datos');
    } else {
      lavadores.forEach(l => {
        console.log(`   - ${l.codigo}: Punto ${l.punto_id}`);
      });
    }
    
    const puntos = await db.collection('puntos').countDocuments();
    console.log(`📍 Puntos de lavado: ${puntos}`);
    
    return lavadores.length > 0;
  } catch (error) {
    console.error('❌ Error verificando datos:', error.message);
    return false;
  }
}

// ======================
// 3. IMPORTAR MODELOS
// ======================
async function cargarModelos() {
  console.log('\n📁 Cargando modelos desde src/models/...');
  
  try {
    require('./src/models/Punto');
    require('./src/models/Usuario');
    require('./src/models/Cliente');
    require('./src/models/Vehiculo');
    require('./src/models/Orden');
    require('./src/models/LavadoGratis');
    require('./src/models/Reporte');
    
    console.log('✅ Modelos cargados');
    return true;
  } catch (error) {
    console.error('❌ Error cargando modelos:', error.message);
    return false;
  }
}

// ======================
// 4. INICIALIZACIÓN MEJORADA
// ======================
async function inicializarSistemaCompleta() {
  try {
    console.log('\n🎯 INICIANDO INICIALIZACIÓN DEL SISTEMA...');
    
    const Punto = mongoose.model('Punto');
    const User = mongoose.model('Usuario');
    
    const puntosExistentes = await Punto.countDocuments();
    console.log(`📍 Puntos existentes en BD: ${puntosExistentes}`);
    
    let puntoPrincipal;
    
    if (puntosExistentes === 0) {
      console.log('📍 Creando punto "Sede Principal"...');
      
      puntoPrincipal = new Punto({
        nombre: 'Sede Principal',
        direccion: 'Calle Principal #123',
        telefono: '3001234567',
        email: 'sede@fullwash360.com',
        capacidad_simultanea: 5,
        estado: 'activo',
        horario_apertura: '08:00',
        horario_cierre: '20:00',
        servicios_habilitados: ['express', 'elite', 'premium']
      });
      
      await puntoPrincipal.save();
      console.log(`✅ Punto creado: ${puntoPrincipal.nombre} (ID: ${puntoPrincipal._id})`);
    } else {
      puntoPrincipal = await Punto.findOne({ nombre: 'Sede Principal' });
      if (puntoPrincipal) {
        console.log(`✅ Punto encontrado: ${puntoPrincipal.nombre} (ID: ${puntoPrincipal._id})`);
      } else {
        puntoPrincipal = await Punto.findOne();
        console.log(`✅ Usando punto existente: ${puntoPrincipal.nombre} (ID: ${puntoPrincipal._id})`);
      }
    }
    
    const adminExistente = await User.findOne({ codigo: 'ADMIN' });
    
    if (!adminExistente) {
      console.log('👤 Creando usuario ADMIN...');
      
      const adminUser = new User({
        codigo: 'ADMIN',
        nombre: 'Administrador Principal',
        password: 'admin123',
        email: 'admin@fullwash360.com',
        rol: 'admin',
        punto_id: puntoPrincipal._id,
        activo: true,
        estado: 'activo',
        telefono: '3001234567',
        permisos: {
          crear_ordenes: true,
          registrar_clientes: true,
          ver_reportes: true,
          gestionar_usuarios: true
        }
      });
      
      await adminUser.save();
      console.log('✅ USUARIO ADMIN CREADO EXITOSAMENTE');
      console.log('📋 CREDENCIALES:');
      console.log(`   Usuario: ADMIN`);
      console.log(`   Contraseña: admin123`);
      console.log(`   Rol: admin`);
      console.log(`   Punto: ${puntoPrincipal.nombre}`);
    } else {
      console.log('✅ Usuario ADMIN ya existe en el sistema');
      
      if (!adminExistente.punto_id) {
        console.log('📍 Asignando punto al usuario ADMIN...');
        adminExistente.punto_id = puntoPrincipal._id;
        await adminExistente.save();
        console.log('✅ Punto asignado al ADMIN');
      }
    }
    
    const lavadores = await User.find({ rol: 'lavador' });
    console.log(`🚗 Lavadores en sistema: ${lavadores.length}`);
    
    if (lavadores.length === 0) {
      console.log('⚠️  Creando lavadores de prueba...');
      
      const lavadoresPrueba = [
        { codigo: 'LAV_001', nombre: 'Lavador Uno', password: 'lavador123', rol: 'lavador', punto_id: puntoPrincipal._id },
        { codigo: 'LAV_002', nombre: 'Lavador Dos', password: 'lavador123', rol: 'lavador', punto_id: puntoPrincipal._id },
        { codigo: 'LAV_003', nombre: 'Lavador Tres', password: 'lavador123', rol: 'lavador', punto_id: puntoPrincipal._id },
      ];
      
      for (const lavador of lavadoresPrueba) {
        const existe = await User.findOne({ codigo: lavador.codigo });
        if (!existe) {
          await User.create(lavador);
          console.log(`   ✅ ${lavador.codigo} creado`);
        }
      }
    }
    
    const totalUsuarios = await User.countDocuments();
    console.log(`📊 Total de usuarios en el sistema: ${totalUsuarios}`);
    
    console.log('\n🎉 INICIALIZACIÓN COMPLETADA');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error en inicialización:', error.message);
    console.log('⚠️  Continuando sin inicialización completa...');
  }
}

// ======================
// 5. CONFIGURAR RUTAS Y APP
// ======================
async function configurarApp() {
  console.log('\n🛣️  Configurando rutas desde src/routes/...');
  
  const authRoutes = require('./src/routes/auth.routes');
  const userRoutes = require('./src/routes/user.routes');
  const orderRoutes = require('./src/routes/order.routes');
  const clienteRoutes = require('./src/routes/clienteRoutes');
  const reporteRoutes = require('./src/routes/reporteRoutes');
  const lavadorRoutes = require('./src/routes/lavadorRoutes');
  
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/clientes', clienteRoutes);
  app.use('/api/reportes', reporteRoutes);
  app.use('/api/lavadores', lavadorRoutes);
  
  console.log('✅ Rutas configuradas');
  
  // Ruta de diagnóstico
  app.get('/api/debug/database', async (req, res) => {
    try {
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      
      const resultado = {
        database: db.databaseName,
        collections: [],
        usuarios: 0,
        lavadores: 0
      };
      
      for (const col of collections) {
        const count = await db.collection(col.name).countDocuments();
        resultado.collections.push({ nombre: col.name, documentos: count });
        
        if (col.name === 'usuarios') {
          resultado.usuarios = count;
          const lavadores = await db.collection('usuarios')
            .find({ rol: 'lavador' })
            .toArray();
          resultado.lavadores = lavadores.length;
          resultado.listaLavadores = lavadores.map(l => ({
            codigo: l.codigo,
            punto_id: l.punto_id
          }));
        }
      }
      
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get('/api/debug/lavadores', async (req, res) => {
    try {
      const User = require('./src/models/Usuario');
      const lavadores = await User.find({ rol: 'lavador' })
        .select('codigo nombre punto_id activo saldo_comisiones total_ordenes')
        .populate('punto_id', 'nombre');
      
      res.json({
        success: true,
        total: lavadores.length,
        lavadores: lavadores
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get('/api/debug/comisiones', async (req, res) => {
    try {
      const User = require('./src/models/Usuario');
      const Order = require('./src/models/Orden');
      
      const lavadores = await User.find({ rol: 'lavador' })
        .select('codigo nombre saldo_comisiones comisiones_mes_actual estadisticas.total_ordenes')
        .sort({ saldo_comisiones: -1 });
      
      const ordenesRecientes = await Order.find({
        estado: 'completado',
        'comision_lavador.monto': { $gt: 0 }
      })
      .sort({ fecha_cobro: -1 })
      .limit(10)
      .populate('lavador_asignado', 'codigo nombre')
      .select('numero_orden placa total comision_lavador.monto fecha_cobro');
      
      res.json({
        success: true,
        sistema_comisiones: {
          estado: '✅ ACTIVO',
          porcentaje_comision: '40% FIJO',
          lavadores_con_saldo: lavadores.length
        },
        lavadores: lavadores,
        ultimas_comisiones: ordenesRecientes.map(orden => ({
          orden: orden.numero_orden,
          placa: orden.placa,
          monto: orden.total,
          comision: orden.comision_lavador?.monto || 0,
          lavador: orden.lavador_asignado ? {
            codigo: orden.lavador_asignado.codigo,
            nombre: orden.lavador_asignado.nombre
          } : 'No asignado',
          fecha: orden.fecha_cobro
        }))
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: 'Error en diagnóstico de comisiones',
        details: error.message 
      });
    }
  });
  
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      message: 'FullWash 360 Backend funcionando',
      database: {
        name: mongoose.connection.db?.databaseName,
        state: mongoose.connection.readyState === 1 ? 'connected 🟢' : 'disconnected 🔴',
        host: mongoose.connection.host
      },
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        orders: '/api/orders',
        clientes: '/api/clientes',
        reportes: '/api/reportes',
        lavadores: '/api/lavadores',
        debug: '/api/debug'
      },
      timestamp: new Date().toISOString()
    });
  });

  // Ruta de prueba para Vercel
  app.get('/api/test', (req, res) => {
    res.json({ 
      message: 'Backend FullWash 360 funcionando',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  });
  
  app.get('/', (req, res) => {
    res.json({
      message: '🚗 FullWash 360 API',
      version: '1.4.0',
      status: 'online',
      database: mongoose.connection.readyState === 1 ? 'connected 🟢' : 'disconnected 🔴',
      features: {
        sistema_comisiones: '✅ ACTIVO (40% fijo)',
        lavador_asignado: '✅ ObjectId estandarizado',
        saldo_comisiones: '✅ Acumulación automática'
      },
      diagnosticos: {
        database: 'GET /api/debug/database',
        lavadores: 'GET /api/debug/lavadores',
        comisiones: 'GET /api/debug/comisiones',
        health: 'GET /api/health'
      },
      reportes_disponibles: [
        'GET /api/reportes/diario',
        'GET /api/reportes/comisiones',
        'GET /api/reportes/comisiones/lavadores',
        'GET /api/reportes/comisiones/lavador/:id',
        'GET /api/reportes/comisiones/diarias'
      ],
      lavadores_endpoint: 'GET /api/lavadores'
    });
  });
  
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Ruta no encontrada',
      path: req.originalUrl,
      sugerencias: [
        '/api/health para estado del sistema',
        '/api/reportes/comisiones/diarias para comisiones',
        '/api/debug/comisiones para diagnóstico',
        '/api/lavadores para listar lavadores'
      ]
    });
  });
  
  app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });
  
  return app;
}

// ======================
// 6. FUNCIÓN PRINCIPAL ASYNC
// ======================
async function iniciarServidor() {
  try {
    console.log('🚀 Iniciando FullWash 360 Backend...');
    
    // 1. Conectar a MongoDB
    const conectado = await connectToDatabase();
    if (!conectado) {
      throw new Error('No se pudo conectar a MongoDB');
    }
    
    // 2. Cargar modelos
    await cargarModelos();
    
    // 3. Inicializar sistema
    await inicializarSistemaCompleta();
    
    // 4. Configurar app y rutas
    const app = await configurarApp();
    
    console.log('\n✅ FullWash 360 Backend configurado correctamente');
    console.log('📊 MongoDB Atlas: Conectado ✅');
    console.log('🛣️  Rutas API: Configuradas ✅');
    console.log('👤 Usuario admin: Disponible (ADMIN / admin123)');
    
    return app;
    
  } catch (error) {
    console.error('❌ Error crítico al iniciar servidor:', error.message);
    throw error;
  }
}

// ======================
// 7. MANEJO PARA VERCEL vs DESARROLLO LOCAL
// ======================
if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  // Para Vercel: Exportar como función serverless
  console.log('🌐 Modo Vercel (serverless) detectado');
  
  // Inicializar y exportar la app
  let appPromise = iniciarServidor().catch(err => {
    console.error('❌ Error fatal al iniciar en Vercel:', err);
    // Devolver una app básica que muestre error
    const errorApp = express();
    errorApp.use((req, res) => {
      res.status(500).json({
        error: 'Servicio no disponible',
        message: 'El backend no pudo iniciar correctamente'
      });
    });
    return errorApp;
  });
  
  // Exportar handler para Vercel
  module.exports = async (req, res) => {
    try {
      const app = await appPromise;
      return app(req, res);
    } catch (error) {
      console.error('Error en handler Vercel:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
  
} else {
  // Para desarrollo local
  const PORT = process.env.PORT || 5000;
  
  iniciarServidor()
    .then(app => {
      app.listen(PORT, () => {
        console.log(`\n🚀 Servidor FullWash 360 iniciado en puerto ${PORT}`);
        console.log(`🌐 URL: http://localhost:${PORT}`);
        console.log(`\n📊 ENDPOINTS PRINCIPALES:`);
        console.log(`   🔐 Auth:        http://localhost:${PORT}/api/auth`);
        console.log(`   👥 Users:       http://localhost:${PORT}/api/users`);
        console.log(`   🚗 Orders:      http://localhost:${PORT}/api/orders`);
        console.log(`   👤 Clientes:    http://localhost:${PORT}/api/clientes`);
        console.log(`   📈 Reportes:    http://localhost:${PORT}/api/reportes`);
        console.log(`   👥 Lavadores:   http://localhost:${PORT}/api/lavadores`);
        console.log(`\n🔍 ENDPOINTS DE DIAGNÓSTICO:`);
        console.log(`   📊 Database:    http://localhost:${PORT}/api/debug/database`);
        console.log(`   🚗 Lavadores:   http://localhost:${PORT}/api/debug/lavadores`);
        console.log(`   💰 Comisiones:  http://localhost:${PORT}/api/debug/comisiones`);
        console.log(`   ❤️  Health:      http://localhost:${PORT}/api/health`);
        console.log(`\n✅ SISTEMA DE COMISIONES ACTIVO - 40% FIJO`);
      });
    })
    .catch(err => {
      console.error('❌ No se pudo iniciar el servidor:', err);
      process.exit(1);
    });
}