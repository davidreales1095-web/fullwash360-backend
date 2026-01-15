// controllers/reporteController.js
const Order = require('../models/Orden');
const Vehicle = require('../models/Vehiculo');

// Reporte diario de cierre de caja
const getReporteDiario = async (req, res) => {
  try {
    const { fecha } = req.query;
    let fechaConsulta = fecha ? new Date(fecha) : new Date();
    
    // Ajustar a inicio y fin del día
    const inicioDia = new Date(fechaConsulta.setHours(0, 0, 0, 0));
    const finDia = new Date(fechaConsulta.setHours(23, 59, 59, 999));

    // Obtener órdenes del día
    const ordenes = await Order.find({
      fecha_cobro: { $gte: inicioDia, $lte: finDia },
      estado: 'completado'
    }).sort({ fecha_cobro: 1 });

    // Calcular totales
    let totalEfectivo = 0;
    let totalTarjeta = 0;
    let totalTransferencia = 0;
    let totalOtros = 0;
    let totalComisiones = 0;
    let totalIngresos = 0;
    
    const comisionesPorLavador = {};

    ordenes.forEach(orden => {
      const monto = orden.total || 0;
      const comision = orden.comision_lavador?.monto || 0;
      const lavador = orden.comision_lavador?.lavador_nombre || 'Sin asignar';
      
      // Totales por método de pago
      switch (orden.metodo_pago) {
        case 'efectivo': totalEfectivo += monto; break;
        case 'tarjeta': totalTarjeta += monto; break;
        case 'transferencia': totalTransferencia += monto; break;
        default: totalOtros += monto;
      }
      
      totalIngresos += monto;
      totalComisiones += comision;
      
      // Agrupar por lavador
      if (!comisionesPorLavador[lavador]) {
        comisionesPorLavador[lavador] = {
          nombre: lavador,
          ordenes: 0,
          total: 0,
          comision: 0
        };
      }
      
      comisionesPorLavador[lavador].ordenes += 1;
      comisionesPorLavador[lavador].total += monto;
      comisionesPorLavador[lavador].comision += comision;
    });

    // Estadísticas por tipo de vehículo
    const ordenesPorTipo = {};
    ordenes.forEach(orden => {
      const tipo = orden.tipo_vehiculo || 'otro';
      if (!ordenesPorTipo[tipo]) {
        ordenesPorTipo[tipo] = { cantidad: 0, total: 0 };
      }
      ordenesPorTipo[tipo].cantidad += 1;
      ordenesPorTipo[tipo].total += orden.total || 0;
    });

    res.json({
      success: true,
      reporte: {
        fecha: inicioDia.toISOString().split('T')[0],
        periodo: {
          inicio: inicioDia,
          fin: finDia
        },
        resumen: {
          total_ordenes: ordenes.length,
          total_ingresos: totalIngresos,
          total_comisiones: totalComisiones,
          ganancia_neta: totalIngresos - totalComisiones,
          porcentaje_comisiones: totalIngresos > 0 ? 
            ((totalComisiones / totalIngresos) * 100).toFixed(2) : 0
        },
        metodo_pago: {
          efectivo: totalEfectivo,
          tarjeta: totalTarjeta,
          transferencia: totalTransferencia,
          otros: totalOtros,
          total: totalIngresos
        },
        comisiones_por_lavador: Object.values(comisionesPorLavador),
        ordenes_por_tipo: ordenesPorTipo,
        ordenes_detalle: ordenes.map(orden => ({
          numero_orden: orden.numero_orden,
          placa: orden.placa,
          tipo_vehiculo: orden.tipo_vehiculo,
          tipo_lavado: orden.servicios[0]?.tipo_lavado,
          precio: orden.total,
          contador_lavada: orden.contador_lavada,
          es_decima_gratis: orden.es_decima_gratis,
          metodo_pago: orden.metodo_pago,
          lavador: orden.comision_lavador?.lavador_nombre,
          comision: orden.comision_lavador?.monto,
          fecha_cobro: orden.fecha_cobro
        })),
        generado_en: new Date()
      }
    });

  } catch (error) {
    console.error('Error generando reporte:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al generar el reporte',
      details: error.message 
    });
  }
};

// Reporte de comisiones por lavador en un rango de fechas
const getReporteComisiones = async (req, res) => {
  try {
    const { inicio, fin, lavador } = req.query;
    
    let filtro = { estado: 'completado' };
    
    if (inicio && fin) {
      filtro.fecha_cobro = { 
        $gte: new Date(inicio), 
        $lte: new Date(fin) 
      };
    }
    
    if (lavador) {
      filtro['comision_lavador.lavador_nombre'] = lavador;
    }

    const ordenes = await Order.find(filtro)
      .sort({ fecha_cobro: 1 });

    const resumen = {
      total_ordenes: ordenes.length,
      total_ingresos: 0,
      total_comisiones: 0,
      lavadores: {}
    };

    ordenes.forEach(orden => {
      const lavadorNombre = orden.comision_lavador?.lavador_nombre || 'Sin asignar';
      const ingresos = orden.total || 0;
      const comision = orden.comision_lavador?.monto || 0;
      
      resumen.total_ingresos += ingresos;
      resumen.total_comisiones += comision;
      
      if (!resumen.lavadores[lavadorNombre]) {
        resumen.lavadores[lavadorNombre] = {
          ordenes: 0,
          ingresos: 0,
          comisiones: 0
        };
      }
      
      resumen.lavadores[lavadorNombre].ordenes += 1;
      resumen.lavadores[lavadorNombre].ingresos += ingresos;
      resumen.lavadores[lavadorNombre].comisiones += comision;
    });

    // Convertir lavadores a array
    const lavadoresArray = Object.entries(resumen.lavadores).map(([nombre, datos]) => ({
      nombre,
      ...datos
    }));

    res.json({
      success: true,
      periodo: { inicio, fin },
      resumen: {
        ...resumen,
        ganancia_neta: resumen.total_ingresos - resumen.total_comisiones,
        lavadores: lavadoresArray.sort((a, b) => b.comisiones - a.comisiones)
      },
      ordenes: ordenes.map(orden => ({
        numero_orden: orden.numero_orden,
        fecha: orden.fecha_cobro,
        placa: orden.placa,
        ingresos: orden.total,
        comision: orden.comision_lavador?.monto,
        lavador: orden.comision_lavador?.lavador_nombre
      }))
    });

  } catch (error) {
    console.error('Error en reporte de comisiones:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al generar reporte de comisiones' 
    });
  }
};

module.exports = {
  getReporteDiario,
  getReporteComisiones
};