const mongoose = require('mongoose');
const Order = require('../models/Orden');
const User = require('../models/Usuario');
const Cliente = require('../models/Cliente');
const Vehiculo = require('../models/Vehiculo');

// ===========================
// Controladores CORREGIDOS - SISTEMA DE FIDELIZACIÓN ACTUALIZADO A 8va GRATIS
// ===========================

// ✅ FUNCIÓN AUXILIAR: Crear cliente automático
const crearClienteAutomatico = async (placa, tipo_vehiculo, punto_id, usuario_id, lavadas_iniciales = 0) => {
  try {
    console.log(`🤖 Creando cliente automático para placa: ${placa}`);
    const nuevoCliente = new Cliente({
      punto_id: new mongoose.Types.ObjectId(punto_id),
      registrado_por: new mongoose.Types.ObjectId(usuario_id),
      nombre_completo: `Cliente ${placa}`,
      telefono: '0000000000',
      placa_vehiculo: placa.toUpperCase(),
      tipo_lavado_preferido: 'express',
      lavadas_iniciales: lavadas_iniciales,
      estado: 'activo'
    });
    await nuevoCliente.save();

    const nuevoVehiculo = new Vehiculo({
      punto_id: new mongoose.Types.ObjectId(punto_id),
      cliente_id: nuevoCliente._id,
      registrado_por: new mongoose.Types.ObjectId(usuario_id),
      placa: placa.toUpperCase(),
      marca: 'NO REGISTRADA',
      modelo: 'NO REGISTRADO',
      tipo_vehiculo: tipo_vehiculo || 'carro',
      estadisticas: { 
        total_lavados: lavadas_iniciales,
        contador_actual: lavadas_iniciales,
        lavados_gratis: 0, 
        ultimo_lavado: null, 
        primer_lavado: new Date() 
      },
      estado: 'activo',
      fecha_registro: new Date()
    });
    await nuevoVehiculo.save();
    
    nuevoCliente.vehiculo_id = nuevoVehiculo._id;
    await nuevoCliente.save();
    
    console.log(`✅ Cliente automático creado: ${placa}, lavadas realizadas: ${lavadas_iniciales}`);
    return {
      cliente: nuevoCliente,
      vehiculo: nuevoVehiculo,
      contador_actual: lavadas_iniciales
    };
  } catch (error) {
    console.error('❌ Error crearClienteAutomatico:', error);
    return null;
  }
};

// ✅ FUNCIÓN AUXILIAR: Buscar o crear cliente/vehículo por placa
const obtenerContadorPorPlaca = async (placa, tipo_vehiculo, punto_id, usuario_id) => {
  try {
    console.log(`🔍 Buscando vehículo para placa: ${placa}`);
    const vehiculo = await Vehiculo.findOne({
      placa: placa.toUpperCase(),
      punto_id: new mongoose.Types.ObjectId(punto_id)
    }).populate('cliente_id');

    if (vehiculo && vehiculo.cliente_id) {
      const lavadasRealizadas = vehiculo.estadisticas.contador_actual || 0;
      const numeroProximaLavada = lavadasRealizadas + 1;
      console.log(`✅ Vehículo encontrado, lavadas realizadas: ${lavadasRealizadas}, próxima lavada: #${numeroProximaLavada}`);
      return {
        cliente_id: vehiculo.cliente_id._id,
        cliente_nombre: vehiculo.cliente_id.nombre_completo,
        cliente_telefono: vehiculo.cliente_id.telefono,
        vehiculo_id: vehiculo._id,
        lavadas_realizadas: lavadasRealizadas,
        numero_proxima_lavada: numeroProximaLavada,
        vehiculo_existente: true,
        cliente_existente: true
      };
    } else {
      console.log(`⚠️ No se encontró vehículo para placa: ${placa}, creando automáticamente...`);
      const clienteData = await crearClienteAutomatico(placa, tipo_vehiculo, punto_id, usuario_id, 0);
      if (clienteData) {
        return {
          cliente_id: clienteData.cliente._id,
          cliente_nombre: clienteData.cliente.nombre_completo,
          cliente_telefono: clienteData.cliente.telefono,
          vehiculo_id: clienteData.vehiculo._id,
          lavadas_realizadas: clienteData.contador_actual,
          numero_proxima_lavada: 1,
          vehiculo_existente: false,
          cliente_existente: false
        };
      }
    }
    return {
      cliente_id: null,
      cliente_nombre: null,
      cliente_telefono: null,
      vehiculo_id: null,
      lavadas_realizadas: 0,
      numero_proxima_lavada: 1,
      vehiculo_existente: false,
      cliente_existente: false
    };
  } catch (error) {
    console.error('❌ Error obtenerContadorPorPlaca:', error);
    return {
      cliente_id: null,
      cliente_nombre: null,
      cliente_telefono: null,
      vehiculo_id: null,
      lavadas_realizadas: 0,
      numero_proxima_lavada: 1,
      vehiculo_existente: false,
      cliente_existente: false
    };
  }
};

// ✅ CREAR ORDEN (ACTUALIZADO A 8va GRATIS)
const createOrder = async (req, res) => {
  try {
    console.log("📦 Body recibido:", req.body);
    const { 
      placa, 
      tipo_vehiculo, 
      tipo_lavado = 'express', 
      precio_manual, 
      notas_cliente = '',
      usuario_id = '000000000000000000000001',
      punto_id = '000000000000000000000002',
      cliente_id,
      vehiculo_id
    } = req.body;

    if (!placa || !tipo_vehiculo) {
      return res.status(400).json({ success: false, message: 'Placa y tipo de vehículo son obligatorios' });
    }

    const precio = Number(precio_manual);
    if (precio < 0 || isNaN(precio)) {
      return res.status(400).json({ success: false, message: 'Precio inválido' });
    }

    const tiposValidos = ['carro', 'moto', 'taxi', 'camioneta'];
    if (!tiposValidos.includes(tipo_vehiculo)) {
      return res.status(400).json({ success: false, message: `Tipo de vehículo inválido. Use: ${tiposValidos.join(', ')}` });
    }

    const tiposLavadoValidos = ['express', 'elite', 'premium'];
    if (tipo_lavado && !tiposLavadoValidos.includes(tipo_lavado)) {
      return res.status(400).json({ success: false, message: `Tipo de lavado inválido. Use: ${tiposLavadoValidos.join(', ')}` });
    }

    let datosPlaca;
    if (cliente_id && vehiculo_id) {
      const vehiculo = await Vehiculo.findById(vehiculo_id);
      const lavadasRealizadas = vehiculo ? vehiculo.estadisticas.contador_actual : 0;
      datosPlaca = {
        cliente_id: cliente_id,
        vehiculo_id: vehiculo_id,
        lavadas_realizadas: lavadasRealizadas,
        numero_proxima_lavada: lavadasRealizadas + 1,
        vehiculo_existente: true,
        cliente_existente: true
      };
    } else {
      datosPlaca = await obtenerContadorPorPlaca(placa, tipo_vehiculo, punto_id, usuario_id);
    }

    const numeroLavadaActual = datosPlaca.numero_proxima_lavada;
    // ✅ Cambiado de 10 → 8
    const esOctavaGratis = (numeroLavadaActual === 8);
    const precioFinal = esOctavaGratis ? 0 : precio;

    if (esOctavaGratis) {
      console.log(`🎉 ¡${numeroLavadaActual}va LAVADA GRATIS para placa ${placa.toUpperCase()}!`);
    }

    const orden = new Order({
      punto_id: new mongoose.Types.ObjectId(punto_id),
      usuario_id: new mongoose.Types.ObjectId(usuario_id),
      creado_por: new mongoose.Types.ObjectId(usuario_id),
      cliente_id: datosPlaca.cliente_id,
      vehiculo_id: datosPlaca.vehiculo_id,
      placa: placa.toUpperCase(),
      tipo_vehiculo: tipo_vehiculo,
      servicios: [{
        nombre: `Lavado ${tipo_lavado}`,
        tipo: 'lavado',
        tipo_lavado: tipo_lavado,
        precio: precio,
        duracion_minutos: 30
      }],
      subtotal: precioFinal,
      total: precioFinal,
      metodo_pago: 'efectivo',
      pago_recibido: 0,
      vuelto: 0,
      fecha_cobro: null,
      lavador_asignado: null,
      comision_lavador: {
        lavador_id: null,
        lavador_nombre: '',
        monto: 0,
        porcentaje: 40,
        pagado: false,
        fecha_pago: null
      },
      contador_lavada: numeroLavadaActual,
      es_decima_gratis: esOctavaGratis,   // Mantenemos el nombre del campo
      total_lavadas_meta: 8,              // ✅ Cambiado de 10 → 8
      notas_cliente: notas_cliente,
      impreso: false,
      estado: 'activa',
      cliente_nombre: datosPlaca.cliente_nombre || `Cliente ${placa}`,
      cliente_telefono: datosPlaca.cliente_telefono || '0000000000'
    });

    await orden.save();

    console.log("✅ Orden creada exitosamente:", {
      numero: orden.numero_orden,
      placa: orden.placa,
      cliente: orden.cliente_nombre,
      lavada_numero: orden.contador_lavada,
      es_gratis: orden.es_decima_gratis,
      total: orden.total
    });

    res.status(201).json({ 
      success: true, 
      message: 'Orden creada exitosamente',
      orden: {
        _id: orden._id,
        numero_orden: orden.numero_orden,
        placa: orden.placa,
        tipo_vehiculo: orden.tipo_vehiculo,
        servicios: orden.servicios,
        total: orden.total,
        estado: orden.estado,
        fecha_creacion: orden.fecha_creacion,
        contador_lavada: orden.contador_lavada,
        es_decima_gratis: orden.es_decima_gratis,
        cliente_id: orden.cliente_id,
        vehiculo_id: orden.vehiculo_id,
        cliente_nombre: orden.cliente_nombre,
        cliente_telefono: orden.cliente_telefono
      }
    });

  } catch (error) {
    console.error("❌ Error en createOrder:", error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: 'Error de validación', errors });
    }
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Error: número de orden duplicado' });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ COBRAR ORDEN (ACTUALIZADO A 8va GRATIS)
const cobrarOrden = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      metodo_pago = 'efectivo', 
      pago_recibido = 0, 
      lavador_asignado,
      lavador_nombre = 'Lavador'
    } = req.body;

    console.log("📦 Datos de cobro recibidos:", req.body);

    if (!lavador_asignado) {
      return res.status(400).json({ success: false, message: 'Debe seleccionar un lavador' });
    }

    const orden = await Order.findById(id);
    if (!orden) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    }
    if (orden.estado !== 'activa') {
      return res.status(400).json({ success: false, message: `La orden ya está ${orden.estado}` });
    }

    // ✅ PASO 1: INCREMENTAR CONTADOR EN VEHÍCULO
    let nuevoContadorVehiculo = 0;
    let vehiculoActualizado = null;
    
    if (orden.vehiculo_id) {
      try {
        const vehiculo = await Vehiculo.findById(orden.vehiculo_id);
        if (vehiculo) {
          nuevoContadorVehiculo = vehiculo.estadisticas.contador_actual + 1;
          
          // ✅ Cambiado de 10 → 8
          if (nuevoContadorVehiculo >= 8) {
            nuevoContadorVehiculo = 0;
          }
          
          vehiculo.estadisticas.contador_actual = nuevoContadorVehiculo;
          vehiculo.estadisticas.total_lavados += 1;
          vehiculo.estadisticas.ultimo_lavado = new Date();
          
          if (orden.es_decima_gratis) {
            vehiculo.estadisticas.lavados_gratis += 1;
          }
          
          await vehiculo.save();
          vehiculoActualizado = vehiculo;
          
          console.log(`✅ Contador actualizado en vehículo: ${vehiculo.estadisticas.contador_actual - 1} → ${nuevoContadorVehiculo} lavadas realizadas`);
        }
      } catch (error) {
        console.error('❌ Error actualizando vehículo:', error);
      }
    }

    // ✅ PASO 2: CALCULAR COMISIÓN
    const comision = orden.es_decima_gratis ? 0 : Math.round(orden.total * 0.4);

    let saldoLavadorActualizado = 0;
    let nombreLavador = lavador_nombre;
    
    try {
      const lavador = await User.findById(lavador_asignado);
      if (lavador) {
        const comisionAgregada = await lavador.sumarComision(comision);
        if (comisionAgregada) {
          const lavadorActualizado = await User.findById(lavador_asignado);
          saldoLavadorActualizado = lavadorActualizado.saldo_comisiones || 0;
          nombreLavador = lavadorActualizado.nombre;
        }
      }
    } catch (error) {
      console.error('❌ Error al actualizar saldo del lavador:', error);
    }

    // ✅ PASO 3: ACTUALIZAR ORDEN
    orden.estado = 'completada';
    orden.lavador_asignado = lavador_asignado;
    orden.comision_lavador = {
      lavador_id: lavador_asignado,
      lavador_nombre: nombreLavador,
      monto: comision,
      porcentaje: 40,
      pagado: false,
      fecha_pago: null
    };
    orden.metodo_pago = metodo_pago;
    orden.pago_recibido = Number(pago_recibido);
    orden.vuelto = Math.max(0, orden.pago_recibido - orden.total);
    orden.fecha_cobro = new Date();
    orden.fecha_salida_real = new Date();
    orden.impreso = true;
    
    await orden.save();

    console.log("✅ Orden cobrada:", {
      numero: orden.numero_orden,
      placa: orden.placa,
      lavada_numero: orden.contador_lavada,
      es_gratis: orden.es_decima_gratis,
      comision: comision,
      lavadas_realizadas_vehiculo: nuevoContadorVehiculo
    });

    res.json({ 
      success: true, 
      message: 'Orden cobrada exitosamente',
      orden: {
        _id: orden._id,
        numero_orden: orden.numero_orden,
        total: orden.total,
        vuelto: orden.vuelto,
        comision_lavador: orden.comision_lavador.monto,
        contador_lavada: orden.contador_lavada,
        es_decima_gratis: orden.es_decima_gratis
      },
      comision_detalle: {
        monto: comision,
        porcentaje: 40,
        lavador_nombre: nombreLavador,
        lavador_id: lavador_asignado,
        saldo_actualizado: saldoLavadorActualizado
      },
      vehiculo_actualizado: vehiculoActualizado ? {
        lavadas_realizadas: vehiculoActualizado.estadisticas.contador_actual,
        proxima_lavada: vehiculoActualizado.estadisticas.contador_actual + 1,
        total_lavados: vehiculoActualizado.estadisticas.total_lavados,
        lavados_gratis: vehiculoActualizado.estadisticas.lavados_gratis
      } : null
    });

  } catch (error) {
    console.error('❌ Error en cobrarOrden:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al cobrar la orden',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ OBTENER ÓRDENES ACTIVAS
const getOrdenesActivas = async (req, res) => {
  try {
    const puntoId = req.query.punto_id || '000000000000000000000002';
    const ordenes = await Order.find({ 
      punto_id: new mongoose.Types.ObjectId(puntoId),
      estado: 'activa',
      lavador_asignado: null
    })
    .sort({ fecha_creacion: -1 })
    .lean();

    res.json({ 
      success: true, 
      ordenes: ordenes.map(orden => ({
        ...orden,
        servicios_str: orden.servicios.map(s => s.nombre).join(', ')
      })),
      total: ordenes.length
    });
  } catch (error) {
    console.error('Error en getOrdenesActivas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener órdenes activas' });
  }
};

// ✅ OBTENER HISTORIAL DE ÓRDENES
const getHistorialOrdenes = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, lavador_id, page = 1, limit = 50 } = req.query;
    const filtro = { estado: 'completada' };
    
    if (fechaInicio || fechaFin) {
      filtro.fecha_cobro = {};
      if (fechaInicio) filtro.fecha_cobro.$gte = new Date(fechaInicio);
      if (fechaFin) {
        const finDate = new Date(fechaFin);
        finDate.setHours(23, 59, 59, 999);
        filtro.fecha_cobro.$lte = finDate;
      }
    }
    if (lavador_id) filtro.lavador_asignado = lavador_id;
    
    const skip = (page - 1) * limit;
    const ordenes = await Order.find(filtro)
      .sort({ fecha_cobro: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    const total = await Order.countDocuments(filtro);
    const totalVentas = ordenes.reduce((sum, orden) => sum + orden.total, 0);
    const totalComisiones = ordenes.reduce((sum, orden) => sum + (orden.comision_lavador?.monto || 0), 0);
    
    res.json({ 
      success: true, 
      ordenes,
      total,
      totalVentas,
      totalComisiones,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error en getHistorialOrdenes:', error);
    res.status(500).json({ success: false, message: 'Error al obtener historial de órdenes' });
  }
};

// ✅ OBTENER ESTADÍSTICAS DE COMISIONES
const getEstadisticasComisiones = async (req, res) => {
  try {
    const { lavador_id } = req.params;
    const lavador = await User.findById(lavador_id);
    if (!lavador || lavador.rol !== 'lavador') {
      return res.status(404).json({ success: false, message: 'Lavador no encontrado' });
    }
    const ordenes = await Order.find({ 
      lavador_asignado: lavador_id,
      estado: 'completada'
    })
    .sort({ fecha_cobro: -1 })
    .lean();
    
    const totalOrdenes = ordenes.length;
    const totalVentas = ordenes.reduce((sum, orden) => sum + orden.total, 0);
    const totalComisiones = ordenes.reduce((sum, orden) => sum + (orden.comision_lavador?.monto || 0), 0);
    
    const comisionesPorMes = {};
    ordenes.forEach(orden => {
      if (orden.fecha_cobro) {
        const mes = orden.fecha_cobro.toISOString().substring(0, 7);
        if (!comisionesPorMes[mes]) comisionesPorMes[mes] = 0;
        comisionesPorMes[mes] += orden.comision_lavador?.monto || 0;
      }
    });
    
    res.json({ 
      success: true,
      lavador: {
        _id: lavador._id,
        nombre: lavador.nombre,
        codigo: lavador.codigo,
        saldo_comisiones: lavador.saldo_comisiones || 0,
        porcentaje_comision: lavador.porcentaje_comision || 40
      },
      estadisticas: {
        totalOrdenes,
        totalVentas,
        totalComisiones,
        promedioComisionPorOrden: totalOrdenes > 0 ? totalComisiones / totalOrdenes : 0,
        comisionesPorMes: Object.entries(comisionesPorMes).map(([mes, monto]) => ({ mes, monto }))
      },
      ultimasOrdenes: ordenes.slice(0, 10)
    });
  } catch (error) {
    console.error('Error en getEstadisticasComisiones:', error);
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas de comisiones' });
  }
};

// ✅ OBTENER TODAS LAS ÓRDENES (DEBUG)
const getTodasOrdenes = async (req, res) => {
  try {
    const ordenes = await Order.find({}).sort({ fecha_creacion: -1 }).limit(50).lean();
    res.json({ success: true, ordenes, total: ordenes.length });
  } catch (error) {
    console.error('Error en getTodasOrdenes:', error);
    res.status(500).json({ success: false, message: 'Error al obtener órdenes' });
  }
};

// ✅ OBTENER ESTADÍSTICAS PARA DASHBOARD
const obtenerEstadisticas = async (req, res) => {
  try {
    const { punto_id = '000000000000000000000002' } = req.query;
    console.log('📊 [Dashboard] Solicitando estadísticas para punto:', punto_id);
    
    const hoy = new Date();
    const inicioDia = new Date(hoy); inicioDia.setHours(0, 0, 0, 0);
    const inicioSemana = new Date(hoy); inicioSemana.setDate(hoy.getDate() - hoy.getDay()); inicioSemana.setHours(0, 0, 0, 0);
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const ordenesHoy = await Order.countDocuments({ punto_id: new mongoose.Types.ObjectId(punto_id), fecha_creacion: { $gte: inicioDia } });
    const totalOrdenes = await Order.countDocuments({ punto_id: new mongoose.Types.ObjectId(punto_id) });
    
    const ingresosHoyResult = await Order.aggregate([
      { $match: { punto_id: new mongoose.Types.ObjectId(punto_id), fecha_creacion: { $gte: inicioDia }, estado: 'completada' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const ingresosHoy = ingresosHoyResult[0]?.total || 0;

    const lavadoresActivos = await User.countDocuments({ punto_id: new mongoose.Types.ObjectId(punto_id), rol: 'lavador', estado: 'activo' });
    const clientesActivos = await Order.distinct('cliente_id', {
      punto_id: new mongoose.Types.ObjectId(punto_id),
      fecha_creacion: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const comisionesHoy = ingresosHoy * 0.4;
    const gananciaNeta = ingresosHoy * 0.6;

    const ordenesCompletadasHoy = await Order.countDocuments({
      punto_id: new mongoose.Types.ObjectId(punto_id),
      fecha_creacion: { $gte: inicioDia },
      estado: 'completada'
    });
    const tasaExito = ordenesHoy > 0 ? Math.round((ordenesCompletadasHoy / ordenesHoy) * 100) : 100;

    const ingresosSemanaResult = await Order.aggregate([
      { $match: { punto_id: new mongoose.Types.ObjectId(punto_id), fecha_creacion: { $gte: inicioSemana }, estado: 'completada' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const ingresosSemana = ingresosSemanaResult[0]?.total || 0;

    const topLavadoresHoy = await Order.aggregate([
      { $match: { punto_id: new mongoose.Types.ObjectId(punto_id), fecha_creacion: { $gte: inicioDia }, estado: 'completada', 'comision_lavador.lavador_id': { $ne: null } } },
      { $group: { _id: '$comision_lavador.lavador_id', nombre: { $first: '$comision_lavador.lavador_nombre' }, total_comisiones: { $sum: '$comision_lavador.monto' }, ordenes_count: { $sum: 1 } } },
      { $sort: { total_comisiones: -1 } }, { $limit: 5 }
    ]);

    const tipoVehiculoPopular = await Order.aggregate([
      { $match: { punto_id: new mongoose.Types.ObjectId(punto_id), fecha_creacion: { $gte: inicioDia } } },
      { $group: { _id: '$tipo_vehiculo', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 1 }
    ]);

    const ordenMasCara = await Order.findOne({
      punto_id: new mongoose.Types.ObjectId(punto_id),
      fecha_creacion: { $gte: inicioDia },
      estado: 'completada'
    })
    .sort({ total: -1 })
    .select('numero_orden placa total cliente_nombre')
    .lean();

    const promedioPorOrden = ordenesCompletadasHoy > 0 ? Math.round(ingresosHoy / ordenesCompletadasHoy) : 0;

    const estadisticas = {
      generales: { ordenes_hoy: ordenesHoy, total_ordenes: totalOrdenes, ordenes_completadas_hoy: ordenesCompletadasHoy, tasa_exito: tasaExito },
      hoy: { ingresos_totales: ingresosHoy, comisiones_totales: comisionesHoy, ganancia_neta: gananciaNeta, lavadores_activos: lavadoresActivos, clientes_activos: clientesActivos.length, promedio_por_orden: promedioPorOrden },
      tendencias: { ingresos_semana: ingresosSemana, diferencia_semana: ingresosSemana > 0 ? Math.round(((ingresosHoy * 7) / ingresosSemana) * 100 - 100) : 100 },
      destacados: { top_lavadores: topLavadoresHoy, tipo_vehiculo_popular: tipoVehiculoPopular[0] || { _id: 'carro', count: 0 }, orden_mas_cara: ordenMasCara || null },
      timestamp: new Date().toISOString(),
      ultima_actualizacion: new Date().toLocaleTimeString('es-ES')
    };

    console.log('✅ [Dashboard] Estadísticas calculadas:', { ordenesHoy, ingresosHoy, comisionesHoy, lavadoresActivos });
    res.json({ success: true, data: { stats: estadisticas } });

  } catch (error) {
    console.error('❌ [Dashboard] Error al obtener estadísticas:', error);
    const datosEjemplo = {
      generales: { ordenes_hoy: 0, total_ordenes: 0, ordenes_completadas_hoy: 0, tasa_exito: 0 },
      hoy: { ingresos_totales: 0, comisiones_totales: 0, ganancia_neta: 0, lavadores_activos: 0, clientes_activos: 0, promedio_por_orden: 0 },
      tendencias: { ingresos_semana: 0, diferencia_semana: 0 },
      destacados: { top_lavadores: [], tipo_vehiculo_popular: { _id: 'carro', count: 0 }, orden_mas_cara: null },
      timestamp: new Date().toISOString(),
      ultima_actualizacion: 'Error al cargar'
    };
    res.status(200).json({ success: true, data: { stats: datosEjemplo }, modo_demo: true, mensaje: 'Mostrando datos de ejemplo por error en el servidor' });
  }
};

// ✅ OBTENER ESTADÍSTICAS DETALLADAS
const obtenerEstadisticasDetalladas = async (req, res) => {
  try {
    const { punto_id = '000000000000000000000002', dias = 7 } = req.query;
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - parseInt(dias));
    
    const ingresosPorDia = await Order.aggregate([
      { $match: { punto_id: new mongoose.Types.ObjectId(punto_id), fecha_creacion: { $gte: fechaInicio }, estado: 'completada' } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$fecha_creacion" } }, ingresos: { $sum: "$total" }, ordenes: { $sum: 1 }, comisiones: { $sum: "$comision_lavador.monto" } } },
      { $sort: { _id: 1 } }
    ]);

    const distribucionVehiculos = await Order.aggregate([
      { $match: { punto_id: new mongoose.Types.ObjectId(punto_id), fecha_creacion: { $gte: fechaInicio } } },
      { $group: { _id: "$tipo_vehiculo", count: { $sum: 1 }, ingresos: { $sum: "$total" } } }
    ]);

    const distribucionLavados = await Order.aggregate([
      { $match: { punto_id: new mongoose.Types.ObjectId(punto_id), fecha_creacion: { $gte: fechaInicio }, estado: 'completada' } },
      { $group: { _id: "$tipo_lavado", count: { $sum: 1 }, ingresos: { $sum: "$total" } } }
    ]);

    const horasPico = await Order.aggregate([
      { $match: { punto_id: new mongoose.Types.ObjectId(punto_id), fecha_creacion: { $gte: fechaInicio } } },
      { $group: { _id: { $hour: "$fecha_creacion" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 3 }
    ]);

    res.json({ success: true, data: { ingresos_por_dia: ingresosPorDia, distribucion_vehiculos: distribucionVehiculos, distribucion_lavados: distribucionLavados, horas_pico: horasPico, periodo_dias: dias } });

  } catch (error) {
    console.error('❌ Error obtenerEstadisticasDetalladas:', error);
    res.status(500).json({ success: false, mensaje: 'Error al obtener estadísticas detalladas' });
  }
};

module.exports = { 
  createOrder, 
  cobrarOrden, 
  getOrdenesActivas,
  getTodasOrdenes,
  getHistorialOrdenes,
  getEstadisticasComisiones,
  obtenerEstadisticas,
  obtenerEstadisticasDetalladas
};