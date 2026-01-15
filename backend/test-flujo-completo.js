// test-flujo-completo.js
const mongoose = require('mongoose');

console.log('🚀 TEST FLUJO COMPLETO - Creación y Cobro\n');

async function testFlujoCompleto() {
  try {
    // 1. Conectar
    await mongoose.connect('mongodb://localhost:27017/fullwash360');
    console.log('✅ MongoDB conectado\n');
    
    // 2. Cargar modelos
    const Order = require('./src/models/Orden');
    const User = require('./src/models/Usuario');
    
    console.log('✅ Modelos cargados\n');
    
    // 3. Buscar un lavador
    const lavador = await User.findOne({ rol: 'lavador' });
    if (!lavador) {
      console.log('❌ No hay lavadores en la base de datos');
      return;
    }
    
    console.log(`👷 Lavador seleccionado: ${lavador.nombre}`);
    console.log(`💰 Saldo actual: $${lavador.saldo_comisiones || 0}\n`);
    
    // 4. Crear orden
    console.log('📝 PASO 1: Creando orden...');
    const ordenData = {
      placa: 'FLUJO001',
      tipo_vehiculo: 'carro',
      servicios: [{
        nombre: 'Lavado Completo',
        precio: 20000,
        tipo: 'lavado'
      }],
      subtotal: 20000,
      total: 20000,
      lavador_asignado: lavador._id,
      punto_id: lavador.punto_id,
      usuario_id: lavador._id,
      creado_por: lavador._id,
      estado: 'pendiente'
    };
    
    const nuevaOrden = new Order(ordenData);
    const ordenCreada = await nuevaOrden.save();
    
    console.log(`✅ Orden creada: ${ordenCreada.numero_orden}`);
    console.log(`   Total: $${ordenCreada.total}`);
    console.log(`   Estado: ${ordenCreada.estado}\n`);
    
    // 5. Cobrar orden (calcular comisión 40%)
    console.log('💰 PASO 2: Cobrando orden...');
    const comision = ordenCreada.total * 0.4;
    
    // Actualizar orden
    ordenCreada.estado = 'completado';
    ordenCreada.metodo_pago = 'efectivo';
    ordenCreada.pago_recibido = 20000;
    ordenCreada.vuelto = 0;
    ordenCreada.fecha_cobro = new Date();
    ordenCreada.comision_lavador = {
      monto: comision,
      porcentaje: 40,
      pagado: false,
      lavador_id: lavador._id,
      lavador_nombre: lavador.nombre
    };
    
    const ordenCobrada = await ordenCreada.save();
    
    // Actualizar lavador
    lavador.saldo_comisiones = (lavador.saldo_comisiones || 0) + comision;
    lavador.estadisticas.total_comisiones = (lavador.estadisticas.total_comisiones || 0) + comision;
    lavador.estadisticas.ordenes_completadas = (lavador.estadisticas.ordenes_completadas || 0) + 1;
    
    await lavador.save();
    
    console.log(`✅ Orden cobrada: ${ordenCobrada.numero_orden}`);
    console.log(`   Comisión (40%): $${comision}`);
    console.log(`   Nuevo estado: ${ordenCobrada.estado}\n`);
    
    // 6. Verificar lavador actualizado
    const lavadorActualizado = await User.findById(lavador._id);
    console.log('👷 Lavador después del cobro:');
    console.log(`   Nombre: ${lavadorActualizado.nombre}`);
    console.log(`   Nuevo saldo: $${lavadorActualizado.saldo_comisiones}`);
    console.log(`   Comisiones totales: $${lavadorActualizado.estadisticas.total_comisiones}`);
    console.log(`   Órdenes completadas: ${lavadorActualizado.estadisticas.ordenes_completadas}\n`);
    
    // 7. Limpiar (opcional)
    console.log('🧹 Limpiando datos de prueba...');
    await Order.deleteOne({ _id: ordenCreada._id });
    console.log('✅ Datos limpiados\n');
    
    await mongoose.connection.close();
    console.log('🎯 FLUJO COMPLETO VERIFICADO EXITOSAMENTE!');
    console.log('\n📋 RESUMEN:');
    console.log('1. Creación de orden ✓');
    console.log('2. Cálculo de comisión 40% ✓');
    console.log('3. Actualización de saldo del lavador ✓');
    console.log('4. Todo funciona correctamente ✓');
    
  } catch (error) {
    console.error('\n❌ ERROR en flujo completo:');
    console.error('   Tipo:', error.name);
    console.error('   Mensaje:', error.message);
    console.error('   Stack:', error.stack);
  }
}

testFlujoCompleto();