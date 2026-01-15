// frontend/src/components/layout/Layout.jsx
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);

  // Verificar si user existe antes de usarlo
  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '3px solid #0ea5e9',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#64748b' }}>Cargando...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    },
    header: {
      background: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      padding: '16px 24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    headerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      textDecoration: 'none'
    },
    logoIcon: {
      width: '40px',
      height: '40px',
      background: '#0ea5e9',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '20px'
    },
    logoText: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1f2937'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    userAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: '#0ea5e9',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold'
    },
    main: {
      flex: 1,
      padding: '24px',
      background: '#f9fafb'
    },
    footer: {
      background: '#ffffff',
      borderTop: '1px solid #e5e7eb',
      padding: '16px 24px',
      textAlign: 'center',
      color: '#6b7280',
      fontSize: '14px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>🚗</div>
            <span style={styles.logoText}>FullWash 360</span>
          </div>
          
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>
              {user?.nombre?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </div>
            <div>
              <div style={{ fontWeight: '500', color: '#1f2937' }}>
                {user?.nombre || user?.username}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                {user?.rol === 'superadmin' && 'Super Admin'}
                {user?.rol === 'admin' && 'Administrador'}
                {user?.rol === 'colaborador' && 'Colaborador'}
              </div>
            </div>
            <button
              onClick={logout}
              style={{
                marginLeft: '16px',
                padding: '8px 16px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main style={styles.main}>
        {children}
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          © {new Date().getFullYear()} FullWash 360 - Sistema de Gestión • v1.0.0
        </div>
      </footer>
    </div>
  );
};

export default Layout;