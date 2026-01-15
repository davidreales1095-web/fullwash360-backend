// reparar-mongo.js
const mongoose = require('mongoose');

async function repararSistema() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/fullwash360');
    
    console.log('✅ Conectado. Verificando colecciones...');
    
    // 1. Verificar colección de órdenes
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log('📁 Colecciones:', collectionNames);
    
    // 2. Verificar si 'ordens' tiene documentos
    const Orden = mongoose.models.Order || mongoose.model('Order', new mongoose.Schema({}), 'ordens');
    const countOrdens = await Orden.countDocuments();
    console.log(`📊 Documentos en 'ordens': ${countOrdens}`);
    
    // 3. Crear colección 'orders' si no existe (para compatibilidad)
    if (!collectionNames.includes('orders')) {
      console.log('🆕 Creando colección orders...');
      await mongoose.connection.db.createCollection('orders');
      console.log('✅ Colección orders creada');
    }
    
    // 4. Verificar usuarios
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}), 'usuarios');
    const usuarios = await User.find({ rol: 'lavador' });
    
    console.log('\n👷 LAVADORES ENCONTRADOS:');
    usuarios.forEach(user => {
      console.log(`  ${user.codigo} - ${user.nombre}`);
      console.log(`    Saldo comisiones: ${user.saldo_comisiones || 'NO DEFINIDO'}`);
    });
    
    // 5. Crear orden de prueba
    console.log('\n🧪 Creando orden de prueba...');
    const ordenPrueba = {
      numero_orden: `TEST-${Date.now()}`,
      placa: 'TEST001',
      tipo_vehiculo: 'carro',
      servicios: [{ nombre: 'Lavado Test', precio: 10000 }],
      total: 10000,
      estado: 'pendiente',
      creado_por: usuarios[0]?._id,
      punto_id: usuarios[0]?.punto_id,
      fecha_creacion: new Date()
    };
    
    // Intentar guardar en 'ordens'
    try {
      const nuevaOrden = new Orden(ordenPrueba);
      await nuevaOrden.save();
      console.log('✅ Orden de prueba guardada en "ordens"');
    } catch (error) {
      console.log('❌ Error al guardar orden:', error.message);
    }
    
    // 6. Verificar después de guardar
    const totalOrdens = await Orden.countDocuments();
    console.log(`\n📈 Total órdenes en 'ordens': ${totalOrdens}`);
    
    await mongoose.connection.close();
    console.log('\n🎯 REPARACIÓN COMPLETADA');
    
  } catch (error) {
    console.error('❌ Error durante reparación:', error);
  }
}

repararSistema();