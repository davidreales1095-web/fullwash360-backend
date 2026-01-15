const User = require('../models/Usuario');
const Punto = require('../models/Punto');
const jwt = require('jsonwebtoken');

// ==================== LOGIN ====================
const login = async (req, res) => {
  try {
    const { codigo, password } = req.body;
    
    // 1. VALIDACIÓN CRÍTICA
    if (!codigo || !password) {
      return res.status(400).json({
        success: false,
        error: 'Código y contraseña son requeridos'
      });
    }
    
    console.log(`🔐 Intento de login: ${codigo}`);
    
    // 2. Buscar usuario - ¡CORREGIDO CON $OR!
    const user = await User.findOne({ 
      codigo: codigo.toUpperCase().trim(),
      $or: [
        { activo: true },           // Nuevo campo (Boolean)
        { estado: 'activo' }        // Campo antiguo (String) - para compatibilidad
      ]
    });
    
    if (!user) {
      console.log(`❌ Usuario no encontrado o inactivo: ${codigo}`);
      return res.status(401).json({
        success: false,
        error: 'Código o contraseña incorrectos'
      });
    }
    
    console.log(`✅ Usuario encontrado: ${user.codigo}, Rol: ${user.rol}`);
    
    // 3. Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log(`❌ Contraseña incorrecta para: ${codigo}`);
      return res.status(401).json({
        success: false,
        error: 'Código o contraseña incorrectos'
      });
    }
    
    console.log(`✅ Contraseña válida para: ${codigo}`);
    
    // 4. Validar que tenga punto_id (excepto superadmin)
    if (user.rol !== 'superadmin' && !user.punto_id) {
      console.error(`❌ ERROR: Usuario sin punto_id: ${user.codigo}`);
      return res.status(400).json({
        success: false,
        error: 'Usuario sin punto asignado. Contacta al administrador.',
        codigo: user.codigo,
        rol: user.rol
      });
    }
    
    // 5. Preparar payload para token
    const tokenPayload = {
      userId: user._id,
      codigo: user.codigo,
      rol: user.rol,
      nombre: user.nombre
    };
    
    // Solo agregar punto_id si existe
    if (user.punto_id) {
      tokenPayload.punto_id = user.punto_id;
    }
    
    // 6. Generar token
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'secreto_temporal_para_desarrollo',
      { expiresIn: '8h' }
    );
    
    // 7. Actualizar último login
    user.ultimo_login = new Date();
    await user.save();
    
    // 8. Preparar respuesta
    const userResponse = user.toJSON();
    
    // Agregar información del punto si tiene
    if (user.punto_id) {
      const punto = await Punto.findById(user.punto_id);
      if (punto) {
        userResponse.punto = {
          id: punto._id,
          nombre: punto.nombre,
          direccion: punto.direccion
        };
        userResponse.punto_nombre = punto.nombre; // Para fácil acceso en frontend
      }
    }
    
    console.log(`🎉 Login exitoso: ${user.codigo}`);
    
    // 9. Responder
    res.json({
      success: true,
      message: 'Login exitoso',
      user: userResponse,
      token
    });
    
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ==================== REGISTRO ====================
const register = async (req, res) => {
  try {
    const { codigo, nombre, password, rol, telefono, email } = req.body;
    const creador = req.user;
    
    // 1. VALIDAR QUE EL CREADOR ESTÉ AUTENTICADO
    if (!creador) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }
    
    // 2. VALIDAR DATOS REQUERIDOS
    if (!nombre || !password) {
      return res.status(400).json({
        success: false,
        error: 'Nombre y contraseña son requeridos'
      });
    }
    
    // 3. VALIDAR PERMISOS SEGÚN ROL DEL CREADOR
    let nuevoRol = rol || 'colaborador';
    let puntoId = creador.punto_id;
    let codigoGenerado = codigo ? codigo.toUpperCase() : '';
    
    // Si el creador es SUPERADMIN
    if (creador.rol === 'superadmin') {
      if (!['superadmin', 'admin', 'colaborador', 'cajero'].includes(nuevoRol)) {
        return res.status(400).json({
          success: false,
          error: 'Rol no válido'
        });
      }
      
      if (nuevoRol === 'admin' && !req.body.punto_id) {
        return res.status(400).json({
          success: false,
          error: 'Para crear un admin debe especificar un punto'
        });
      }
      
      puntoId = req.body.punto_id || null;
      
    // Si el creador es ADMIN
    } else if (creador.rol === 'admin') {
      if (!['colaborador', 'cajero'].includes(nuevoRol)) {
        return res.status(403).json({
          success: false,
          error: 'Solo puedes crear colaboradores o cajeros'
        });
      }
      
      // Generar código automático si no se proporciona
      if (!codigo) {
        const count = await User.countDocuments({
          punto_id: creador.punto_id,
          rol: nuevoRol
        });
        
        const punto = await Punto.findById(creador.punto_id);
        const puntoCodigo = punto ? punto.nombre.substring(0, 3).toUpperCase() : 'PTO';
        
        codigoGenerado = `${puntoCodigo}-${nuevoRol.substring(0, 3).toUpperCase()}-${(count + 1).toString().padStart(3, '0')}`;
      }
      
    // Si el creador NO tiene permisos
    } else {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para crear usuarios'
      });
    }
    
    // 4. VALIDAR CÓDIGO
    if (!codigoGenerado) {
      return res.status(400).json({
        success: false,
        error: 'Código es requerido'
      });
    }
    
    // 5. VERIFICAR SI EL CÓDIGO YA EXISTE
    const existingUser = await User.findOne({ codigo: codigoGenerado });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un usuario con este código'
      });
    }
    
    // 6. VALIDAR PUNTO PARA NO-SUPERADMIN
    if (nuevoRol !== 'superadmin' && !puntoId) {
      return res.status(400).json({
        success: false,
        error: 'Los usuarios no-superadmin deben tener un punto asignado'
      });
    }
    
    // 7. CREAR NUEVO USUARIO - ¡CORREGIDO!
    const userData = {
      codigo: codigoGenerado,
      nombre,
      password,
      rol: nuevoRol,
      telefono,
      email,
      activo: true,           // ← NUEVO CAMPO (Boolean)
      estado: 'activo',       // ← CAMPO ANTIGUO (para compatibilidad)
      creado_por: creador._id,
      permisos: {
        crear_ordenes: nuevoRol !== 'superadmin',
        registrar_clientes: nuevoRol !== 'superadmin',
        ver_reportes: ['admin', 'superadmin'].includes(nuevoRol),
        gestionar_usuarios: ['admin', 'superadmin'].includes(nuevoRol)
      }
    };
    
    // Agregar punto_id solo si no es superadmin
    if (nuevoRol !== 'superadmin' && puntoId) {
      userData.punto_id = puntoId;
    }
    
    const user = new User(userData);
    await user.save();
    console.log(`✅ Usuario creado: ${user.codigo} (${user.rol})`);
    
    // 8. PREPARAR RESPUESTA
    const responseUser = user.toJSON();
    
    if (user.punto_id) {
      const punto = await Punto.findById(user.punto_id);
      if (punto) {
        responseUser.punto = {
          id: punto._id,
          nombre: punto.nombre,
          direccion: punto.direccion
        };
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: responseUser
    });
    
  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ==================== PERFIL ====================
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    
    const userResponse = user.toJSON();
    
    if (user.punto_id) {
      const punto = await Punto.findById(user.punto_id);
      if (punto) {
        userResponse.punto = {
          id: punto._id,
          nombre: punto.nombre,
          direccion: punto.direccion
        };
        userResponse.punto_nombre = punto.nombre;
      }
    }
    
    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('❌ Error en getProfile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ==================== LISTAR USUARIOS ====================
const getUsers = async (req, res) => {
  try {
    let query = {};
    
    // Filtrar por punto si no es superadmin
    if (req.user.rol !== 'superadmin' && req.user.punto_id) {
      query.punto_id = req.user.punto_id;
    }
    
    // Filtrar solo usuarios activos (ambos campos)
    query.$or = [
      { activo: true },
      { estado: 'activo' }
    ];
    
    const users = await User.find(query)
      .populate('punto_id', 'nombre direccion')
      .populate('creado_por', 'codigo nombre')
      .sort({ fecha_registro: -1 });
    
    console.log(`📊 Usuarios encontrados: ${users.length}`);
    
    res.json({
      success: true,
      count: users.length,
      users: users.map(user => user.toJSON())
    });
  } catch (error) {
    console.error('❌ Error en getUsers:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  getUsers
};