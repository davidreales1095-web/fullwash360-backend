const express = require('express');
const router = express.Router();
const User = require('../models/Usuario');
const Order = require('../models/Orden');

// ===========================
// RUTAS PRINCIPALES LAVADORES
// ===========================

// GET /api/lavadores - Obtener todos los lavadores activos con saldo
router.get('/', async (req, res) => {
  try {
    console.log("🔍 Buscando lavadores activos con saldo...");
    
    // Buscar usuarios con rol 'lavador' y activos
    const lavadores = await User.find({ 
      rol: 'lavador',
      activo: true 
    })
    .select('_id nombre codigo comision_porcentaje saldo_comisiones estadisticas activo')
    .sort({ nombre: 1 })
    .lean();

    console.log(`✅ Encontrados ${lavadores.length} lavadores`);
    
    // Si no hay lavadores, devolver datos de ejemplo
    if (lavadores.length === 0) {
      console.log("ℹ️ No hay lavadores en BD, usando datos de ejemplo");
      const lavadoresEjemplo = [
        { 
          _id: '65f4a1b2c3d4e5f6a7b8c9d0',
          nombre: 'Juan Pérez',
          codigo: 'L001',
          comision_porcentaje: 40,
          saldo_comisiones: 0,
          estadisticas: {
            total_ordenes: 0,
            total_comisiones: 0,
            promedio_comision_por_orden: 0
          },
          activo: true
        },
        { 
          _id: '65f4a1b2c3d4e5f6a7b8c9d1',
          nombre: 'María García',
          codigo: 'L002',
          comision_porcentaje: 40,
          saldo_comisiones: 0,
          estadisticas: {
            total_ordenes: 0,
            total_comisiones: 0,
            promedio_comision_por_orden: 0
          },
          activo: true
        },
        { 
          _id: '65f4a1b2c3d4e5f6a7b8c9d2',
          nombre: 'Carlos López',
          codigo: 'L003',
          comision_porcentaje: 40,
          saldo_comisiones: 0,
          estadisticas: {
            total_ordenes: 0,
            total_comisiones: 0,
            promedio_comision_por_orden: 0
          },
          activo: true
        }
      ];
      return res.json(lavadoresEjemplo);
    }

    // Formatear respuesta con comisión del 40% y saldo
    const lavadoresFormateados = lavadores.map(lavador => ({
      _id: lavador._id,
      nombre: lavador.nombre,
      codigo: lavador.codigo,
      comision_porcentaje: 40,  // Siempre 40% para el sistema
      saldo_comisiones: lavador.saldo_comisiones || 0,
      estadisticas: lavador.estadisticas || {
        total_ordenes: 0,
        total_comisiones: 0,
        promedio_comision_por_orden: 0
      },
      activo: lavador.activo
    }));

    res.json(lavadoresFormateados);
  } catch (error) {
    console.error('❌ Error obteniendo lavadores:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener lavadores',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/lavadores/:id - Obtener un lavador por ID con detalles
router.get('/:id', async (req, res) => {
  try {
    const lavador = await User.findOne({ 
      _id: req.params.id,
      rol: 'lavador',
      activo: true 
    })
    .select('_id nombre codigo comision_porcentaje saldo_comisiones estadisticas activo');

    if (!lavador) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lavador no encontrado' 
      });
    }

    res.json({ 
      success: true, 
      lavador: {
        _id: lavador._id,
        nombre: lavador.nombre,
        codigo: lavador.codigo,
        comision_porcentaje: 40,
        saldo_comisiones: lavador.saldo_comisiones || 0,
        estadisticas: lavador.estadisticas || {
          total_ordenes: 0,
          total_comisiones: 0,
          promedio_comision_por_orden: 0
        },
        activo: lavador.activo
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo lavador:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener lavador' 
    });
  }
});

// ===========================
// NUEVAS RUTAS: SISTEMA COMISIONES
// ===========================

// GET /api/lavadores/:id/comisiones - Obtener historial de comisiones de un lavador
router.get('/:id/comisiones', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      fechaInicio, 
      fechaFin,
      page = 1,
      limit = 20
    } = req.query;

    // Verificar que el lavador existe
    const lavador = await User.findById(id);
    if (!lavador || lavador.rol !== 'lavador') {
      return res.status(404).json({ 
        success: false, 
        message: 'Lavador no encontrado' 
      });
    }

    // Construir filtro para órdenes
    const filtro = {
      'comision_lavador.lavador_id': id,
      estado: 'completada'
    };

    // Filtrar por fechas si se proporcionan
    if (fechaInicio || fechaFin) {
      filtro.fecha_cobro = {};
      if (fechaInicio) {
        filtro.fecha_cobro.$gte = new Date(fechaInicio);
      }
      if (fechaFin) {
        const finDate = new Date(fechaFin);
        finDate.setHours(23, 59, 59, 999);
        filtro.fecha_cobro.$lte = finDate;
      }
    }

    // Calcular paginación
    const skip = (page - 1) * limit;

    // Obtener órdenes con comisiones
    const ordenes = await Order.find(filtro)
      .sort({ fecha_cobro: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('numero_orden placa total fecha_cobro comision_lavador')
      .lean();

    // Obtener total de órdenes para paginación
    const totalOrdenes = await Order.countDocuments(filtro);

    // Calcular totales
    const totalComisiones = ordenes.reduce((sum, orden) => 
      sum + (orden.comision_lavador?.monto || 0), 0);
    
    const totalVentas = ordenes.reduce((sum, orden) => sum + orden.total, 0);

    res.json({
      success: true,
      lavador: {
        _id: lavador._id,
        nombre: lavador.nombre,
        codigo: lavador.codigo,
        saldo_comisiones: lavador.saldo_comisiones || 0
      },
      comisiones: ordenes.map(orden => ({
        orden_id: orden._id,
        numero_orden: orden.numero_orden,
        placa: orden.placa,
        total: orden.total,
        comision: orden.comision_lavador?.monto || 0,
        porcentaje: orden.comision_lavador?.porcentaje || 40,
        fecha_cobro: orden.fecha_cobro,
        fecha_formateada: orden.fecha_cobro ? 
          new Date(orden.fecha_cobro).toLocaleDateString('es-ES') : 'N/A'
      })),
      estadisticas: {
        totalOrdenes: totalOrdenes,
        totalVentas: totalVentas,
        totalComisiones: totalComisiones,
        promedioComisionPorOrden: totalOrdenes > 0 ? totalComisiones / totalOrdenes : 0
      },
      paginacion: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalOrdenes,
        totalPages: Math.ceil(totalOrdenes / limit)
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo comisiones:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener comisiones del lavador',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/lavadores/:id/estadisticas - Obtener estadísticas detalladas
router.get('/:id/estadisticas', async (req, res) => {
  try {
    const { id } = req.params;
    const { mes, año } = req.query;

    // Verificar lavador
    const lavador = await User.findById(id);
    if (!lavador || lavador.rol !== 'lavador') {
      return res.status(404).json({ 
        success: false, 
        message: 'Lavador no encontrado' 
      });
    }

    // Construir filtro base
    const filtroBase = {
      'comision_lavador.lavador_id': id,
      estado: 'completada'
    };

    // Filtrar por mes y año si se proporcionan
    if (mes && año) {
      const fechaInicio = new Date(año, mes - 1, 1);
      const fechaFin = new Date(año, mes, 0, 23, 59, 59, 999);
      
      filtroBase.fecha_cobro = {
        $gte: fechaInicio,
        $lte: fechaFin
      };
    }

    // Obtener todas las órdenes del lavador (sin límite para estadísticas)
    const todasOrdenes = await Order.find(filtroBase)
      .sort({ fecha_cobro: -1 })
      .lean();

    // Calcular estadísticas por día
    const comisionesPorDia = {};
    const ventasPorDia = {};
    
    todasOrdenes.forEach(orden => {
      if (orden.fecha_cobro) {
        const fecha = orden.fecha_cobro.toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (!comisionesPorDia[fecha]) comisionesPorDia[fecha] = 0;
        if (!ventasPorDia[fecha]) ventasPorDia[fecha] = 0;
        
        comisionesPorDia[fecha] += orden.comision_lavador?.monto || 0;
        ventasPorDia[fecha] += orden.total;
      }
    });

    // Convertir a arrays ordenados
    const comisionesDiarias = Object.entries(comisionesPorDia)
      .map(([fecha, monto]) => ({ fecha, monto }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    // Calcular estadísticas generales
    const totalOrdenes = todasOrdenes.length;
    const totalVentas = todasOrdenes.reduce((sum, orden) => sum + orden.total, 0);
    const totalComisiones = todasOrdenes.reduce((sum, orden) => 
      sum + (orden.comision_lavador?.monto || 0), 0);
    
    // Calcular promedio diario (últimos 30 días)
    const ultimos30Dias = new Date();
    ultimos30Dias.setDate(ultimos30Dias.getDate() - 30);
    
    const ordenesUltimos30Dias = todasOrdenes.filter(orden => 
      orden.fecha_cobro && new Date(orden.fecha_cobro) >= ultimos30Dias
    );
    
    const comisionesUltimos30Dias = ordenesUltimos30Dias.reduce((sum, orden) => 
      sum + (orden.comision_lavador?.monto || 0), 0);
    
    const promedioDiario = comisionesUltimos30Dias / 30;

    res.json({
      success: true,
      lavador: {
        _id: lavador._id,
        nombre: lavador.nombre,
        codigo: lavador.codigo,
        saldo_comisiones: lavador.saldo_comisiones || 0,
        estadisticas_generales: lavador.estadisticas || {}
      },
      estadisticas: {
        totalOrdenes,
        totalVentas,
        totalComisiones,
        promedioComisionPorOrden: totalOrdenes > 0 ? totalComisiones / totalOrdenes : 0,
        promedioDiario: promedioDiario,
        comisionesUltimos30Dias: comisionesUltimos30Dias
      },
      tendencias: {
        comisionesDiarias: comisionesDiarias.slice(-30), // Últimos 30 días
        ventasDiarias: Object.entries(ventasPorDia)
          .map(([fecha, monto]) => ({ fecha, monto }))
          .sort((a, b) => a.fecha.localeCompare(b.fecha))
          .slice(-30)
      },
      ultimasOrdenes: todasOrdenes.slice(0, 10).map(orden => ({
        numero_orden: orden.numero_orden,
        placa: orden.placa,
        total: orden.total,
        comision: orden.comision_lavador?.monto || 0,
        fecha_cobro: orden.fecha_cobro
      }))
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener estadísticas del lavador',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===========================
// RUTAS ADMINISTRATIVAS
// ===========================

// PUT /api/lavadores/:id/comisiones - Ajustar saldo de comisiones (admin)
router.put('/:id/comisiones', async (req, res) => {
  try {
    const { id } = req.params;
    const { ajuste, motivo, tipo = 'suma' } = req.body;

    // Validar ajuste
    const montoAjuste = Number(ajuste);
    if (isNaN(montoAjuste) || montoAjuste <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Monto de ajuste inválido' 
      });
    }

    // Buscar lavador
    const lavador = await User.findById(id);
    if (!lavador || lavador.rol !== 'lavador') {
      return res.status(404).json({ 
        success: false, 
        message: 'Lavador no encontrado' 
      });
    }

    // Aplicar ajuste
    if (tipo === 'suma') {
      lavador.saldo_comisiones = (lavador.saldo_comisiones || 0) + montoAjuste;
    } else if (tipo === 'resta') {
      lavador.saldo_comisiones = Math.max(0, (lavador.saldo_comisiones || 0) - montoAjuste);
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Tipo de ajuste inválido. Use "suma" o "resta"' 
      });
    }

    await lavador.save();

    // Registrar en log (podrías guardar esto en una colección aparte)
    console.log(`📝 Ajuste de comisiones a ${lavador.nombre}:`);
    console.log(`   Tipo: ${tipo}`);
    console.log(`   Monto: $${montoAjuste}`);
    console.log(`   Motivo: ${motivo || 'Sin motivo especificado'}`);
    console.log(`   Nuevo saldo: $${lavador.saldo_comisiones}`);

    res.json({
      success: true,
      message: `Saldo ajustado exitosamente (${tipo}: $${montoAjuste})`,
      lavador: {
        _id: lavador._id,
        nombre: lavador.nombre,
        saldo_comisiones: lavador.saldo_comisiones,
        ajuste_realizado: {
          tipo: tipo,
          monto: montoAjuste,
          motivo: motivo,
          fecha: new Date(),
          saldo_anterior: lavador.saldo_comisiones - (tipo === 'suma' ? montoAjuste : -montoAjuste)
        }
      }
    });

  } catch (error) {
    console.error('❌ Error ajustando comisiones:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al ajustar comisiones',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/lavadores/ranking/comisiones - Ranking de lavadores por comisiones
router.get('/ranking/comisiones', async (req, res) => {
  try {
    const { periodo = 'mes' } = req.query; // mes, semana, dia, total
    
    // Construir filtro de fecha según periodo
    const filtroFecha = {};
    const ahora = new Date();
    
    if (periodo === 'dia') {
      const inicioDia = new Date(ahora.setHours(0, 0, 0, 0));
      filtroFecha.fecha_cobro = { $gte: inicioDia };
    } else if (periodo === 'semana') {
      const inicioSemana = new Date(ahora.setDate(ahora.getDate() - 7));
      filtroFecha.fecha_cobro = { $gte: inicioSemana };
    } else if (periodo === 'mes') {
      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      filtroFecha.fecha_cobro = { $gte: inicioMes };
    }
    // 'total' no aplica filtro de fecha

    // Obtener lavadores activos
    const lavadores = await User.find({ 
      rol: 'lavador',
      activo: true 
    }).select('_id nombre codigo saldo_comisiones');

    // Para cada lavador, calcular comisiones en el periodo
    const ranking = await Promise.all(
      lavadores.map(async (lavador) => {
        const filtro = {
          'comision_lavador.lavador_id': lavador._id.toString(),
          estado: 'completada',
          ...filtroFecha
        };

        const ordenesPeriodo = await Order.find(filtro).lean();
        const comisionesPeriodo = ordenesPeriodo.reduce((sum, orden) => 
          sum + (orden.comision_lavador?.monto || 0), 0);

        return {
          _id: lavador._id,
          nombre: lavador.nombre,
          codigo: lavador.codigo,
          saldo_total: lavador.saldo_comisiones || 0,
          comisiones_periodo: comisionesPeriodo,
          ordenes_periodo: ordenesPeriodo.length,
          ventas_periodo: ordenesPeriodo.reduce((sum, orden) => sum + orden.total, 0)
        };
      })
    );

    // Ordenar por comisiones en el periodo (descendente)
    ranking.sort((a, b) => b.comisiones_periodo - a.comisiones_periodo);

    res.json({
      success: true,
      periodo: periodo,
      ranking: ranking.map((item, index) => ({
        posicion: index + 1,
        ...item
      })),
      total_comisiones_periodo: ranking.reduce((sum, item) => sum + item.comisiones_periodo, 0),
      total_ventas_periodo: ranking.reduce((sum, item) => sum + item.ventas_periodo, 0)
    });

  } catch (error) {
    console.error('❌ Error generando ranking:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al generar ranking de comisiones' 
    });
  }
});

module.exports = router;