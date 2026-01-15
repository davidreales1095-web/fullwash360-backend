// backend/createLavadores.js - SCRIPT FUNCIONAL PARA CREAR LAVADORES
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
  try {
    // 1. CONECTAR A MONGODB - USANDO LA MISMA CONFIGURACIÓN QUE TU SERVIDOR
    console.log(colors.yellow + '🔗 Conectando a MongoDB...' + colors.reset);
    
    // Tu servidor usa esta URI según el log:
    // mongodb+srv://davidreales1095_db_user:****@cluster0.ynoxu7j.mongodb.net/fullwash360?retryWrites=true&w=majority&appName=Cluster0
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://davidreales1095_db_user:@cluster0.ynoxu7j.mongodb.net/fullwash360?retryWrites=true&w=majority&appName=Cluster0';
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(colors.green + '✅ MongoDB conectado exitosamente' + colors.reset);
    console.log(colors.cyan + '📊 Base de datos: fullwash360' + colors.reset);
    
    // 2. CARGAR MODELOS DESDE LA MISMA RUTA QUE TU SERVIDOR
    console.log(colors.yellow + '📁 Cargando modelos...' + colors.reset);
    
    const User = require('./src/models/Usuario');
    const Punto = require('./src/models/Punto');
    
    console.log(colors.green + '✅ Modelos cargados correctamente' + colors.reset);
    
    // 3. VERIFICAR QUE EL PUNTO "Sede Principal" EXISTA
    console.log(colors.yellow + '📍 Buscando punto "Sede Principal"...' + colors.reset);
    
    let puntoLavado = await Punto.findOne({ nombre: 'Sede Principal' });
    
    if (!puntoLavado) {
      console.log(colors.yellow + '➕ Creando punto "Sede Principal"...' + colors.reset);
      
      puntoLavado = new Punto({
        nombre: 'Sede Principal',
        direccion: 'Av. Principal #123',
        telefono: '555-1234',
        estado: 'activo',
        horario_apertura: '08:00',
        horario_cierre: '20:00'
      });
      
      await puntoLavado.save();
      console.log(colors.green + `✅ Punto creado: ${puntoLavado.nombre}` + colors.reset);
    } else {
      console.log(colors.green + `✅ Punto encontrado: ${puntoLavado.nombre}` + colors.reset);
    }
    
    // 4. DEFINIR LOS 3 LAVADORES
    const lavadores = [
      {
        codigo: 'LAV_001',
        nombre: 'Carlos Rodríguez',
        password: 'lavador123',
        email: 'lavador1@fullwash360.com',
        rol: 'lavador',
        punto_id: puntoLavado._id,
        telefono: '555-1001',
        direccion: 'Calle 123 #45-67',
        activo: true
      },
      {
        codigo: 'LAV_002',
        nombre: 'María González',
        password: 'lavador123',
        email: 'lavador2@fullwash360.com',
        rol: 'lavador',
        punto_id: puntoLavado._id,
        telefono: '555-1002',
        direccion: 'Carrera 89 #10-20',
        activo: true
      },
      {
        codigo: 'LAV_003',
        nombre: 'Pedro Sánchez',
        password: 'lavador123',
        email: 'lavador3@fullwash360.com',
        rol: 'lavador',
        punto_id: puntoLavado._id,
        telefono: '555-1003',
        direccion: 'Avenida 5 #30-40',
        activo: true
      }
    ];
    
    console.log(colors.yellow + `👷 Creando ${lavadores.length} lavadores...` + colors.reset);
    
    let creados = 0;
    let actualizados = 0;
    
    // 5. CREAR O ACTUALIZAR CADA LAVADOR
    for (const lavador of lavadores) {
      try {
        // Verificar si ya existe
        const existe = await User.findOne({ codigo: lavador.codigo });
        
        if (existe) {
          console.log(colors.yellow + `   ⚠️  ${lavador.codigo} ya existe, actualizando...` + colors.reset);
          
          // Actualizar datos del lavador
          existe.nombre = lavador.nombre;
          existe.email = lavador.email;
          existe.rol = lavador.rol;
          existe.punto_id = lavador.punto_id;
          existe.telefono = lavador.telefono;
          existe.direccion = lavador.direccion;
          existe.activo = lavador.activo;
          
          // Si la contraseña no está encriptada, encriptarla
          if (!existe.password.startsWith('$2a$')) {
            const salt = await bcrypt.genSalt(10);
            existe.password = await bcrypt.hash(lavador.password, salt);
          }
          
          await existe.save();
          actualizados++;
          console.log(colors.green + `   ✅ ${lavador.codigo} actualizado` + colors.reset);
        } else {
          console.log(colors.cyan + `   ➕ ${lavador.codigo} no existe, creando...` + colors.reset);
          
          // Encriptar contraseña
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(lavador.password, salt);
          
          // Crear nuevo lavador
          const nuevoLavador = new User({
            codigo: lavador.codigo,
            nombre: lavador.nombre,
            password: hashedPassword,
            email: lavador.email,
            rol: lavador.rol,
            punto_id: lavador.punto_id,
            telefono: lavador.telefono,
            direccion: lavador.direccion,
            activo: lavador.activo,
            estado: 'activo',
            permisos: {
              crear_ordenes: true,
              registrar_clientes: false,
              ver_reportes: false,
              gestionar_usuarios: false
            },
            fecha_registro: new Date()
          });
          
          await nuevoLavador.save();
          creados++;
          console.log(colors.green + `   ✅ ${lavador.codigo} creado exitosamente` + colors.reset);
        }
      } catch (error) {
        console.error(colors.red + `   ❌ Error con ${lavador.codigo}: ${error.message}` + colors.reset);
      }
    }
    
    // 6. MOSTRAR RESUMEN
    console.log('\n' + colors.bright + colors.green + '🎉 ¡PROCESO COMPLETADO!' + colors.reset);
    console.log('='.repeat(70));
    
    console.log(colors.cyan + '📊 RESUMEN:' + colors.reset);
    console.log(`   Lavadores creados: ${colors.green}${creados}${colors.reset}`);
    console.log(`   Lavadores actualizados: ${colors.yellow}${actualizados}${colors.reset}`);
    console.log(`   Total procesados: ${colors.cyan}${creados + actualizados}${colors.reset}`);
    
    // 7. MOSTRAR LISTA COMPLETA DE LAVADORES
    console.log('\n' + colors.cyan + '📋 LISTA DE LAVADORES EN EL SISTEMA:' + colors.reset);
    
    const todosLavadores = await User.find({ rol: 'lavador' }).select('codigo nombre rol activo punto_id');
    
    if (todosLavadores.length === 0) {
      console.log(colors.yellow + '   No hay lavadores en el sistema' + colors.reset);
    } else {
      todosLavadores.forEach((lav, index) => {
        const estado = lav.activo ? colors.green + 'ACTIVO' : colors.red + 'INACTIVO';
        console.log(`   ${index + 1}. ${colors.bright}${lav.codigo}${colors.reset} - ${lav.nombre} (${estado}${colors.reset})`);
      });
    }
    
    // 8. MOSTRAR CREDENCIALES
    console.log('\n' + colors.cyan + '🔑 CREDENCIALES POR DEFECTO:' + colors.reset);
    console.log(colors.bright + '   Usuario: LAV_001, LAV_002, LAV_003' + colors.reset);
    console.log(colors.bright + '   Contraseña: lavador123' + colors.reset);
    
    console.log('\n' + colors.yellow + '⚠️  NOTA IMPORTANTE:' + colors.reset);
    console.log('   - Los lavadores ya están listos para asignar en nuevas órdenes');
    console.log('   - Puedes cambiar las contraseñas desde el panel de administración');
    console.log('   - Si necesitas más lavadores, modifica este script y vuelve a ejecutar');
    
    // 9. VERIFICAR CONEXIÓN CON BACKEND
    console.log('\n' + colors.yellow + '🔗 INTEGRACIÓN CON BACKEND:' + colors.reset);
    
    // Verificar que el enum del modelo incluya "lavador"
    const usuarioSchema = User.schema;
    const rolPath = usuarioSchema.path('rol');
    
    if (rolPath && rolPath.enumValues) {
      const tieneLavador = rolPath.enumValues.includes('lavador');
      console.log(tieneLavador ?
        colors.green + '   ✅ El modelo Usuario soporta rol "lavador"' + colors.reset :
        colors.red + '   ❌ ERROR: El modelo Usuario NO tiene rol "lavador" en el enum' + colors.reset
      );
      
      if (!tieneLavador) {
        console.log(colors.red + '   💡 Debes modificar src/models/Usuario.js y agregar "lavador" al enum' + colors.reset);
      }
    }
    
    // 10. CONTAR TOTAL DE USUARIOS
    const totalUsuarios = await User.countDocuments();
    const totalLavadores = await User.countDocuments({ rol: 'lavador' });
    
    console.log('\n' + colors.cyan + '📈 ESTADÍSTICAS DEL SISTEMA:' + colors.reset);
    console.log(`   Total usuarios: ${totalUsuarios}`);
    console.log(`   Total lavadores: ${totalLavadores}`);
    console.log(`   Otros roles: ${totalUsuarios - totalLavadores}`);
    
    // 11. DESCONECTAR
    await mongoose.disconnect();
    console.log('\n' + colors.green + '✅ Desconectado de MongoDB' + colors.reset);
    console.log(colors.bright + colors.green + '✨ Script ejecutado exitosamente!' + colors.reset);
    
  } catch (error) {
    console.error(colors.red + '\n❌ ERROR CRÍTICO:' + colors.reset);
    console.error(colors.red + `   ${error.message}` + colors.reset);
    
    if (error.code === 11000) {
      console.error(colors.yellow + '   💡 Ya existe un usuario con ese código' + colors.reset);
    }
    
    if (error.name === 'MongooseError') {
      console.error(colors.yellow + '   💡 Error de conexión con MongoDB' + colors.reset);
      console.error(colors.yellow + '   💡 Verifica tu URI de conexión en .env' + colors.reset);
    }
    
    process.exit(1);
  }
}

// Ejecutar el script
createLavadores();