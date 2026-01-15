import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/layout/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';

// ✅ SOLO LAS RUTAS ESENCIALES DE ÓRDENES
import NuevaOrden from './pages/ordenes/NuevaOrden';
import OrdenPendiente from './pages/ordenes/OrdenPendiente';
import OrdenesActivas from './pages/ordenes/OrdenesActivas';
import HistorialOrdenes from './pages/ordenes/HistorialOrdenes';

// Importar páginas de gestión
import Clientes from './pages/Clientes';
import CrearCliente from './pages/clientes/CrearCliente';
import Vehiculos from './pages/Vehiculos';

// ✅ NUEVAS RUTAS: LAVADORES Y COMISIONES
import LavadoresPage from './pages/lavadores';
import ComisionesDiarias from './components/ComisionesDiarias';
import DetalleComisionesLavador from './components/DetalleComisionesLavador';

// Importar el Layout
import MainLayout from './layouts/MainLayout';

// Importar el tema CSS
import './styles/theme.css';

// Página de bienvenida
const WelcomePage = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#0c4a6e', marginBottom: '20px' }}>
          🚗 FullWash 360 - Sistema de Gestión
        </h1>

        <div style={{ background: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '15px' }}>
            🎯 ELIGE TU DASHBOARD
          </h2>
          <p style={{ color: '#64748b', marginBottom: '20px' }}>
            Selecciona la versión que prefieras usar:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
            <div style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)', color: 'white', padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>👑 SuperAdmin</h3>
              <p style={{ fontSize: '14px', opacity: 0.9 }}>SUPER001 / super123</p>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', color: 'white', padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>⚙️ Admin</h3>
              <p style={{ fontSize: '14px', opacity: 0.9 }}>ADMIN001 / admin123</p>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white', padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>👷 Colaborador</h3>
              <p style={{ fontSize: '14px', opacity: 0.9 }}>COL001 / colab123</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '25px' }}>
            <Link to="/login" style={{ background: '#1890ff', color: 'white', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: '500', display: 'inline-block', textAlign: 'center' }}>
              🔐 Ir al Login
            </Link>
            <Link to="/dashboard" style={{ background: '#52c41a', color: 'white', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: '500', display: 'inline-block', textAlign: 'center' }}>
              📊 Dashboard PRINCIPAL
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Página 404
const NotFoundPage = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', padding: '20px' }}>
      <div style={{ textAlign: 'center', maxWidth: '500px', padding: '40px', background: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ fontSize: '80px', marginBottom: '20px' }}>🔍</div>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#0c4a6e', marginBottom: '10px' }}>404 - Página no encontrada</h1>
        <p style={{ color: '#64748b', marginBottom: '30px', fontSize: '16px' }}>La página que estás buscando no existe.</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" style={{ background: '#1890ff', color: 'white', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: '500', display: 'inline-block' }}>🏠 Inicio</Link>
          <Link to="/dashboard" style={{ background: '#52c41a', color: 'white', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: '500', display: 'inline-block' }}>📊 Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

// Placeholder para rutas en desarrollo
const PlaceholderPage = ({ title }) => {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>{title}</h1>
      <div style={{ background: 'white', borderRadius: '12px', padding: '60px 20px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🚧</div>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>Módulo en Desarrollo</h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>Este módulo está siendo desarrollado y estará disponible pronto.</p>
        <Link to="/dashboard" style={{ background: '#1890ff', color: 'white', padding: '10px 20px', borderRadius: '6px', textDecoration: 'none', fontWeight: '500', display: 'inline-block' }}>Volver al Dashboard</Link>
      </div>
    </div>
  );
};

// Wrapper con MainLayout
const FullLayout = ({ children }) => (
  <PrivateRoute>
    <MainLayout>
      {children}
    </MainLayout>
  </PrivateRoute>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/dashboard" element={<FullLayout><Dashboard /></FullLayout>} />

          {/* Órdenes */}
          <Route path="/ordenes/nueva" element={<FullLayout><NuevaOrden /></FullLayout>} />
          <Route path="/ordenes/:id/cobrar" element={<FullLayout><OrdenPendiente /></FullLayout>} />
          <Route path="/ordenes/activas" element={<FullLayout><OrdenesActivas /></FullLayout>} />
          <Route path="/ordenes/historial" element={<FullLayout><HistorialOrdenes /></FullLayout>} />

          {/* Clientes */}
          <Route path="/clientes" element={<FullLayout><Clientes /></FullLayout>} />
          <Route path="/clientes/nuevo" element={<FullLayout><CrearCliente /></FullLayout>} />

          {/* Vehículos */}
          <Route path="/vehiculos" element={<FullLayout><Vehiculos /></FullLayout>} />

          {/* Lavadores */}
          <Route path="/lavadores" element={<FullLayout><LavadoresPage /></FullLayout>} />
          
          {/* ✅ NUEVAS RUTAS PARA COMISIONES */}
          <Route path="/comisiones-diarias" element={<FullLayout><ComisionesDiarias /></FullLayout>} />
          <Route path="/lavadores/:id/comisiones" element={<FullLayout><DetalleComisionesLavador /></FullLayout>} />

          {/* Placeholder para otras páginas */}
          <Route path="/reportes" element={<FullLayout><PlaceholderPage title="📊 Reportes" /></FullLayout>} />
          <Route path="/configuracion" element={<FullLayout><PlaceholderPage title="⚙️ Configuración" /></FullLayout>} />
          <Route path="/usuarios" element={<FullLayout><PlaceholderPage title="👥 Usuarios" /></FullLayout>} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;