import React, { useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  Layout, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Button, 
  Typography, 
  Space,
  Avatar,
  Badge,
  Tag,
  Progress,
  Spin,
  message,
  Grid,
  Tooltip
} from 'antd';
import { 
  DashboardOutlined, 
  UserOutlined, 
  CarOutlined,
  DollarOutlined,
  PlusOutlined,
  FileTextOutlined,
  BarChartOutlined,
  LogoutOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  RocketOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
  UserAddOutlined,
  ShoppingOutlined,
  SafetyCertificateOutlined,
  BankOutlined,
  EnvironmentOutlined,
  StarOutlined,
  FireOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ordenesApi from '../api/ordenesApi';
import { formatCurrency } from '../utils/formatCurrency';

const { Title, Text } = Typography;
const { Header, Content } = Layout;
const { useBreakpoint } = Grid;

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const refreshInterval = useRef(null);

  // Cargar estadísticas al inicio y cada 30 segundos
  useEffect(() => {
    cargarEstadisticas();
    
    // Auto-refresh cada 30 segundos
    refreshInterval.current = setInterval(() => {
      if (!loading && document.visibilityState === 'visible') {
        cargarEstadisticas(false);
      }
    }, 30000);
    
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [user]);

  const cargarEstadisticas = async (showMessage = false) => {
    setLoading(true);
    try {
      console.log('📊 [Dashboard] Cargando estadísticas reales...');
      
      // Si el usuario tiene un punto_id, pasarlo como parámetro
      const puntoId = user?.punto_id || null;
      const response = await ordenesApi.obtenerEstadisticas(puntoId);
      
      console.log('📦 [Dashboard] Respuesta de estadísticas:', response);
      
      if (response && response.success) {
        // Si la respuesta tiene modo_demo, significa que estamos usando datos de ejemplo
        if (response.modo_demo) {
          setUsingMockData(true);
          console.log('⚠️ [Dashboard] Usando datos de ejemplo (modo demo)');
        } else {
          setUsingMockData(false);
          console.log('✅ [Dashboard] Usando datos reales del backend');
        }
        
        // Establecer los stats que vienen en response.data.stats
        setStats(response.data.stats);
        
        if (showMessage) {
          message.success(
            response.modo_demo 
              ? 'Datos actualizados (modo demo)' 
              : 'Datos actualizados en tiempo real'
          );
        }
      } else {
        throw new Error('Respuesta no exitosa del servidor');
      }
    } catch (error) {
      console.error('❌ [Dashboard] Error al cargar estadísticas:', error);
      
      // En caso de error, intentar usar datos de ejemplo del API
      setUsingMockData(true);
      
      // El API ya devuelve datos de ejemplo estructurados, así que no necesitamos crear unos aquí
      // Simplemente mostramos un mensaje
      message.warning('Mostrando datos de ejemplo (error del servidor)');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRefresh = () => {
    cargarEstadisticas(true);
  };

  // Tarjetas de acción rápida
  const accionesRapidas = [
    {
      title: 'Nueva Orden',
      description: 'Crear orden de lavado',
      icon: <PlusOutlined />,
      color: '#1890ff',
      gradient: 'linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)',
      path: '/ordenes/nueva',
      roles: ['admin', 'superadmin', 'colaborador']
    },
    {
      title: 'Crear Cliente',
      description: 'Registrar nuevo cliente',
      icon: <UserAddOutlined />,
      color: '#13c2c2',
      gradient: 'linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)',
      path: '/clientes/nuevo',
      roles: ['admin', 'superadmin']
    },
    {
      title: 'Órdenes Activas',
      description: 'Gestionar pendientes',
      icon: <FileTextOutlined />,
      color: '#52c41a',
      gradient: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
      path: '/ordenes',
      roles: ['admin', 'superadmin', 'colaborador']
    },
    {
      title: 'Cobrar Órdenes',
      description: 'Cobrar e imprimir',
      icon: <DollarOutlined />,
      color: '#fa8c16',
      gradient: 'linear-gradient(135deg, #fa8c16 0%, #ffc53d 100%)',
      path: '/ordenes?estado=pendiente',
      roles: ['admin', 'superadmin']
    }
  ];

  // Filtrar acciones según rol
  const accionesPermitidas = accionesRapidas.filter(accion => 
    accion.roles.includes(user?.role?.toLowerCase())
  );

  // Calcular porcentaje para la barra de progreso de órdenes (meta: 30 órdenes/día)
  const calcularPorcentajeOrdenes = (ordenesHoy) => {
    const meta = 30;
    return Math.min((ordenesHoy / meta) * 100, 100);
  };

  // Formatear hora de última actualización
  const formatearUltimaActualizacion = (timestamp) => {
    if (!timestamp) return 'Nunca';
    const fecha = new Date(timestamp);
    return fecha.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Layout style={{ 
      minHeight: '100vh', 
      background: '#f5f7fa',
      overflow: 'hidden'
    }}>
      {/* HEADER */}
      <Header style={{
        background: 'white',
        padding: screens.xs ? '0 16px' : '0 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #f0f0f0',
        height: '64px',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        {/* Logo y título */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)',
            borderRadius: '12px',
            padding: '8px',
            marginRight: '12px',
          }}>
            <DashboardOutlined style={{ fontSize: '24px', color: 'white' }} />
          </div>
          
          <div>
            <Title level={4} style={{ 
              margin: 0, 
              color: '#1890ff', 
              fontWeight: 700,
              fontSize: screens.xs ? '16px' : '18px'
            }}>
              FullWash 360
            </Title>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Sistema de Gestión
            </Text>
          </div>
        </div>
        
        {/* Panel de usuario */}
        <Space size="middle" align="center">
          <Tooltip title="Actualizar estadísticas">
            <Button 
              type="text" 
              icon={<ReloadOutlined spin={loading} />}
              onClick={handleRefresh}
              loading={loading}
              size="small"
            >
              {screens.xs ? '' : 'Actualizar'}
            </Button>
          </Tooltip>
          
          <Badge dot={user?.role === 'superadmin'} color="gold">
            <Space>
              <Avatar 
                size="large"
                style={{ 
                  background: 'linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)',
                  cursor: 'pointer'
                }}
              >
                {user?.nombre?.charAt(0) || 'U'}
              </Avatar>
              <div>
                <Text strong style={{ display: 'block', fontSize: '14px' }}>
                  {user?.nombre || user?.email}
                </Text>
                <Tag 
                  color={
                    user?.role === 'superadmin' ? 'gold' :
                    user?.role === 'admin' ? 'blue' : 'green'
                  }
                  style={{ margin: 0, fontSize: '11px', fontWeight: 600 }}
                >
                  {user?.role}
                </Tag>
              </div>
            </Space>
          </Badge>
          
          <Button 
            type="text" 
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            size="small"
          >
            {screens.xs ? '' : 'Salir'}
          </Button>
        </Space>
      </Header>

      {/* CONTENIDO PRINCIPAL */}
      <Content style={{ 
        padding: screens.xs ? '16px' : screens.md ? '24px' : '20px',
        width: '100%',
        maxWidth: '100%',
        margin: 0,
        overflowY: 'auto',
        height: 'calc(100vh - 64px)',
        scrollBehavior: 'smooth'
      }}>
        {/* Bienvenida */}
        <Card 
          style={{ 
            marginBottom: screens.xs ? '16px' : '24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            border: 'none'
          }}
          styles={{ 
            body: { padding: screens.xs ? '16px' : '24px' }
          }}
        >
          <Row align="middle" gutter={[24, 24]}>
            <Col xs={24} md={16}>
              <Title level={screens.xs ? 4 : 2} style={{ color: 'white', margin: 0 }}>
                ¡Hola, {user?.nombre || 'Usuario'}! 👋
              </Title>
              <Text style={{ 
                color: 'rgba(255,255,255,0.9)', 
                fontSize: screens.xs ? '14px' : '16px', 
                display: 'block', 
                marginTop: '8px' 
              }}>
                {user?.role === 'superadmin' ? 'Tienes control total del sistema' :
                 user?.role === 'admin' ? 'Gestiona operaciones y reportes' :
                 'Registra órdenes y gana comisiones'}
              </Text>
              
              {/* Indicador de datos reales/mock */}
              <Space style={{ marginTop: '12px' }} wrap>
                {usingMockData ? (
                  <Tag color="warning" icon={<FireOutlined />}>
                    🔧 Modo demostración
                  </Tag>
                ) : (
                  <Tag color="success" icon={<CheckCircleOutlined />}>
                    ✅ Datos en tiempo real
                  </Tag>
                )}
                
                {stats?.timestamp && (
                  <Tag color="blue" icon={<ClockCircleOutlined />}>
                    🕐 Actualizado: {formatearUltimaActualizacion(stats.timestamp)}
                  </Tag>
                )}
              </Space>
              
              <Space style={{ marginTop: '20px' }} wrap>
                <Button 
                  type="primary" 
                  size={screens.xs ? 'middle' : 'large'}
                  icon={<RocketOutlined />}
                  style={{ 
                    background: 'white', 
                    color: '#667eea',
                    fontWeight: 600,
                    height: screens.xs ? '40px' : '48px',
                    padding: screens.xs ? '0 16px' : '0 24px'
                  }}
                  onClick={() => navigate('/ordenes/nueva')}
                >
                  Nueva Orden Express
                </Button>
                
                <Button 
                  type="default" 
                  size={screens.xs ? 'middle' : 'large'}
                  icon={<BarChartOutlined />}
                  style={{ 
                    background: 'rgba(255,255,255,0.1)', 
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.3)',
                    height: screens.xs ? '40px' : '48px',
                    padding: screens.xs ? '0 16px' : '0 24px'
                  }}
                  onClick={handleRefresh}
                  loading={loading}
                >
                  Actualizar
                </Button>
              </Space>
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'center' }}>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                width: '120px',
                height: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
              }}>
                <CarOutlined style={{ fontSize: '60px', color: 'white' }} />
              </div>
              <Text style={{ 
                color: 'rgba(255,255,255,0.9)', 
                marginTop: '12px', 
                display: 'block' 
              }}>
                {stats?.destacados?.tipo_vehiculo_popular?._id 
                  ? `Vehículo más común: ${stats.destacados.tipo_vehiculo_popular._id}` 
                  : 'Sistema de lavado profesional'}
              </Text>
            </Col>
          </Row>
        </Card>

        {/* Acciones rápidas */}
        <Title level={4} style={{ 
          marginBottom: screens.xs ? '12px' : '20px', 
          display: 'flex', 
          alignItems: 'center',
          fontSize: screens.xs ? '16px' : '18px'
        }}>
          <RocketOutlined style={{ marginRight: '10px', color: '#1890ff' }} />
          Acciones Rápidas
        </Title>
        
        <Row gutter={[screens.xs ? 12 : 20, screens.xs ? 12 : 20]} style={{ marginBottom: '30px' }}>
          {accionesPermitidas.map((accion, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={index}>
              <Card
                hoverable
                onClick={() => navigate(accion.path)}
                className="dashboard-card"
                style={{ 
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s',
                  overflow: 'hidden',
                  height: '100%',
                  cursor: 'pointer',
                  background: 'white'
                }}
                styles={{ 
                  body: { 
                    padding: screens.xs ? '16px' : '20px', 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }
                }}
              >
                <div style={{ position: 'relative' }}>
                  <div style={{ 
                    width: screens.xs ? '48px' : '60px',
                    height: screens.xs ? '48px' : '60px',
                    borderRadius: '12px',
                    background: accion.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    fontSize: screens.xs ? '24px' : '28px',
                    color: 'white'
                  }}>
                    {accion.icon}
                  </div>
                </div>
                
                <div style={{ flex: 1 }}>
                  <Title level={5} style={{ 
                    margin: '12px 0 8px 0', 
                    fontWeight: 600,
                    fontSize: screens.xs ? '14px' : '16px',
                    color: '#1890ff'
                  }}>
                    {accion.title}
                  </Title>
                  <Text type="secondary" style={{ 
                    display: 'block', 
                    marginBottom: '16px', 
                    fontSize: screens.xs ? '12px' : '13px' 
                  }}>
                    {accion.description}
                  </Text>
                </div>
                
                <Button 
                  type="text" 
                  style={{ 
                    color: accion.color, 
                    padding: 0,
                    fontWeight: 500,
                    fontSize: screens.xs ? '12px' : '14px',
                    alignSelf: 'flex-start'
                  }}
                  icon={<ArrowRightOutlined />}
                >
                  Acceder
                </Button>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Métricas en tiempo real */}
        {stats && (user?.role === 'admin' || user?.role === 'superadmin') && (
          <>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: screens.xs ? '12px' : '20px',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <Title level={4} style={{ 
                margin: 0, 
                display: 'flex', 
                alignItems: 'center',
                fontSize: screens.xs ? '16px' : '18px'
              }}>
                <BarChartOutlined style={{ marginRight: '10px', color: '#52c41a' }} />
                Métricas del Día
                {loading && <Spin size="small" style={{ marginLeft: '10px' }} />}
                {usingMockData && (
                  <Tag color="orange" style={{ marginLeft: '8px', fontSize: '10px' }}>
                    Demo
                  </Tag>
                )}
              </Title>
              <Space>
                <Tag color="blue" style={{ fontSize: '11px', fontWeight: 600 }}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Tag>
                {stats?.ultima_actualizacion && (
                  <Tag color="cyan" style={{ fontSize: '11px', fontWeight: 600 }}>
                    {stats.ultima_actualizacion}
                  </Tag>
                )}
              </Space>
            </div>
            
            <Row gutter={[screens.xs ? 12 : 20, screens.xs ? 12 : 20]} style={{ marginBottom: '30px' }}>
              {/* Órdenes Hoy */}
              <Col xs={12} sm={12} md={6}>
                <Card 
                  style={{ 
                    borderLeft: '4px solid #1890ff',
                    height: '100%',
                    background: 'white'
                  }}
                  styles={{ body: { padding: screens.xs ? '16px' : '20px' } }}
                >
                  <Statistic
                    title={
                      <Space style={{ fontSize: screens.xs ? '12px' : '14px' }}>
                        <FileTextOutlined style={{ color: '#1890ff' }} />
                        Órdenes Hoy
                      </Space>
                    }
                    value={stats?.generales?.ordenes_hoy || 0}
                    valueStyle={{ 
                      color: '#1890ff', 
                      fontSize: screens.xs ? '24px' : '32px',
                      fontWeight: 700 
                    }}
                    suffix={
                      <Text type="secondary" style={{ fontSize: screens.xs ? '12px' : '14px' }}>
                        de {stats?.generales?.total_ordenes || 0} total
                      </Text>
                    }
                  />
                  <Progress 
                    percent={calcularPorcentajeOrdenes(stats?.generales?.ordenes_hoy || 0)} 
                    size="small" 
                    strokeColor="#1890ff"
                    format={percent => `${Math.round(percent)}%`}
                    style={{ marginTop: '12px' }}
                  />
                  <Text type="secondary" style={{ fontSize: '10px', display: 'block', marginTop: '4px' }}>
                    Meta: 30 órdenes/día
                  </Text>
                </Card>
              </Col>
              
              {/* Ingresos Hoy */}
              <Col xs={12} sm={12} md={6}>
                <Card 
                  style={{ 
                    borderLeft: '4px solid #52c41a',
                    height: '100%',
                    background: 'white'
                  }}
                  styles={{ body: { padding: screens.xs ? '16px' : '20px' } }}
                >
                  <Statistic
                    title={
                      <Space style={{ fontSize: screens.xs ? '12px' : '14px' }}>
                        <DollarOutlined style={{ color: '#52c41a' }} />
                        Ingresos Hoy
                      </Space>
                    }
                    value={stats?.hoy?.ingresos_totales || 0}
                    formatter={(value) => formatCurrency(value)}
                    valueStyle={{ 
                      color: '#52c41a', 
                      fontSize: screens.xs ? '20px' : '28px',
                      fontWeight: 700 
                    }}
                  />
                  {stats?.hoy?.promedio_por_orden > 0 && (
                    <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: '4px' }}>
                      Promedio: {formatCurrency(stats.hoy.promedio_por_orden)}
                    </Text>
                  )}
                </Card>
              </Col>
              
              {/* Comisiones */}
              <Col xs={12} sm={12} md={6}>
                <Card 
                  style={{ 
                    borderLeft: '4px solid #fa8c16',
                    height: '100%',
                    background: 'white'
                  }}
                  styles={{ body: { padding: screens.xs ? '16px' : '20px' } }}
                >
                  <Statistic
                    title={
                      <Space style={{ fontSize: screens.xs ? '12px' : '14px' }}>
                        <TeamOutlined style={{ color: '#fa8c16' }} />
                        Comisiones
                      </Space>
                    }
                    value={stats?.hoy?.comisiones_totales || 0}
                    formatter={(value) => formatCurrency(value)}
                    valueStyle={{ 
                      color: '#fa8c16', 
                      fontSize: screens.xs ? '20px' : '28px',
                      fontWeight: 700 
                    }}
                  />
                  <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: '4px' }}>
                    40% de los ingresos
                  </Text>
                </Card>
              </Col>
              
              {/* Ganancia Neta */}
              <Col xs={12} sm={12} md={6}>
                <Card 
                  style={{ 
                    borderLeft: '4px solid #722ed1',
                    height: '100%',
                    background: 'white'
                  }}
                  styles={{ body: { padding: screens.xs ? '16px' : '20px' } }}
                >
                  <Statistic
                    title={
                      <Space style={{ fontSize: screens.xs ? '12px' : '14px' }}>
                        <BankOutlined style={{ color: '#722ed1' }} />
                        Ganancia Neta
                      </Space>
                    }
                    value={stats?.hoy?.ganancia_neta || 0}
                    formatter={(value) => formatCurrency(value)}
                    valueStyle={{ 
                      color: '#722ed1', 
                      fontSize: screens.xs ? '20px' : '28px',
                      fontWeight: 700 
                    }}
                  />
                  <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: '4px' }}>
                    60% de los ingresos
                  </Text>
                </Card>
              </Col>
            </Row>
            
            {/* Segunda fila de métricas */}
            <Row gutter={[screens.xs ? 12 : 20, screens.xs ? 12 : 20]} style={{ marginBottom: '30px' }}>
              {/* Clientes Activos */}
              <Col xs={12} sm={12} md={6}>
                <Card 
                  style={{ 
                    borderLeft: '4px solid #13c2c2',
                    height: '100%',
                    background: 'white'
                  }}
                  styles={{ body: { padding: screens.xs ? '16px' : '20px' } }}
                >
                  <Statistic
                    title={
                      <Space style={{ fontSize: screens.xs ? '12px' : '14px' }}>
                        <UserOutlined style={{ color: '#13c2c2' }} />
                        Clientes Activos
                      </Space>
                    }
                    value={stats?.hoy?.clientes_activos || 0}
                    valueStyle={{ 
                      color: '#13c2c2', 
                      fontSize: screens.xs ? '24px' : '32px',
                      fontWeight: 700 
                    }}
                    suffix={
                      <Text type="secondary" style={{ fontSize: screens.xs ? '12px' : '14px' }}>
                        clientes
                      </Text>
                    }
                  />
                  <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: '4px' }}>
                    Últimos 30 días
                  </Text>
                </Card>
              </Col>
              
              {/* Lavadores Activos */}
              <Col xs={12} sm={12} md={6}>
                <Card 
                  style={{ 
                    borderLeft: '4px solid #eb2f96',
                    height: '100%',
                    background: 'white'
                  }}
                  styles={{ body: { padding: screens.xs ? '16px' : '20px' } }}
                >
                  <Statistic
                    title={
                      <Space style={{ fontSize: screens.xs ? '12px' : '14px' }}>
                        <TeamOutlined style={{ color: '#eb2f96' }} />
                        Lavadores Activos
                      </Space>
                    }
                    value={stats?.hoy?.lavadores_activos || 0}
                    valueStyle={{ 
                      color: '#eb2f96', 
                      fontSize: screens.xs ? '24px' : '32px',
                      fontWeight: 700 
                    }}
                    suffix={
                      <Text type="secondary" style={{ fontSize: screens.xs ? '12px' : '14px' }}>
                        lavadores
                      </Text>
                    }
                  />
                </Card>
              </Col>
              
              {/* Tasa de Éxito */}
              <Col xs={12} sm={12} md={6}>
                <Card 
                  style={{ 
                    borderLeft: '4px solid #faad14',
                    height: '100%',
                    background: 'white'
                  }}
                  styles={{ body: { padding: screens.xs ? '16px' : '20px' } }}
                >
                  <Statistic
                    title={
                      <Space style={{ fontSize: screens.xs ? '12px' : '14px' }}>
                        <SafetyCertificateOutlined style={{ color: '#faad14' }} />
                        Tasa de Éxito
                      </Space>
                    }
                    value={stats?.generales?.tasa_exito || 0}
                    suffix="%"
                    valueStyle={{ 
                      color: '#faad14', 
                      fontSize: screens.xs ? '24px' : '32px',
                      fontWeight: 700 
                    }}
                  />
                  <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: '4px' }}>
                    {stats?.generales?.ordenes_completadas_hoy || 0}/{stats?.generales?.ordenes_hoy || 0} órdenes
                  </Text>
                </Card>
              </Col>
              
              {/* Tendencia Semanal */}
              <Col xs={12} sm={12} md={6}>
                <Card 
                  style={{ 
                    borderLeft: '4px solid #a0d911',
                    height: '100%',
                    background: 'white'
                  }}
                  styles={{ body: { padding: screens.xs ? '16px' : '20px' } }}
                >
                  <Statistic
                    title={
                      <Space style={{ fontSize: screens.xs ? '12px' : '14px' }}>
                        <StarOutlined style={{ color: '#a0d911' }} />
                        Tendencia Semanal
                      </Space>
                    }
                    value={stats?.tendencias?.diferencia_semana || 0}
                    prefix={stats?.tendencias?.diferencia_semana > 0 ? '+' : ''}
                    suffix="%"
                    valueStyle={{ 
                      color: stats?.tendencias?.diferencia_semana > 0 ? '#a0d911' : '#ff4d4f', 
                      fontSize: screens.xs ? '24px' : '32px',
                      fontWeight: 700 
                    }}
                  />
                  <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: '4px' }}>
                    vs. semana anterior
                  </Text>
                </Card>
              </Col>
            </Row>
            
            {/* Información destacada */}
            {stats?.destacados && (
              <Card 
                title={
                  <Space>
                    <FireOutlined style={{ color: '#ff4d4f' }} />
                    Destacados del Día
                  </Space>
                }
                style={{ marginBottom: '30px' }}
              >
                <Row gutter={[16, 16]}>
                  {stats.destacados.top_lavadores && stats.destacados.top_lavadores.length > 0 && (
                    <Col xs={24} sm={12}>
                      <Text strong>🏆 Lavador Destacado:</Text>
                      <div style={{ marginTop: '8px' }}>
                        <Space>
                          <Avatar size="small" style={{ background: '#1890ff' }}>
                            {stats.destacados.top_lavadores[0].nombre?.charAt(0) || 'L'}
                          </Avatar>
                          <div>
                            <Text strong>{stats.destacados.top_lavadores[0].nombre}</Text>
                            <br />
                            <Text type="secondary">
                              {formatCurrency(stats.destacados.top_lavadores[0].total_comisiones)} en comisiones
                            </Text>
                          </div>
                        </Space>
                      </div>
                    </Col>
                  )}
                  
                  {stats.destacados.tipo_vehiculo_popular && (
                    <Col xs={24} sm={12}>
                      <Text strong>🚗 Vehículo Más Común:</Text>
                      <div style={{ marginTop: '8px' }}>
                        <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>
                          {stats.destacados.tipo_vehiculo_popular._id.toUpperCase()}
                        </Tag>
                        <Text type="secondary" style={{ marginLeft: '8px' }}>
                          ({stats.destacados.tipo_vehiculo_popular.count} lavados hoy)
                        </Text>
                      </div>
                    </Col>
                  )}
                  
                  {stats.destacados.orden_mas_cara && (
                    <Col xs={24}>
                      <Text strong>💰 Orden Más Cara:</Text>
                      <div style={{ marginTop: '8px' }}>
                        <Card size="small">
                          <Space>
                            <Text strong>{stats.destacados.orden_mas_cara.numero_orden}</Text>
                            <Text type="secondary">Placa: {stats.destacados.orden_mas_cara.placa}</Text>
                            <Text strong>{formatCurrency(stats.destacados.orden_mas_cara.total)}</Text>
                          </Space>
                        </Card>
                      </div>
                    </Col>
                  )}
                </Row>
              </Card>
            )}
          </>
        )}

        {/* Footer */}
        <div style={{ 
          textAlign: 'center', 
          padding: '20px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          marginTop: screens.xs ? '16px' : '24px',
          border: '1px solid #f0f0f0'
        }}>
          <Space orientation="vertical" size="small">
            <Text type="secondary" style={{ fontSize: screens.xs ? '12px' : '14px' }}>
              🚗 FullWash 360 • Sistema de Gestión
            </Text>
            <Space wrap>
              <Button 
                type="link" 
                size="small"
                onClick={() => navigate('/ordenes/nueva')}
              >
                Nueva Orden
              </Button>
              <Text type="secondary">•</Text>
              <Button 
                type="link" 
                size="small"
                onClick={() => navigate('/ordenes')}
              >
                Ver Órdenes
              </Button>
              <Text type="secondary">•</Text>
              <Button 
                type="link" 
                size="small"
                onClick={handleRefresh}
                loading={loading}
                icon={<ReloadOutlined />}
              >
                Actualizar
              </Button>
              {usingMockData && (
                <>
                  <Text type="secondary">•</Text>
                  <Tag color="orange" size="small">
                    Modo Demo
                  </Tag>
                </>
              )}
            </Space>
          </Space>
        </div>
      </Content>
    </Layout>
  );
};

export default Dashboard;