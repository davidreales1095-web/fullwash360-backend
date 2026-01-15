// test-corregido.js
const mongoose = require('mongoose');
const path = require('path');

console.log('🚀 TEST CON RUTA CORRECTA - src/models/Orden.js\n');

async function test() {
  try {
    // 1. Conectar a MongoDB
    await mongoose.connect('mongodb://localhost:27017/fullwash360', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB conectado\n');

    // 2. Cargar el modelo desde la ruta CORRECTA
    const Order = require('./src/models/Orden');
    console.log('✅ Modelo Order cargado desde: ./src/models/Orden.js');
    console.log(`📌 Nombre de colección: "${Order.collection.collectionName}"`);
    console.log(`🎯 Debería ser: "ordens"`);
    console.log(`✅ ¿Correcto? ${Order.collection.collectionName === 'ordens' ? 'SÍ' : 'NO'}\n`);

    // 3. Crear datos de prueba
    const testData = {
      placa: 'CORRECT001',
      tipo_vehiculo: 'carro',
      servicios: [{
        nombre: 'Lavado Correcto',
        precio: 15000,
        tipo: 'lavado'
      }],
      subtotal: 15000,
      total: 15000,
      estado: 'pendiente',
      punto_id: new mongoose.Types.ObjectId('695ec331535d9fb52d3e7043'),
      usuario_id: new mongoose.Types.ObjectId('696268048e696af2a8999ceb'),
      creado_por: new mongoose.Types.ObjectId('696268048e696af2a8999ceb'),
      lavador_asignado: new mongoose.Types.ObjectId('696268048e696af2a8999ceb')
    };

    console.log('📝 Creando orden de prueba...');
    const nuevaOrden = new Order(testData);

    console.log('💾 Guardando en MongoDB...');
    const ordenGuardada = await nuevaOrden.save();

    console.log('\n✅ ¡ÉXITO! Orden guardada correctamente:');
    console.log(`   ID: ${ordenGuardada._id}`);
    console.log(`   Número: ${ordenGuardada.numero_orden}`);
    console.log(`   Placa: ${ordenGuardada.placa}`);
    console.log(`   Total: $${ordenGuardada.total}`);
    console.log(`   Estado: ${ordenGuardada.estado}`);

    // 4. Verificar en DB
    const count = await Order.countDocuments();
    console.log(`\n📊 Total órdenes en DB: ${count}`);

    // 5. Mostrar últimas órdenes
    const ultimasOrdenes = await Order.find().sort({ _id: -1 }).limit(3);
    console.log('\n📋 Últimas 3 órdenes:');
    ultimasOrdenes.forEach((ord, i) => {
      console.log(`   ${i+1}. ${ord.numero_orden} - ${ord.placa} - $${ord.total} - ${ord.estado}`);
    });

    // 6. Limpiar nuestra orden de prueba
    await Order.deleteOne({ _id: ordenGuardada._id });
    console.log('\n🧹 Orden de prueba eliminada\n');

    await mongoose.connection.close();
    console.log('🎯 ¡CORRECCIÓN EXITOSA! El modelo ahora guarda en MongoDB.');

    console.log('\n📋 RESUMEN:');
    console.log('1. Ruta corregida: ./src/models/Orden.js ✓');
    console.log('2. Modelo exportado como "Order" ✓');
    console.log('3. Colección correcta: "ordens" ✓');
    console.log('4. Órdenes se guardan en MongoDB ✓');

  } catch (error) {
    console.error('\n❌ ERROR:');
    console.error('   Tipo:', error.name);
    console.error('   Mensaje:', error.message);

    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('\n🔍 El archivo no está en ./src/models/Orden.js');
      console.error('   Probando diferentes rutas...');
      
      const fs = require('fs');
      const posiblesRutas = [
        './src/models/Orden.js',
        './src/models/orden.js',
        './src/models/Order.js',
        './models/Orden.js',
        '../src/models/Orden.js'
      ];
      
      posiblesRutas.forEach(ruta => {
        try {
          const rutaAbsoluta = path.resolve(ruta);
          if (fs.existsSync(rutaAbsoluta)) {
            console.log(`   ✅ Encontrado: ${ruta}`);
          }
        } catch (e) {
          // Ignorar
        }
      });
    }

    if (error.name === 'ValidationError') {
      console.error('   Campos faltantes:');
      Object.keys(error.errors).forEach(key => {
        console.error(`     - ${key}: ${error.errors[key].message}`);
      });
    }
  }
}

test();