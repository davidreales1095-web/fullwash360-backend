import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Typography, Badge, Tooltip, Spin } from 'antd';
import { 
  DashboardOutlined, 
  CarOutlined, 
  UserOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  ScheduleOutlined,
  HistoryOutlined,
  BellOutlined,
  PlusCircleOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_URLS } from '../config/api'; // ✅ MOVIDO AL PRINCIPIO CON LOS DEMÁS IMPORTS
import './sidebar.css';

const { Sider } = Layout;
const { Text } = Typography;

const AppSidebar = ({ collapsed, isMobile, onClose, onCollapse, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeKey, setActiveKey] = useState('/dashboard');
  const [notifications] = useState(3);
  
  const [ordenesActivasCount, setOrdenesActivasCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(false);

  const cargarConteoOrdenesActivas = async () => {
    try {
      setLoadingCount(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      // ✅ API_URLS YA ESTÁ DISPONIBLE - NO NECESITA IMPORT DENTRO DE FUNCIÓN
      const response = await fetch(`${API_URLS.ORDERS}/activas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const total = data.ordenes?.length || 0;
          setOrdenesActivasCount(total);
        }
      }
    } catch (error) {
      console.error('Error cargando conteo:', error);
    } finally {
      setLoadingCount(false);
    }
  };

  useEffect(() => {
    if (user) {
      cargarConteoOrdenesActivas();
      const interval = setInterval(cargarConteoOrdenesActivas, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    setActiveKey(location.pathname);
  }, [location.pathname]);

  const getMenuItems = () => {
    const commonItems = [
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
        onClick: () => {
          navigate('/dashboard');
          if (isMobile && onClose) onClose();
        },
      },
      {
        key: '/ordenes/nueva',
        icon: <PlusCircleOutlined />,
        label: 'Nueva Orden',
        onClick: () => {
          navigate('/ordenes/nueva');
          if (isMobile && onClose) onClose();
        },
      },
      {
        key: '/ordenes/activas',
        icon: <ScheduleOutlined />,
        label: (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span>Órdenes Activas</span>
            {loadingCount ? (
              <Spin size="small" style={{ marginLeft: 8 }} />
            ) : (
              <Badge 
                count={ordenesActivasCount} 
                size="small" 
                style={{ 
                  backgroundColor: ordenesActivasCount > 0 ? '#ff4d4f' : '#52c41a',
                  marginLeft: 8,
                  fontSize: '10px',
                  fontWeight: 'bold'
                }} 
              />
            )}
          </div>
        ),
        onClick: () => {
          navigate('/ordenes/activas');
          if (isMobile && onClose) onClose();
        },
      },
      {
        key: '/ordenes/historial',
        icon: <HistoryOutlined />,
        label: 'Historial',
        onClick: () => {
          navigate('/ordenes/historial');
          if (isMobile && onClose) onClose();
        },
      },
      {
        key: '/clientes',
        icon: <UserOutlined />,
        label: 'Clientes',
        onClick: () => {
          navigate('/clientes');
          if (isMobile && onClose) onClose();
        },
      },
      {
        key: '/vehiculos',
        icon: <CarOutlined />,
        label: 'Vehículos',
        onClick: () => {
          navigate('/vehiculos');
          if (isMobile && onClose) onClose();
        },
      },
    ];

    const adminItems = [
      {
        key: '/reportes',
        icon: <BarChartOutlined />,
        label: 'Reportes',
        onClick: () => {
          navigate('/reportes');
          if (isMobile && onClose) onClose();
        },
      },
      {
        key: '/lavadores',
        icon: <TeamOutlined />,
        label: 'Lavadores',
        onClick: () => {
          navigate('/lavadores');
          if (isMobile && onClose) onClose();
        },
      },
      {
        key: '/comisiones-diarias',
        icon: <DollarOutlined />,
        label: 'Comisiones Diarias',
        onClick: () => {
          navigate('/comisiones-diarias');
          if (isMobile && onClose) onClose();
        },
      },
    ];

    const superAdminItems = [
      {
        key: '/usuarios',
        icon: <TeamOutlined />,
        label: 'Usuarios',
        onClick: () => {
          navigate('/usuarios');
          if (isMobile && onClose) onClose();
        },
      },
      {
        key: '/configuracion',
        icon: <SettingOutlined />,
        label: 'Configuración',
        onClick: () => {
          navigate('/configuracion');
          if (isMobile && onClose) onClose();
        },
      },
    ];

    let items = [...commonItems];

    if (user?.role === 'admin' || user?.role === 'superadmin') {
      items = [...items, ...adminItems];
    }

    if (user?.role === 'superadmin') {
      items = [...items, ...superAdminItems];
    }

    items.push({
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesión',
      danger: true,
      onClick: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        if (isMobile && onClose) onClose();
      },
    });

    return items;
  };

  const menuItems = getMenuItems();

  const handleMenuClick = (e) => {
    setActiveKey(e.key);
  };

  const menuConfig = menuItems.map(item => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
    onClick: item.onClick,
    danger: item.danger,
  }));

  return (
    <Sider
      width={250}
      collapsedWidth={isMobile ? 0 : 80}
      collapsed={collapsed}
      trigger={null}
      collapsible
      className="app-sidebar"
      style={{
        background: 'var(--gradient-sidebar)',
        boxShadow: 'var(--shadow-sidebar)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="sidebar-header">
          {!collapsed ? (
            <div className="logo-container" onClick={() => navigate('/dashboard')}>
              <div className="logo-icon">
                <CarOutlined style={{ fontSize: '24px', color: 'white' }} />
              </div>
              <div className="logo-text">
                <Text strong className="logo-title">
                  FullWash 360
                </Text>
                <Text className="logo-subtitle">
                  Sistema Profesional
                </Text>
              </div>
            </div>
          ) : (
            <div className="logo-collapsed" onClick={() => navigate('/dashboard')}>
              <div className="logo-icon-small">
                <CarOutlined style={{ fontSize: '20px', color: 'white' }} />
              </div>
            </div>
          )}
          
          {!isMobile && onCollapse && (
            <div className="collapse-trigger" onClick={onCollapse}>
              {collapsed ? 
                <MenuUnfoldOutlined className="trigger-icon" /> : 
                <MenuFoldOutlined className="trigger-icon" />
              }
            </div>
          )}
        </div>

        {!collapsed && user && (
          <div className="user-profile">
            <Badge dot status="success" offset={[-5, 40]}>
              <Avatar 
                size={64} 
                className="user-avatar"
                style={{ background: 'var(--gradient-success)' }}
                icon={<UserOutlined />}
              />
            </Badge>
            <div className="user-info">
              <Text strong className="user-name">
                {user?.nombre || 'Usuario'}
              </Text>
              <Text className="user-role">
                {user?.role === 'superadmin' ? 'Super Admin' : 
                 user?.role === 'admin' ? 'Administrador' : 
                 'Colaborador'}
              </Text>
              <Text className="user-email">
                {user?.email || user?.username || 'usuario@fullwash.com'}
              </Text>
            </div>
          </div>
        )}

        {collapsed && !isMobile && user && (
          <div className="user-profile-collapsed">
            <Tooltip title={`${user?.nombre || 'Usuario'} - ${user?.role || 'Colaborador'}`} placement="right">
              <Avatar 
                size={40} 
                className="user-avatar-small"
                style={{ background: 'var(--gradient-success)' }}
                icon={<UserOutlined />}
              />
            </Tooltip>
          </div>
        )}

        <div className="sidebar-menu-container" style={{ flex: 1, overflowY: 'auto' }}>
          <Menu
            mode="inline"
            selectedKeys={[activeKey]}
            items={menuConfig}
            className="sidebar-menu"
            theme="dark"
            onClick={handleMenuClick}
          />
        </div>

        {!collapsed && (
          <div className="sidebar-footer">
            <div className="system-status">
              <Badge status="success" text="Sistema Activo" />
            </div>
            <div className="notifications-badge">
              <Badge count={notifications} size="small">
                <BellOutlined style={{ color: 'var(--secondary-light)', fontSize: '16px' }} />
              </Badge>
            </div>
          </div>
        )}
      </div>
    </Sider>
  );
};

export default AppSidebar;