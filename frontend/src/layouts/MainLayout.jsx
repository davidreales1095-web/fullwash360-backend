import React, { useState, useEffect } from 'react';
import { Layout, Spin, Drawer } from 'antd';
import { useLocation, Navigate } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import { useAuth } from '../hooks/useAuth';
import '../styles/theme.css';
import './layout.css';

const { Content } = Layout;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  // Función para alternar la barra lateral
  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarVisible(!sidebarVisible);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const closeMobileSidebar = () => {
    setSidebarVisible(false);
  };

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && !collapsed) {
        setCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Simular carga inicial
    const timer = setTimeout(() => setLoading(false), 300);

    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timer);
    };
  }, [collapsed]);

  // Cerrar sidebar en móvil cuando cambia de ruta
  useEffect(() => {
    if (isMobile && sidebarVisible) {
      setSidebarVisible(false);
    }
  }, [location.pathname, isMobile, sidebarVisible]);

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <Spin size="large" />
          <div className="loading-text">
            <h3 style={{ marginBottom: '10px' }}>FullWash 360</h3>
            <p>Cargando sistema de gestión...</p>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay usuario, redirigir al login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <Layout className="main-layout">
      {/* Sidebar para Desktop */}
      {!isMobile && (
        <AppSidebar 
          collapsed={collapsed}
          onCollapse={toggleSidebar}
          user={user}
        />
      )}

      {/* Drawer para Mobile */}
      {isMobile && (
        <Drawer
          placement="left"
          onClose={closeMobileSidebar}
          open={sidebarVisible}
          width={250}
          bodyStyle={{ padding: 0 }}
          headerStyle={{ display: 'none' }}
          className="mobile-sidebar-drawer"
        >
          <AppSidebar 
            collapsed={false}
            isMobile={true}
            onClose={closeMobileSidebar}
            user={user}
          />
        </Drawer>
      )}

      {/* Overlay para mobile sidebar */}
      {isMobile && sidebarVisible && (
        <div 
          className="sidebar-overlay" 
          onClick={closeMobileSidebar}
        />
      )}

      <Layout className="site-layout">
        {/* Header */}
        <AppHeader 
          collapsed={isMobile ? true : collapsed}
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
          user={user}
        />

        {/* Contenido Principal */}
        <Content className="main-content animate-fade-in">
          <div className="content-wrapper">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;