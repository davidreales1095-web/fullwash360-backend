// backend/src/controllers/vehiculoController.js
const Vehiculo = require('../models/Vehiculo');
const Orden = require('../models/Order');

// Buscar vehículo por placa
exports.buscarVehiculoPorPlaca = async (req, res) => {
  try {
    const usuario = req.user;
    const { placa } = req.params;

    if (!placa) return res.status(400).json({ success: false, msg: 'Placa requerida' });

    const vehiculo = await Vehiculo.findOne({
      placa: placa.trim().toUpperCase(),
      punto_id: usuario.punto_id,
      estado: 'activo'
    }).populate('cliente_id', 'nombre_completo telefono');

    if (!vehiculo) return res.json({ success: true, vehiculo: null, msg: 'Vehículo no encontrado' });

    res.json({ success: true, vehiculo });
  } catch (error) {
    console.error('[VehiculoController] buscarVehiculoPorPlaca', error);
    res.status(500).json({ success: false, msg: 'Error al buscar vehículo' });
  }
};

// Obtener últimas órdenes de un vehículo
exports.getRecentOrders = async (req, res) => {
  try {
    const usuario = req.user;
    const { placa } = req.params;

    if (!placa) return res.status(400).json({ success: false, msg: 'Placa requerida' });

    const vehiculo = await Vehiculo.findOne({ placa: placa.trim().toUpperCase(), punto_id: usuario.punto_id });
    if (!vehiculo) return res.status(404).json({ success: false, msg: 'Vehículo no encontrado' });

    const ordenes = await Orden.find({ vehiculo_id: vehiculo._id })
      .sort({ fecha_creacion: -1 })
      .limit(5)
      .lean();

    res.json({ success: true, ordenes });
  } catch (error) {
    console.error('[VehiculoController] getRecentOrders', error);
    res.status(500).json({ success: false, msg: 'Error al obtener órdenes recientes' });
  }
};
