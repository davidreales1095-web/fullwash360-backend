// utils/priceCalculator.js
const PRECIOS_SUGERIDOS = {
  moto: {
    express: 12000,
    elite: 15000,
    premium: 17000
  },
  carro: {
    express: 15000,
    elite: null,
    premium: 20000
  },
  taxi: {
    express: 15000,
    elite: null,
    premium: null
  },
  camioneta: {
    express: 18000,
    elite: null,
    premium: 25000
  },
  suv: {
    express: 18000,
    elite: null,
    premium: 25000
  },
  camion: {
    express: 25000,
    elite: null,
    premium: 35000
  },
  bus: {
    express: 40000,
    elite: null,
    premium: 60000
  },
  otro: {
    express: 15000,
    elite: null,
    premium: 20000
  }
};

const calcularPrecioSugerido = (tipoVehiculo, tipoLavado) => {
  const tipo = tipoVehiculo?.toLowerCase() || 'carro';
  const lavado = tipoLavado?.toLowerCase() || 'express';
  
  const preciosTipo = PRECIOS_SUGERIDOS[tipo] || PRECIOS_SUGERIDOS.carro;
  const precio = preciosTipo[lavado];
  
  return precio !== undefined ? precio : PRECIOS_SUGERIDOS.carro.express;
};

const validarCombinacion = (tipoVehiculo, tipoLavado) => {
  const tipo = tipoVehiculo?.toLowerCase();
  const lavado = tipoLavado?.toLowerCase();
  
  // Validaciones específicas
  if (tipo === 'taxi' && lavado !== 'express') {
    return { 
      valido: false, 
      mensaje: 'Los taxis solo pueden tener servicio Express Wash ($15,000)' 
    };
  }
  
  if ((tipo === 'carro' || tipo === 'camioneta' || tipo === 'suv' || tipo === 'camion' || tipo === 'bus') && lavado === 'elite') {
    return { 
      valido: false, 
      mensaje: `Los ${tipo}s no tienen servicio Elite Wash` 
    };
  }
  
  const precio = calcularPrecioSugerido(tipoVehiculo, tipoLavado);
  
  if (!precio) {
    return { 
      valido: false, 
      mensaje: `Combinación no válida: ${tipoVehiculo} - ${tipoLavado}` 
    };
  }
  
  return { 
    valido: true, 
    precio: precio,
    mensaje: `Precio sugerido: $${precio.toLocaleString()}` 
  };
};

const calcularComisionLavador = (precioTotal) => {
  const porcentaje = 40; // 40% fijo
  return {
    monto: precioTotal * (porcentaje / 100),
    porcentaje: porcentaje,
    montoEmpresa: precioTotal * ((100 - porcentaje) / 100)
  };
};

module.exports = {
  PRECIOS_SUGERIDOS,
  calcularPrecioSugerido,
  validarCombinacion,
  calcularComisionLavador
};