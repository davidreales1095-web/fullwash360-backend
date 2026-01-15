require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');

(async () => {
  try {
    console.log('🔌 Conectando a MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Conectado');
    console.log('📊 BASE DE DATOS:', mongoose.connection.name);
    console.log('📦 COLECCIÓN:', Usuario.collection.name);

    console.log('\n👤 USUARIOS EXISTENTES:\n');

    const usuarios = await Usuario.find({}, {
      codigo: 1,
      nombre: 1,
      rol: 1,
      activo: 1,
      estado: 1
    }).lean();

    if (usuarios.length === 0) {
      console.log('⚠️ NO HAY USUARIOS EN ESTA BASE');
    } else {
      usuarios.forEach(u => {
        console.log(`- ${u.codigo} | ${u.nombre} | rol=${u.rol}`);
      });
    }

    console.log('\n🛑 ADMINISTRADORES:\n');

    const admins = usuarios.filter(u =>
      u.rol === 'admin' || u.rol === 'superadmin'
    );

    if (admins.length === 0) {
      console.log('❌ NO HAY ADMINISTRADORES');
    } else {
      admins.forEach(a => {
        console.log(`✅ ADMIN: ${a.codigo} (${a.rol})`);
      });
    }

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  }
})();
