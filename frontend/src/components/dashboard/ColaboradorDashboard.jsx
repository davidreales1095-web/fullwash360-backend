// frontend/src/components/dashboard/ColaboradorDashboard.jsx
import Layout from '../layout/Layout';

const ColaboradorDashboard = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Panel de Operaciones</h1>
            <p className="text-gray-600">Bienvenido al sistema de gestión de lavados</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            + Registrar Cliente
          </button>
        </div>

        {/* Estadísticas personales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Mis Órdenes Hoy</p>
                <p className="text-3xl font-bold mt-2">0</p>
                <p className="text-sm text-gray-500 mt-1">Completadas: 0</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-blue-600">📋</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Ingresos Generados</p>
                <p className="text-3xl font-bold mt-2">$0</p>
                <p className="text-sm text-gray-500 mt-1">Comisión: $0</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-green-600">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Clientes Registrados</p>
                <p className="text-3xl font-bold mt-2">0</p>
                <p className="text-sm text-gray-500 mt-1">Total registrados</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-purple-600">👤</span>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white rounded-xl shadow border p-6">
          <h2 className="text-xl font-semibold mb-4">Acciones Principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition text-left">
              <span className="text-2xl mb-2 block">👤</span>
              <h3 className="font-medium">Registrar Cliente</h3>
              <p className="text-sm text-gray-500">Nuevo cliente y vehículo</p>
            </button>
            <button className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition text-left">
              <span className="text-2xl mb-2 block">🧾</span>
              <h3 className="font-medium">Crear Orden</h3>
              <p className="text-sm text-gray-500">Nuevo servicio de lavado</p>
            </button>
            <button className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition text-left">
              <span className="text-2xl mb-2 block">📋</span>
              <h3 className="font-medium">Ver Órdenes</h3>
              <p className="text-sm text-gray-500">Órdenes activas del día</p>
            </button>
          </div>
        </div>

        {/* Órdenes pendientes */}
        <div className="bg-white rounded-xl shadow border p-6">
          <h2 className="text-xl font-semibold mb-4">Órdenes Pendientes (0)</h2>
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl mb-4 block">📭</span>
            <p>No hay órdenes pendientes en este momento</p>
            <button className="mt-4 text-blue-600 hover:text-blue-800">
              Crear primera orden →
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ColaboradorDashboard;