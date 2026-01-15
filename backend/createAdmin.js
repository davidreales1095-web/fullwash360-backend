// backend/createLavadores.js - SCRIPT PARA CREAR LAVADORES
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Colores para la terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m'
};

console.log(colors.bright + colors.cyan + '🚀 INICIANDO CREACIÓN DE USUARIOS LAVADORES' + colors.reset);
console.log('='.repeat(70));

async function createLavadores() {
  let connection = null;
  
  try {
    // 1. CONECTAR A MONGODB
    console.log(colors.yellow + '🔗 Conectando a MongoDB...' + colors.reset);
    
    if (!process.env.MONGODB_URI) {
      console.error(colors.red + '❌ ERROR: No se encontró MONGODB_URI en .env' + colors.reset);
      process.exit(1);
    }
    
    connection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(colors.green + '✅ MongoDB conectado exitosamente' + colors.reset);
    
    // 2. IMPORTAR MODELOS
    const User = require('./src/models/Usuario');
    const Punto = require('./src/models/Punto');
    
    // 3. VERIFICAR SI EL MODELO USA ROL "LAVADOR"
    console.log(colors.yellow + '🔍 Verificando modelo de usuario...' + colors.reset);
    
    // Obtener esquema para verificar enum
    const usuarioSchema = User.schema;
    const rolPath = usuarioSchema.path('rol');
    
    if (rolPath && rolPath.enumValues) {
      console.log(colors.cyan + `📋 Roles permitidos: ${rolPath.enumValues.join(', ')}` + colors.reset);
      
      if (!rolPath.enumValues.includes('lavador')) {
        console.error(colors.red + '❌ ERROR: El modelo Usuario no tiene rol "lavador" en el enum' + colors.reset);
        console.log(colors.yellow + '💡 Debes modificar src/models/Usuario.js y agregar "lavador" al array enum:' + colors.reset);
        console.log(colors.cyan + '   enum: [\'superadmin\', \'admin\', \'colaborador\', \'cajero\', \'lavador\']' + colors.reset);
        await mongoose.disconnect();
        process.exit(1);
      }
    }
    
    // 4. BUSCAR PUNTO "Sede Principal"
    console.log(colors.yellow + '📍 Buscando punto de lavado...' + colors.reset);
    
    let puntoLavado = await Punto.findOne({ nombre: 'Sede Principal' });
    
    if (!puntoLavado) {
      console.error(colors.red + '❌ ERROR: No se encontró el punto "Sede Principal"' + colors.reset);
      console.log(colors.yellow + '💡 Primero debes crear el punto o usar createAdmin.js' + colors.reset);
      await mongoose.disconnect();
      process.exit(1);
    }
    
    console.log(colors.green + `✅ Punto encontrado: ${puntoLavado.nombre} (ID: ${puntoLavado._id})` + colors.reset);
    
    // 5. DEFINIR LAVADORES A CREAR
    const lavadores = [
      {
        codigo: 'LAV_001',
        nombre: 'Juan Pérez',
        password: 'lavador123',
        email: 'lavador1@fullwash360.com',
        rol: 'lavador',
        punto_id: puntoLavado._id,
        telefono: '3001000001',
        direccion: 'Calle 1 #23-45',
        activo: true
      },
      {
        codigo: 'LAV_002',
        nombre: 'María García',
        password: 'lavador123',
        email: 'lavador2@fullwash360.com',
        rol: 'lavador',
        punto_id: puntoLavado._id,
        telefono: '3001000002',
        direccion: 'Carrera 45 #67-89',
        activo: true
      },
      {
        codigo: 'LAV_003',
        nombre: 'Carlos López',
        password: 'lavador123',
        email: 'lavador3@fullwash360.com',
        rol: 'lavador',
        punto_id: puntoLavado._id,
        telefono: '3001000003',
        direccion: 'Avenida 30 #10-20',
        activo: true
      }
    ];
    
    console.log(colors.yellow + `👷 Preparando creación de ${lavadores.length} lavadores...` + colors.reset);
    
    // 6. VERIFICAR LAVADORES EXISTENTES
    const lavadoresExistentes = [];
    const lavadoresNuevos = [];
    
    for (const lavador of lavadores) {
      const existe = await User.findOne({ codigo: lavador.codigo });
      if (existe) {
        lavadoresExistentes.push(lavador);
      } else {
        lavadoresNuevos.push(lavador);
      }
    }
    
    // 7. MANEJAR LAVADORES EXISTENTES
    if (lavadoresExistentes.length > 0) {
      console.log(colors.yellow + `⚠️  ${lavadoresExistentes.length} lavadores ya existen:` + colors.reset);
      lavadoresExistentes.forEach(l => {
        console.log(`   ${colors.cyan}${l.codigo}${colors.reset} - ${l.nombre}`);
      });
      
      const usarForce = process.argv.includes('--force');
      let respuesta = 'N';
      
      if (!usarForce) {
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        respuesta = await new Promise((resolve) => {
          readline.question(colors.yellow + '¿Desea actualizarlos? (S/N): ' + colors.reset, (resp) => {
            readline.close();
            resolve(resp);
          });
        });
      }
      
      if (usarForce || respuesta.toUpperCase() === 'S') {
        console.log(colors.yellow + '🔄 Actualizando lavadores existentes...' + colors.reset);
        
        for (const lavador of lavadoresExistentes) {
          await User.updateOne(
            { codigo: lavador.codigo },
            {
              $set: {
                nombre: lavador.nombre,
                rol: lavador.rol,
                punto_id: lavador.punto_id,
                activo: lavador.activo,
                telefono: lavador.telefono,
                direccion: lavador.direccion
              }
            }
          );
          console.log(colors.green + `   ✅ ${lavador.codigo} actualizado` + colors.reset);
        }
      } else {
        console.log(colors.yellow + '⏭️  Saltando lavadores existentes' + colors.reset);
      }
    }
    
    // 8. CREAR NUEVOS LAVADORES
    if (lavadoresNuevos.length > 0) {
      console.log(colors.yellow + `➕ Creando ${lavadoresNuevos.length} nuevos lavadores...` + colors.reset);
      
      for (const lavador of lavadoresNuevos) {
        // Crear hash de contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(lavador.password, salt);
        
        const nuevoLavador = new User({
          codigo: lavador.codigo,
          nombre: lavador.nombre,
          password: hashedPassword,
          email: lavador.email,
          rol: lavador.rol,
          punto_id: lavador.punto_id,
          activo: lavador.activo,
          telefono: lavador.telefono,
          direccion: lavador.direccion,
          permisos: {
            crear_ordenes: true,
            registrar_clientes: false,
            ver_reportes: false,
            gestionar_usuarios: false
          },
          estadisticas: {
            ordenes_hoy: 0,
            ordenes_mes: 0,
            total_ordenes: 0,
            total_ingresos: 0
          },
          fecha_registro: new Date()
        });
        
        await nuevoLavador.save();
        console.log(colors.green + `   ✅ ${lavador.codigo} creado exitosamente` + colors.reset);
      }
    }
    
    // 9. MOSTRAR RESUMEN
    console.log('\n' + colors.bright + colors.green + '🎉 ¡LAVADORES CREADOS EXITOSAMENTE!' + colors.reset);
    console.log('='.repeat(70));
    
    // Contar lavadores totales
    const totalLavadores = await User.countDocuments({ rol: 'lavador' });
    const lavadoresActivos = await User.find({ rol: 'lavador' }).select('codigo nombre activo');
    
    console.log(colors.cyan + '📋 RESUMEN DE LAVADORES:' + colors.reset);
    console.log(colors.cyan + `   Total en sistema: ${totalLavadores}` + colors.reset);
    
    lavadoresActivos.forEach(lav => {
      const estado = lav.activo ? colors.green + 'ACTIVO' : colors.red + 'INACTIVO';
      console.log(`   ${colors.bright}${lav.codigo}${colors.reset} - ${lav.nombre} (${estado}${colors.reset})`);
    });
    
    console.log('\n' + colors.cyan + '🔑 CREDENCIALES POR DEFECTO:' + colors.reset);
    console.log(colors.bright + '   Usuario: LAV_001, LAV_002, LAV_003' + colors.reset);
    console.log(colors.bright + '   Contraseña: lavador123' + colors.reset);
    
    console.log('\n' + colors.yellow + '⚠️  RECOMENDACIONES:' + colors.reset);
    console.log('   1. Los lavadores deben cambiar su contraseña en el primer login');
    console.log('   2. Puedes modificar permisos en la sección de usuarios');
    console.log('   3. Usa --force para actualizar sin preguntar');
    
    // 10. VERIFICAR QUE SE PUEDEN USAR
    console.log('\n' + colors.yellow + '🧪 Verificando que los lavadores están listos...' + colors.reset);
    
    for (const lavador of lavadores) {
      const user = await User.findOne({ codigo: lavador.codigo });
      if (user) {
        const passwordMatch = await bcrypt.compare(lavador.password, user.password);
        console.log(passwordMatch ? 
          colors.green + `   ✅ ${lavador.codigo}: Contraseña válida` + colors.reset :
          colors.red + `   ❌ ${lavador.codigo}: Error en contraseña` + colors.reset
        );
      }
    }
    
    // 11. CONTAR USUARIOS TOTALES
    const userCount = await User.countDocuments();
    console.log(colors.cyan + `\n📊 Total de usuarios en el sistema: ${userCount}` + colors.reset);
    
    // 12. DESCONECTAR
    await mongoose.disconnect();
    console.log('\n' + colors.green + '✅ Desconectado de MongoDB' + colors.reset);
    console.log(colors.bright + colors.green + '✨ Script completado exitosamente!' + colors.reset);
    
  } catch (error) {
    console.error(colors.red + '\n❌ ERROR CRÍTICO:' + colors.reset);
    console.error(colors.red + `   ${error.message}` + colors.reset);
    
    if (error.code === 11000) {
      console.error(colors.yellow + '   💡 Posible causa: Código de usuario duplicado' + colors.reset);
    }
    
    if (connection) {
      await mongoose.disconnect();
    }
    
    process.exit(1);
  }
}

// Ejecutar el script
createLavadores();