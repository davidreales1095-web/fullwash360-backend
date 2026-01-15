// frontend/src/pages/Unauthorized.jsx
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Acceso No Autorizado</h1>
        <p className="text-gray-600 mb-6">
          No tienes permisos para acceder a esta página.
        </p>
        <Link
          to="/dashboard"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;