// frontend/src/components/dashboard/SuperAdminDashboard.jsx
import Layout from '../layout/Layout';

const SuperAdminDashboard = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Panel de Super Admin</h1>
            <p className="text-gray-600">Gestión global de todos los puntos FullWash</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            + Nuevo Punto
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Puntos</p>
                <p className="text-3xl font-bold mt-2">1</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-blue-600">🏪</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Usuarios</p>
                <p className="text-3xl font-bold mt-2">3</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-green-600">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Ingresos Totales</p>
                <p className="text-3xl font-bold mt-2">$0</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-yellow-600">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Órdenes Totales</p>
                <p className="text-3xl font-bold mt-2">0</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-purple-600">🧾</span>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white rounded-xl shadow border p-6">
          <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition text-left">
              <span className="text-2xl mb-2 block">🏪</span>
              <h3 className="font-medium">Crear Nuevo Punto</h3>
              <p className="text-sm text-gray-500">Registrar un nuevo lavadero</p>
            </button>
            <button className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition text-left">
              <span className="text-2xl mb-2 block">👥</span>
              <h3 className="font-medium">Asignar Administrador</h3>
              <p className="text-sm text-gray-500">Designar admin para un punto</p>
            </button>
            <button className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition text-left">
              <span className="text-2xl mb-2 block">📈</span>
              <h3 className="font-medium">Ver Reportes Globales</h3>
              <p className="text-sm text-gray-500">Estadísticas de todos los puntos</p>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SuperAdminDashboard;