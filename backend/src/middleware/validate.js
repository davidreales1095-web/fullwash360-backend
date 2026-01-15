const validateOrder = (req, res, next) => {
  const { tipoVehiculo, placa } = req.body;
  
  const errors = [];
  
  // Validar tipo de vehículo
  const tiposPermitidos = ['carro', 'moto', 'taxi', 'camioneta'];
  if (!tiposPermitidos.includes(tipoVehiculo)) {
    errors.push(`Tipo de vehículo inválido. Permitidos: ${tiposPermitidos.join(', ')}`);
  }
  
  // Validar placa (formato básico)
  const placaRegex = /^[A-Z0-9]{6,8}$/;
  if (!placaRegex.test(placa)) {
    errors.push('Placa inválida. Debe contener 6-8 caracteres alfanuméricos');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
};

const validateLogin = (req, res, next) => {
  const { codigo, password } = req.body;
  
  if (!codigo || !password) {
    return res.status(400).json({ 
      error: 'Código y contraseña son requeridos' 
    });
  }
  
  if (codigo.length < 3) {
    return res.status(400).json({ 
      error: 'El código debe tener al menos 3 caracteres' 
    });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ 
      error: 'La contraseña debe tener al menos 6 caracteres' 
    });
  }
  
  next();
};

module.exports = { validateOrder, validateLogin };