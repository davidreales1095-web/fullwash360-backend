// frontend/src/components/dashboard/AdminDashboard.jsx
import Layout from '../layout/Layout';

const AdminDashboard = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Panel Administrativo</h1>
            <p className="text-gray-600">Gestión del punto: Sede Central</p>
          </div>
          <div className="flex space-x-3">
            <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition">
              Reporte Diario
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              + Nueva Orden
            </button>
          </div>
        </div>

        {/* Estadísticas del punto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Órdenes Hoy</p>
                <p className="text-3xl font-bold mt-2">0</p>
                <p className="text-sm text-gray-500 mt-1">+0% vs ayer</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-blue-600">📋</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Ingresos Hoy</p>
                <p className="text-3xl font-bold mt-2">$0</p>
                <p className="text-sm text-gray-500 mt-1">+0% vs ayer</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-green-600">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Clientes Activos</p>
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
          <h2 className="text-xl font-semibold mb-4">Gestión del Punto</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition text-left">
              <span className="text-2xl mb-2 block">👥</span>
              <h3 className="font-medium">Colaboradores</h3>
              <p className="text-sm text-gray-500">Gestionar personal</p>
            </button>
            <button className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition text-left">
              <span className="text-2xl mb-2 block">👤</span>
              <h3 className="font-medium">Clientes</h3>
              <p className="text-sm text-gray-500">Ver y editar clientes</p>
            </button>
            <button className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition text-left">
              <span className="text-2xl mb-2 block">🧾</span>
              <h3 className="font-medium">Órdenes</h3>
              <p className="text-sm text-gray-500">Crear y gestionar</p>
            </button>
            <button className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition text-left">
              <span className="text-2xl mb-2 block">⚙️</span>
              <h3 className="font-medium">Configuración</h3>
              <p className="text-sm text-gray-500">Precios y horarios</p>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;