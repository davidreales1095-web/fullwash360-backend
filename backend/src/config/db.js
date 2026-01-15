const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);
    console.log(`📊 Base de datos: ${conn.connection.name}`);
    
    // Verificar conexión
    mongoose.connection.on('error', err => {
      console.error(`❌ Error de MongoDB: ${err.message}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB desconectado');
    });
    
  } catch (error) {
    console.error(`❌ Error de conexión a MongoDB: ${error.message}`);
    console.log('🔧 Verifica:');
    console.log('1. Tu conexión a internet');
    console.log('2. La cadena de conexión en .env');
    console.log('3. Los permisos del usuario en MongoDB Atlas');
    process.exit(1);
  }
};

module.exports = connectDB;