// backend/create-punto.js
const mongoose = require('mongoose');
require('dotenv').config();

async function crearPuntoYAsignar() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fullwash360');
    console.log('✅ Conectado a MongoDB');

    const Punto = require('./src/models/Punto');
    const Usuario = require('./src/models/Usuario');

    // 1. Verificar si ya existen puntos
    const puntosExistentes = await Punto.find();
    
    if (puntosExistentes.length === 0) {
      // Crear punto principal
      const puntoPrincipal = new Punto({
        nombre: "Lavadero Central",
        direccion: "Av. Principal 123, Ciudad",
        telefono: "3001234567",
        email: "central@fullwash360.com",
        activo: true,
        configuracion: {
          tarifas: {
            auto: {
              express: 15000,
              elite: 25000,
              premium: 35000
            },
            moto: {
              express: 10000,
              elite: 15000,
              premium: 20000
            },
            taxi: {
              express: 15000
            }
          },
          lavados_para_gratis: 10,
          comision_lavador_porcentaje: 40
        }
      });

      await puntoPrincipal.save();
      console.log(`✅ Punto creado: ${puntoPrincipal.nombre} (ID: ${puntoPrincipal._id})`);
    } else {
      console.log('✅ Puntos existentes:');
      puntosExistentes.forEach(p => {
        console.log(`   - ${p.nombre} (ID: ${p._id})`);
      });
    }

    // 2. Asignar punto a usuarios sin punto
    const usuariosSinPunto = await Usuario.find({ punto_id: { $exists: false } });
    
    if (usuariosSinPunto.length > 0) {
      const punto = puntosExistentes[0] || await Punto.findOne();
      
      if (!punto) {
        console.error('❌ No hay puntos disponibles para asignar');
        return;
      }

      await Usuario.updateMany(
        { punto_id: { $exists: false } },
        { $set: { punto_id: punto._id } }
      );
      
      console.log(`✅ Punto asignado a ${usuariosSinPunto.length} usuarios`);
      console.log(`   Punto asignado: ${punto.nombre}`);
    } else {
      console.log('✅ Todos los usuarios ya tienen punto asignado');
    }

    // 3. Verificar
    const usuarios = await Usuario.find({}, 'codigo nombre rol punto_id activo').populate('punto_id', 'nombre');
    console.log('\n📊 Usuarios finales:');
    usuarios.forEach(u => {
      console.log(`   - ${u.codigo} (${u.nombre}): ${u.rol}, Punto: ${u.punto_id ? u.punto_id.nombre : 'Ninguno'}`);
    });

    console.log('\n🎉 Proceso completado!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

crearPuntoYAsignar();