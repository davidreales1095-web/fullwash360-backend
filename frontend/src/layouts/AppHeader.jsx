import React, { useState, useEffect } from 'react';
import { Layout, Breadcrumb, Avatar, Dropdown, Badge, Button, Space, Typography, Spin } from 'antd';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  BellOutlined, 
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  HomeOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './header.css';

const { Header } = Layout;
const { Text } = Typography;

const AppHeader = ({ collapsed, toggleSidebar, isMobile, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const notifications = 3;
  
  // Estados para las estadísticas
  const [estadisticas, setEstadisticas] = useState({ 
    ordenesHoy: 0, 
    ingresosHoy: 0 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Función para cargar estadísticas
  const fetchEstadisticas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await axios.get(
        'https://fullwash360-backend.vercel.app/api/ordenes/estadisticas',
        token ? {
          headers: {
            Authorization: `Bearer ${token}`
          }
        } : {}
      );
      
      // Ajusta estos campos según lo que devuelva tu API
      // Posibles nombres: ordenesHoy, ingresosHoy, totalOrdenesHoy, totalIngresosHoy, etc.
      setEstadisticas({
        ordenesHoy: response.data.ordenesHoy || response.data.totalOrdenesHoy || 0,
        ingresosHoy: response.data.ingresosHoy || response.data.totalIngresosHoy || 0
      });
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
      setError('Error al cargar datos');
      // Mantener los últimos datos si existen
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    fetchEstadisticas();
    
    // Actualizar cada 2 minutos (120000 ms)
    const interval = setInterval(fetchEstadisticas, 120000);
    return () => clearInterval(interval);
  }, []);

  // Función para formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Función para formatear hora de actualización
  const formatUpdateTime = (date) => {
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Generar breadcrumbs desde la ruta actual
  const getBreadcrumbs = () => {
    const pathSnippets = location.pathname.split('/').filter(i => i);
    
    const breadcrumbItems = [
      {
        title: (
          <>
            <HomeOutlined />
            <span style={{ marginLeft: '4px' }}>Inicio</span>
          </>
        ),
        onClick: () => navigate('/dashboard'),
      },
    ];

    const routeNames = {
      'dashboard': 'Dashboard',
      'ordenes': 'Órdenes',
      'nueva': 'Nueva Orden',
      'pendientes': 'Pendientes de Pago',
      'activas': 'Órdenes Activas',
      'reporte': 'Reporte Diario',
      'clientes': 'Clientes',
      'vehiculos': 'Vehículos',
      'lavadores': 'Lavadores',
      'usuarios': 'Usuarios',
      'configuracion': 'Configuración',
      'reportes': 'Reportes',
    };

    let currentPath = '';
    pathSnippets.forEach((snippet, index) => {
      currentPath += `/${snippet}`;
      const title = routeNames[snippet] || snippet.charAt(0).toUpperCase() + snippet.slice(1);
      
      breadcrumbItems.push({
        title: index === pathSnippets.length - 1 ? (
          <Text strong>{title}</Text>
        ) : (
          <span 
            style={{ cursor: 'pointer', color: 'var(--primary)' }}
            onClick={() => navigate(currentPath)}
          >
            {title}
          </span>
        ),
      });
    });

    return breadcrumbItems;
  };

  const breadcrumbItems = getBreadcrumbs();

  // Items del dropdown de usuario
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Mi Perfil',
      onClick: () => navigate('/perfil'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Configuración',
      onClick: () => navigate('/configuracion'),
    },
    {
      key: 'help',
      icon: <QuestionCircleOutlined />,
      label: 'Ayuda y Soporte',
      onClick: () => navigate('/ayuda'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesión',
      danger: true,
      onClick: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      },
    },
  ];

  // Items del dropdown de notificaciones
  const notificationItems = [
    {
      key: '1',
      label: (
        <div className="notification-item">
          <div className="notification-icon success">
            <BellOutlined />
          </div>
          <div className="notification-content">
            <div className="notification-title">Nueva orden creada</div>
            <div className="notification-time">Hace 5 minutos</div>
          </div>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <div className="notification-item">
          <div className="notification-icon warning">
            <BellOutlined />
          </div>
          <div className="notification-content">
            <div className="notification-title">Orden pendiente de pago</div>
            <div className="notification-time">Hace 30 minutos</div>
          </div>
        </div>
      ),
    },
    {
      key: '3',
      label: (
        <div className="notification-item">
          <div className="notification-icon info">
            <BellOutlined />
          </div>
          <div className="notification-content">
            <div className="notification-title">Reporte diario listo</div>
            <div className="notification-time">Hace 2 horas</div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Header className="app-header">
      <div className="header-left">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleSidebar}
          className="sidebar-toggle"
        />

        <Breadcrumb 
          items={breadcrumbItems}
          className="breadcrumb-container"
          separator={<span style={{ color: 'var(--light-border)' }}>/</span>}
        />
      </div>

      <div className="header-right">
        <Space size="middle">
          {/* Botón de actualización manual */}
          <Button
            type="text"
            icon={<SyncOutlined spin={loading} />}
            onClick={fetchEstadisticas}
            size="small"
            title="Actualizar estadísticas"
            style={{ marginRight: '8px' }}
          />

          {/* Botón de notificaciones */}
          <Dropdown
            menu={{ items: notificationItems }}
            trigger={['click']}
            classNames={{ root: 'notifications-dropdown' }}
            placement="bottomRight"
          >
            <Badge count={notifications} size="small" className="notifications-badge">
              <Button
                type="text"
                icon={<BellOutlined />}
                className="notifications-button"
              />
            </Badge>
          </Dropdown>

          {/* Información rápida del día - AHORA CON DATOS REALES */}
          {!isMobile && (
            <div className="quick-stats">
              <div className="quick-stat">
                <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>
                  Hoy
                  <span style={{ fontSize: '9px', marginLeft: '4px', color: '#999' }}>
                    {formatUpdateTime(lastUpdate)}
                  </span>
                </Text>
                {loading ? (
                  <Spin size="small" style={{ margin: '2px 0' }} />
                ) : error ? (
                  <Text strong style={{ color: 'var(--error)', fontSize: '13px' }}>
                    Error
                  </Text>
                ) : (
                  <Text strong style={{ color: 'var(--success)', fontSize: '14px' }}>
                    {estadisticas.ordenesHoy} órdenes
                  </Text>
                )}
              </div>
              
              <div className="divider" style={{ borderLeft: '1px solid #f0f0f0', height: '30px' }} />
              
              <div className="quick-stat">
                <Text type="secondary" style={{ fontSize: '11px' }}>Ingresos</Text>
                {loading ? (
                  <Spin size="small" style={{ margin: '2px 0' }} />
                ) : error ? (
                  <Text strong style={{ color: 'var(--error)', fontSize: '13px' }}>
                    Error
                  </Text>
                ) : (
                  <Text strong style={{ color: 'var(--primary)', fontSize: '14px' }}>
                    {formatCurrency(estadisticas.ingresosHoy)}
                  </Text>
                )}
              </div>
            </div>
          )}

          {/* Dropdown de usuario */}
          <Dropdown
            menu={{ items: userMenuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <div className="user-dropdown-trigger">
              <Avatar 
                size="default"
                icon={<UserOutlined />}
                style={{ 
                  background: 'var(--gradient-success)',
                  cursor: 'pointer',
                  marginRight: '8px'
                }}
              />
              {!isMobile && user && (
                <div className="user-info">
                  <Text strong style={{ fontSize: '14px' }}>
                    {user?.nombre || 'Usuario'}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {user?.role === 'superadmin' ? 'Super Admin' : 
                     user?.role === 'admin' ? 'Administrador' : 
                     'Colaborador'}
                  </Text>
                </div>
              )}
            </div>
          </Dropdown>
        </Space>
      </div>
    </Header>
  );
};

export default AppHeader;