// backend/scripts/initDatabase.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Importar modelos
const Punto = require('../src/models/Punto');
const Usuario = require('../src/models/Usuario');

async function initDatabase() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fullwash360', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Conectado a MongoDB');
    
    // 1. Crear punto principal
    const puntoPrincipal = new Punto({
      nombre: 'FullWash 360 - Sede Central',
      direccion: 'Av. Principal 123, Ciudad',
      telefono: '01-555-0001',
      email: 'central@fullwash360.com',
      configuracion: {
        precio_lavado_basico: 15,
        precio_lavado_completo: 25,
        precio_lavado_premium: 40,
        lavados_para_gratis: 10
      }
    });
    
    await puntoPrincipal.save();
    console.log(`✅ Punto creado: ${puntoPrincipal.nombre}`);
    
    // 2. Crear superadmin (sin punto)
    const superadminPassword = await bcrypt.hash('superadmin123', 10);
    const superadmin = new Usuario({
      codigo: 'SUPER001',
      nombre: 'Super Administrador',
      email: 'superadmin@fullwash360.com',
      password: superadminPassword,
      rol: 'superadmin',
      estado: 'activo',
      permisos: {
        crear_ordenes: true,
        registrar_clientes: true,
        ver_reportes: true,
        gestionar_usuarios: true
      }
    });
    
    await superadmin.save();
    console.log(`✅ SuperAdmin creado: ${superadmin.codigo}`);
    
    // 3. Crear admin para el punto principal
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = new Usuario({
      codigo: 'ADM001',
      nombre: 'Administrador Principal',
      email: 'admin@fullwash360.com',
      password: adminPassword,
      rol: 'admin',
      punto_id: puntoPrincipal._id,
      estado: 'activo',
      creado_por: superadmin._id,
      permisos: {
        crear_ordenes: true,
        registrar_clientes: true,
        ver_reportes: true,
        gestionar_usuarios: true
      }
    });
    
    await admin.save();
    console.log(`✅ Admin creado: ${admin.codigo} para punto ${puntoPrincipal.nombre}`);
    
    // 4. Crear colaborador de ejemplo
    const colaboradorPassword = await bcrypt.hash('colab123', 10);
    const colaborador = new Usuario({
      codigo: 'COL001',
      nombre: 'Colaborador Ejemplo',
      email: 'colaborador@fullwash360.com',
      password: colaboradorPassword,
      rol: 'colaborador',
      punto_id: puntoPrincipal._id,
      estado: 'activo',
      creado_por: admin._id,
      permisos: {
        crear_ordenes: true,
        registrar_clientes: true,
        ver_reportes: false,
        gestionar_usuarios: false
      }
    });
    
    await colaborador.save();
    console.log(`✅ Colaborador creado: ${colaborador.codigo}`);
    
    console.log('\n🎉 Base de datos inicializada correctamente!');
    console.log('\n📋 Credenciales iniciales:');
    console.log('===============================');
    console.log('SuperAdmin:');
    console.log('  Código: SUPER001');
    console.log('  Contraseña: superadmin123');
    console.log('\nAdmin del punto:');
    console.log('  Código: ADM001');
    console.log('  Contraseña: admin123');
    console.log('\nColaborador:');
    console.log('  Código: COL001');
    console.log('  Contraseña: colab123');
    console.log('\n🔗 URL Frontend: http://localhost:3000');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;