// middleware/auth.js - DESARROLLO SIN AUTENTICACIÓN
const auth = async (req, res, next) => {
  // Simular usuario en desarrollo
  req.user = {
    _id: '000000000000000000000000',
    codigo: 'DEV',
    rol: 'superadmin',
    punto_id: null,
    activo: true,
    estado: 'activo',
  };
  next();
};

// authorize sigue funcionando, pero con el usuario simulado
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Usuario no autenticado' });
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ 
        error: 'No tienes permisos para esta acción',
        rol_actual: req.user.rol,
        roles_permitidos: roles
      });
    }
    next();
  };
};

module.exports = { auth, authorize };
