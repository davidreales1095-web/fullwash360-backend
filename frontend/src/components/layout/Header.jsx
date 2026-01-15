// frontend/src/components/layout/Header.jsx
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Header = ({ toggleSidebar }) => {
  const { user } = useContext(AuthContext);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <span className="text-2xl">☰</span>
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {getWelcomeMessage(user?.rol)}
            </h2>
            <p className="text-sm text-gray-600">
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
            <span className="text-gray-600">📍</span>
            <span className="font-medium">
              {user?.punto_nombre || 'Sede Central'}
            </span>
          </div>
          
          <div className="relative">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
              {user?.nombre?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const getWelcomeMessage = (rol) => {
  const hour = new Date().getHours();
  let greeting = '';

  if (hour < 12) greeting = 'Buenos días';
  else if (hour < 19) greeting = 'Buenas tardes';
  else greeting = 'Buenas noches';

  switch (rol) {
    case 'superadmin': return `${greeting}, Super Admin`;
    case 'admin': return `${greeting}, Administrador`;
    case 'colaborador': return `${greeting}, Colaborador`;
    default: return `${greeting}`;
  }
};

export default Header;