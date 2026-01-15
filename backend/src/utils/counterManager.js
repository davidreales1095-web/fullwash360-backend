// utils/counterManager.js - VERSIÓN CORREGIDA Y COMPLETA
const mongoose = require('mongoose');
const Vehicle = require('../models/Vehiculo');

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 0 }
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);

const generarNumeroOrden = async () => {
  try {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    const counter = await Counter.findByIdAndUpdate(
      { _id: dateStr },
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );
    
    const sequenceNumber = counter.sequence_value.toString().padStart(4, '0');
    return `ORD-${dateStr}-${sequenceNumber}`;
    
  } catch (error) {
    console.error('Error generando número de orden:', error);
    return `ORD-${Date.now()}`;
  }
};

const obtenerContador = async (placa) => {
  try {
    const vehicle = await Vehicle.findOne({ placa: placa.toUpperCase() });
    
    if (!vehicle) {
      return {
        contador: 1,
        totalLavados: 0,
        esNuevo: true,
        faltantes: 9,
        mensaje: `Primer lavado para ${placa}`
      };
    }
    
    const META_LAVADOS = 10;
    const totalLavados = vehicle.estadisticas?.total_lavados || 0;
    const contadorActual = vehicle.estadisticas?.contador_actual || 1;
    const esDecimaGratis = contadorActual === META_LAVADOS;
    
    return {
      contador: contadorActual,
      totalLavados: totalLavados,
      lavadosGratis: vehicle.estadisticas?.lavados_gratis || 0,
      esNuevo: false,
      esDecimaGratis: esDecimaGratis,
      faltantes: esDecimaGratis ? 0 : META_LAVADOS - contadorActual,
      ultimaVisita: vehicle.estadisticas?.ultimo_lavado,
      mensaje: esDecimaGratis 
        ? `🎉 ¡${META_LAVADOS}° lavado GRATIS!` 
        : `Lavada #${contadorActual}. Faltan ${META_LAVADOS - contadorActual} para gratis`
    };
    
  } catch (error) {
    console.error('Error obteniendo contador:', error);
    return { 
      contador: 1, 
      totalLavados: 0, 
      esNuevo: true,
      mensaje: 'Error calculando contador'
    };
  }
};

const incrementarContador = async (placa, ordenData) => {
  try {
    const vehicle = await Vehicle.findOne({ placa: placa.toUpperCase() });
    const META_LAVADOS = 10;
    
    if (!vehicle) {
      const nuevoVehiculo = new Vehicle({
        placa: placa.toUpperCase(),
        tipo_vehiculo: ordenData.tipo_vehiculo || 'auto',
        cliente_id: ordenData.cliente_id,
        punto_id: ordenData.punto_id,
        registrado_por: ordenData.usuario_id,
        estadisticas: {
          total_lavados: 1,
          contador_actual: 2,
          lavados_gratis: 0,
          primer_lavado: new Date(),
          ultimo_lavado: new Date()
        }
      });
      await nuevoVehiculo.save();
      return { nuevo: true, contador: 2, esGratis: false };
    }
    
    const contadorActual = vehicle.estadisticas?.contador_actual || 1;
    const esGratis = contadorActual === META_LAVADOS;
    const nuevoContador = esGratis ? 1 : contadorActual + 1;
    
    vehicle.estadisticas.total_lavados += 1;
    vehicle.estadisticas.contador_actual = nuevoContador;
    vehicle.estadisticas.ultimo_lavado = new Date();
    
    if (esGratis) {
      vehicle.estadisticas.lavados_gratis = (vehicle.estadisticas.lavados_gratis || 0) + 1;
    }
    
    await vehicle.save();
    
    return {
      nuevo: false,
      contador: nuevoContador,
      esGratis: esGratis,
      totalLavados: vehicle.estadisticas.total_lavados,
      lavadosGratis: vehicle.estadisticas.lavados_gratis || 0
    };
    
  } catch (error) {
    console.error('Error incrementando contador:', error);
    throw error;
  }
};

module.exports = { 
  generarNumeroOrden, 
  obtenerContador,
  incrementarContador
};