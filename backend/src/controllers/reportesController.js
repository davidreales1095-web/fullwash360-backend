const Orden = require('../models/Orden');
const Usuario = require('../models/Usuario');

// ===================== Órdenes activas (no cobradas) =====================
exports.getOrdenesActivas = async (req, res) => {
  try {
    const { punto_id } = req.query; // sin req.user para desarrollo
    if (!punto_id) return res.status(400).json({ success: false, msg: 'punto_id requerido' });

    const ordenes = await Orden.find({ punto_id, fecha_cobro: null })
      .sort({ fecha_creacion: -1 })
      .populate('lavador_asignado', 'nombre codigo');

    res.json({ success: true, ordenes });
  } catch (error) {
    console.error('[ReportesController] getOrdenesActivas', error);
    res.status(500).json({ success: false, msg: 'Error al obtener órdenes activas' });
  }
};

// ===================== Historial por placa =====================
exports.getHistoryByPlate = async (req, res) => {
  try {
    const { placa } = req.params;
    const { punto_id } = req.query;

    const ordenes = await Orden.find({
      placa: placa.trim().toUpperCase(),
      punto_id
    }).sort({ fecha_creacion: -1 });

    res.json({ success: true, ordenes });
  } catch (error) {
    console.error('[ReportesController] getHistoryByPlate', error);
    res.status(500).json({ success: false, msg: 'Error al obtener historial' });
  }
};

// ===================== Historial por lavador =====================
exports.getHistoryByLavador = async (req, res) => {
  try {
    const { lavador_id } = req.params;
    const { punto_id } = req.query;

    const ordenes = await Orden.find({
      lavador_asignado: lavador_id,
      punto_id,
      fecha_cobro: { $ne: null } // solo cobradas
    }).sort({ fecha_cobro: -1 });

    res.json({ success: true, ordenes });
  } catch (error) {
    console.error('[ReportesController] getHistoryByLavador', error);
    res.status(500).json({ success: false, msg: 'Error al obtener historial de lavador' });
  }
};

// ===================== Estadísticas generales =====================
exports.getStats = async (req, res) => {
  try {
    const { punto_id } = req.query;

    const totalOrdenes = await Usuario.countDocuments({ punto_id });
    const totalClientes = await Usuario.countDocuments({ punto_id, rol: 'cliente' });

    res.json({ success: true, totalOrdenes, totalClientes });
  } catch (error) {
    console.error('[ReportesController] getStats', error);
    res.status(500).json({ success: false, msg: 'Error al obtener estadísticas' });
  }
};

// ===================== Comisiones diarias =====================
exports.getComisionesDiarias = async (req, res) => {
  try {
    const { fecha, punto_id } = req.query;

    const start = new Date(fecha);
    start.setHours(0, 0, 0, 0);
    const end = new Date(fecha);
    end.setHours(23, 59, 59, 999);

    const ordenes = await Orden.find({
      lavador_asignado: { $exists: true },
      fecha_cobro: { $gte: start, $lte: end },
      punto_id
    });

    const resumen = {};
    ordenes.forEach(o => {
      const id = o.lavador_asignado.toString();
      if (!resumen[id]) resumen[id] = { lavador: o.lavador_asignado, total: 0 };
      resumen[id].total += o.comision_lavador.monto;
    });

    res.json({ success: true, fecha, resumen });
  } catch (error) {
    console.error('[ReportesController] getComisionesDiarias', error);
    res.status(500).json({ success: false, msg: 'Error al obtener comisiones' });
  }
};

// ===================== Obtener orden por ID =====================
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const { punto_id } = req.query;

    const orden = await Orden.findOne({ _id: id, punto_id });
    if (!orden) return res.status(404).json({ success: false, msg: 'Orden no encontrada' });

    res.json({ success: true, orden });
  } catch (error) {
    console.error('[ReportesController] getOrderById', error);
    res.status(500).json({ success: false, msg: 'Error al obtener orden' });
  }
};
