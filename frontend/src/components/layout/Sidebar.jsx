// frontend/src/components/layout/Sidebar.jsx
import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Menús según rol - CON LAVADORES Y VEHÍCULOS OCULTOS
  const getMenuItems = () => {
    const baseItems = [
      { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    ];

    if (user?.rol === 'superadmin') {
      return [
        ...baseItems,
        { path: '/superadmin/puntos', label: 'Gestión de Puntos', icon: '🏪' },
        { path: '/superadmin/usuarios', label: 'Usuarios Globales', icon: '👥' },
        { path: '/superadmin/reportes', label: 'Reportes Globales', icon: '📈' },
      ];
    }

    if (user?.rol === 'admin') {
      return [
        ...baseItems,
        // Ocultados: { path: '/admin/lavadores', label: 'Lavadores', icon: '👷' },
        // Ocultados: { path: '/admin/vehiculos', label: 'Vehículos', icon: '🚗' },
        { path: '/admin/clientes', label: 'Clientes', icon: '👤' },
        { path: '/admin/ordenes', label: 'Órdenes', icon: '🧾' },
        { path: '/admin/historial', label: 'Historial', icon: '📋' },
        { path: '/admin/comisiones', label: 'Comisiones Diarias', icon: '💰' },
        { path: '/admin/reportes', label: 'Reportes', icon: '📊' },
        { path: '/admin/configuracion', label: 'Configuración', icon: '⚙️' },
      ];
    }

    if (user?.rol === 'colaborador') {
      return [
        ...baseItems,
        { path: '/colaborador/clientes', label: 'Registrar Cliente', icon: '👤' },
        { path: '/colaborador/ordenes/nueva', label: 'Nueva Orden', icon: '➕' },
        { path: '/colaborador/ordenes', label: 'Órdenes del Día', icon: '📋' },
      ];
    }

    return baseItems;
  };

  // Obtener todas las rutas posibles para ver qué está activo
  const getAlternativeMenuItems = () => {
    // Esta función devuelve TODOS los ítems del menú para propósitos de depuración
    return [
      { path: '/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/superadmin/puntos', label: 'Gestión de Puntos', icon: '🏪' },
      { path: '/superadmin/usuarios', label: 'Usuarios Globales', icon: '👥' },
      { path: '/superadmin/reportes', label: 'Reportes Globales', icon: '📈' },
      { path: '/admin/lavadores', label: 'Lavadores', icon: '👷' },
      { path: '/admin/vehiculos', label: 'Vehículos', icon: '🚗' },
      { path: '/admin/clientes', label: 'Clientes', icon: '👤' },
      { path: '/admin/ordenes', label: 'Órdenes', icon: '🧾' },
      { path: '/admin/historial', label: 'Historial', icon: '📋' },
      { path: '/admin/comisiones', label: 'Comisiones Diarias', icon: '💰' },
      { path: '/admin/reportes', label: 'Reportes', icon: '📊' },
      { path: '/admin/configuracion', label: 'Configuración', icon: '⚙️' },
      { path: '/colaborador/clientes', label: 'Registrar Cliente', icon: '👤' },
      { path: '/colaborador/ordenes/nueva', label: 'Nueva Orden', icon: '➕' },
      { path: '/colaborador/ordenes', label: 'Órdenes del Día', icon: '📋' },
    ];
  };

  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-xl">🚗</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">FullWash 360</h1>
            <p className="text-xs text-gray-400">
              {user?.rol === 'superadmin' && 'Super Admin'}
              {user?.rol === 'admin' && `Admin - ${user.punto_nombre || 'Punto'}`}
              {user?.rol === 'colaborador' && `Colaborador - ${user.punto_nombre || 'Punto'}`}
            </p>
          </div>
        </div>
      </div>

      {/* Menú de navegación */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Navegación
          </h3>
          <ul className="space-y-1">
            {getMenuItems().map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`
                  }
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Sección de información (opcional) */}
        <div className="mt-8 p-3 bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-300 mb-1">💡 <strong>Nota:</strong></p>
          <p className="text-xs text-gray-400">
            Las secciones de <strong>Lavadores</strong> y <strong>Vehículos</strong> han sido ocultadas del menú principal.
            Puedes acceder a ellas desde:
          </p>
          <ul className="text-xs text-gray-400 mt-2 pl-4 space-y-1">
            <li>• <strong>Órdenes:</strong> Crear una nueva orden para asignar lavador</li>
            <li>• <strong>Clientes:</strong> Registrar vehículos por cliente</li>
            <li>• <strong>Reportes:</strong> Ver estadísticas de lavadores</li>
          </ul>
        </div>
      </nav>

      {/* Perfil usuario */}
      <div className="p-4 border-t border-gray-800 bg-gray-900">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold">
              {user?.nombre?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user?.nombre || user?.username}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.rol}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg transition font-medium"
        >
          <span>🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;