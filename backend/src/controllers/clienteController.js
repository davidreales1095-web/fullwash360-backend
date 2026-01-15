// controllers/clienteController.js - VERSIÓN CORREGIDA CON RELACIÓN COMPLETA
const mongoose = require('mongoose');
const Cliente = require('../models/Cliente');
const Vehiculo = require('../models/Vehiculo');

// ✅ CREAR NUEVO CLIENTE CON LAVADAS INICIALES (VERSIÓN MEJORADA)
exports.crearCliente = async (req, res) => {
  try {
    console.log("📦 Body recibido crearCliente:", req.body);
    
    const { 
      nombre_completo, 
      telefono, 
      placa_vehiculo, 
      tipo_lavado_preferido = 'express', 
      direccion = '',
      tipo_vehiculo = 'auto',
      lavadas_iniciales = 0, // ✅ NUEVO: Lavadas iniciales
      punto_id = '000000000000000000000002',
      usuario_id = '000000000000000000000001'
    } = req.body;

    if (!nombre_completo || !telefono || !placa_vehiculo) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Nombre, teléfono y placa son obligatorios' 
      });
    }

    // ✅ VALIDAR LAVADAS INICIALES (0-9)
    if (lavadas_iniciales < 0 || lavadas_iniciales > 9) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Las lavadas iniciales deben estar entre 0 y 9' 
      });
    }

    // ✅ BUSCAR CLIENTE EXISTENTE POR PLACA
    const clienteExistente = await Cliente.findOne({
      placa_vehiculo: placa_vehiculo.trim().toUpperCase(),
      punto_id: new mongoose.Types.ObjectId(punto_id)
    });

    if (clienteExistente) {
      return res.status(200).json({ 
        success: true, 
        msg: 'Cliente ya existe con esta placa',
        cliente: clienteExistente,
        ya_existia: true
      });
    }

    // ✅ CREAR NUEVO CLIENTE (inicialmente sin vehiculo_id)
    const nuevoCliente = new Cliente({
      punto_id: new mongoose.Types.ObjectId(punto_id),
      registrado_por: new mongoose.Types.ObjectId(usuario_id),
      nombre_completo: nombre_completo.trim(),
      telefono: telefono.trim(),
      placa_vehiculo: placa_vehiculo.trim().toUpperCase(),
      tipo_lavado_preferido,
      direccion: direccion.trim(),
      lavadas_iniciales: lavadas_iniciales, // ✅ Guardar lavadas iniciales
      estado: 'activo'
    });

    await nuevoCliente.save();

    // ✅ BUSCAR VEHÍCULO EXISTENTE POR PLACA
    let vehiculoExistente = await Vehiculo.findOne({
      placa: placa_vehiculo.trim().toUpperCase(),
      punto_id: new mongoose.Types.ObjectId(punto_id)
    });

    let vehiculoCreado = null;
    
    if (!vehiculoExistente) {
      // ✅ CREAR VEHÍCULO CON CONTADOR INICIAL CORRECTO
      const nuevoVehiculo = new Vehiculo({
        punto_id: new mongoose.Types.ObjectId(punto_id),
        cliente_id: nuevoCliente._id,
        registrado_por: new mongoose.Types.ObjectId(usuario_id),
        placa: placa_vehiculo.trim().toUpperCase(),
        marca: 'NO REGISTRADA',
        modelo: 'NO REGISTRADO',
        tipo_vehiculo: tipo_vehiculo || 'auto',
        estadisticas: { 
          total_lavados: lavadas_iniciales, // ✅ Total inicial
          contador_actual: lavadas_iniciales, // ✅ CORREGIDO: Usa lavadas_iniciales (0-9)
          lavados_gratis: 0, 
          ultimo_lavado: null, 
          primer_lavado: new Date() 
        },
        estado: 'activo',
        fecha_registro: new Date()
      });

      await nuevoVehiculo.save();
      vehiculoCreado = nuevoVehiculo;
      vehiculoExistente = nuevoVehiculo;
      
      // ✅ ASIGNAR VEHÍCULO_ID AL CLIENTE Y GUARDAR
      nuevoCliente.vehiculo_id = nuevoVehiculo._id;
      await nuevoCliente.save();
    } else {
      // ✅ SI EL VEHÍCULO YA EXISTÍA, ASIGNARLO AL CLIENTE
      nuevoCliente.vehiculo_id = vehiculoExistente._id;
      await nuevoCliente.save();
    }

    console.log("✅ Cliente creado exitosamente:", {
      placa: nuevoCliente.placa_vehiculo,
      lavadas_iniciales: lavadas_iniciales,
      vehiculo_id: nuevoCliente.vehiculo_id
    });

    res.status(201).json({ 
      success: true, 
      msg: 'Cliente registrado exitosamente',
      cliente: nuevoCliente,
      vehiculo: vehiculoCreado || vehiculoExistente,
      ya_existia: false,
      contador_actual: lavadas_iniciales // ✅ Devuelve contador inicial
    });

  } catch (error) {
    console.error('❌ Error crearCliente:', error);
    
    // Manejar error de índice único (placa duplicada)
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Ya existe un cliente con esta placa en este punto' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      msg: 'Error del servidor al crear cliente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ FUNCIÓN PARA BUSCAR CLIENTE POR PLACA (VERSIÓN CORREGIDA)
exports.buscarClientePorPlaca = async (req, res) => {
  try {
    const { placa } = req.params;
    const { punto_id = '000000000000000000000002' } = req.query;
    
    if (!placa) {
      return res.status(400).json({ 
        success: false, 
        msg: 'La placa es requerida' 
      });
    }

    console.log("🔍 Buscando cliente por placa:", placa);
    
    // ✅ BUSCAR CLIENTE CON VEHÍCULO POPULADO
    const cliente = await Cliente.findOne({
      placa_vehiculo: placa.trim().toUpperCase(),
      punto_id: new mongoose.Types.ObjectId(punto_id),
      estado: 'activo'
    }).populate('vehiculo_id'); // ✅ AHORA POPULA DIRECTAMENTE

    if (!cliente) {
      console.log("❌ Cliente no encontrado para placa:", placa);
      return res.json({ 
        success: true, 
        encontrado: false,
        cliente: null,
        vehiculo: null,
        contador_actual: 0 // ✅ CORREGIDO: 0 en lugar de 1
      });
    }

    // ✅ OBTENER CONTADOR ACTUAL DEL VEHÍCULO
    const contadorActual = cliente.vehiculo_id 
      ? cliente.vehiculo_id.estadisticas.contador_actual 
      : 0;
    
    const proximaLavada = contadorActual + 1;
    const esDecimaGratis = (proximaLavada === 10);

    console.log("✅ Cliente encontrado:", {
      nombre: cliente.nombre_completo,
      placa: cliente.placa_vehiculo,
      contador_actual: contadorActual,
      proxima_lavada: proximaLavada,
      es_decima_gratis: esDecimaGratis
    });

    res.json({ 
      success: true, 
      encontrado: true,
      cliente: cliente,
      vehiculo: cliente.vehiculo_id,
      contador_actual: contadorActual, // ✅ CORREGIDO: 0-9
      proxima_lavada: proximaLavada,   // ✅ CALCULADO: 1-10
      es_decima_gratis: esDecimaGratis
    });
    
  } catch (error) {
    console.error('❌ Error buscarClientePorPlaca:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al buscar cliente por placa',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ OBTENER TODOS LOS CLIENTES CON VEHÍCULO POPULADO
exports.obtenerClientes = async (req, res) => {
  try {
    const { punto_id = '000000000000000000000002' } = req.query;
    
    const clientes = await Cliente.find({ 
      punto_id: new mongoose.Types.ObjectId(punto_id), 
      estado: 'activo' 
    })
    .populate('vehiculo_id') // ✅ AGREGADO: Popula datos del vehículo
    .sort({ fecha_registro: -1 });
    
    // ✅ FORMATEAR DATOS PARA MOSTRAR CONTADOR
    const clientesFormateados = clientes.map(cliente => ({
      ...cliente.toObject(),
      contador_actual: cliente.vehiculo_id ? cliente.vehiculo_id.estadisticas.contador_actual : 0,
      proxima_lavada: cliente.vehiculo_id ? cliente.vehiculo_id.estadisticas.contador_actual + 1 : 1,
      es_proxima_gratis: cliente.vehiculo_id ? (cliente.vehiculo_id.estadisticas.contador_actual + 1 === 10) : false
    }));
    
    res.json({ 
      success: true, 
      count: clientes.length, 
      clientes: clientesFormateados
    });
    
  } catch (error) {
    console.error('Error obtenerClientes:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Error del servidor al obtener clientes' 
    });
  }
};

// ✅ FUNCIÓN PARA CREAR CLIENTE AUTOMÁTICO (VERSIÓN CORREGIDA)
exports.crearClienteAutomatico = async (placa, tipo_vehiculo, punto_id, usuario_id, lavadas_iniciales = 0) => {
  try {
    console.log(`🤖 Creando cliente automático para placa: ${placa}, lavadas iniciales: ${lavadas_iniciales}`);
    
    // ✅ CREAR CLIENTE BÁSICO
    const nuevoCliente = new Cliente({
      punto_id: new mongoose.Types.ObjectId(punto_id),
      registrado_por: new mongoose.Types.ObjectId(usuario_id),
      nombre_completo: `Cliente ${placa}`,
      telefono: '0000000000',
      placa_vehiculo: placa.toUpperCase(),
      tipo_lavado_preferido: 'express',
      lavadas_iniciales: lavadas_iniciales, // ✅ ACEPTA LAVADAS INICIALES
      estado: 'activo'
    });

    await nuevoCliente.save();

    // ✅ CREAR VEHÍCULO CON CONTADOR INICIAL CORRECTO
    const nuevoVehiculo = new Vehiculo({
      punto_id: new mongoose.Types.ObjectId(punto_id),
      cliente_id: nuevoCliente._id,
      registrado_por: new mongoose.Types.ObjectId(usuario_id),
      placa: placa.toUpperCase(),
      marca: 'NO REGISTRADA',
      modelo: 'NO REGISTRADO',
      tipo_vehiculo: tipo_vehiculo || 'auto',
      estadisticas: { 
        total_lavados: lavadas_iniciales, // ✅ Total inicial
        contador_actual: lavadas_iniciales, // ✅ CORREGIDO: 0 en lugar de 1
        lavados_gratis: 0, 
        ultimo_lavado: null, 
        primer_lavado: new Date() 
      },
      estado: 'activo',
      fecha_registro: new Date()
    });

    await nuevoVehiculo.save();
    
    // ✅ ASIGNAR VEHÍCULO_ID AL CLIENTE
    nuevoCliente.vehiculo_id = nuevoVehiculo._id;
    await nuevoCliente.save();
    
    console.log(`✅ Cliente automático creado: ${placa}, contador: ${lavadas_iniciales}`);
    
    return {
      cliente: nuevoCliente,
      vehiculo: nuevoVehiculo,
      contador_actual: lavadas_iniciales // ✅ CORREGIDO
    };
    
  } catch (error) {
    console.error('❌ Error crearClienteAutomatico:', error);
    return null;
  }
};

// ✅ BUSCAR CLIENTES POR TEXTO (CON VEHÍCULO POPULADO)
exports.buscarClientes = async (req, res) => {
  try {
    const { q, punto_id = '000000000000000000000002' } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Término de búsqueda muy corto' 
      });
    }

    const searchTerm = q.trim();
    const clientes = await Cliente.find({
      punto_id: new mongoose.Types.ObjectId(punto_id),
      estado: 'activo',
      $or: [
        { nombre_completo: { $regex: searchTerm, $options: 'i' } },
        { telefono: { $regex: searchTerm, $options: 'i' } },
        { placa_vehiculo: { $regex: searchTerm, $options: 'i' } }
      ]
    })
    .populate('vehiculo_id') // ✅ AGREGADO: Popula vehículo
    .limit(10);

    res.json({ 
      success: true, 
      count: clientes.length, 
      clientes 
    });
    
  } catch (error) {
    console.error('Error buscarClientes:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al buscar clientes' 
    });
  }
};

module.exports = exports;