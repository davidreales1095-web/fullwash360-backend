import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, Button, Typography, 
  Space, Alert, Tag, Progress 
} from 'antd';
import { 
  DollarOutlined, CarOutlined, UserOutlined, 
  TeamOutlined, RocketOutlined, PlusOutlined,
  CheckCircleOutlined, ReloadOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const DashboardEmergency = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://fullwash360-backend.onrender.com/api/orders/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      } else {
        // Datos de ejemplo si falla
        setStats({
          generales: {
            total_ordenes: 0,
            ordenes_hoy: 0,
            ordenes_pendientes: 0,
            total_clientes: 0,
            total_vehiculos: 0,
            lavados_gratis: 0
          },
          hoy: {
            ingresos_totales: 0,
            comisiones_totales: 0,
            ganancia_neta: 0,
            porcentaje_comisiones: 0
          }
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <div style={{ 
      padding: '24px', 
      background: '#f0f2f5',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '12px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              🚗 FullWash 360 - Dashboard de Emergencia
            </Title>
            <Text type="secondary">Sistema funcionando - Datos en tiempo real</Text>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={cargarDatos}
                loading={loading}
              >
                Actualizar
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => navigate('/ordenes/nueva')}
              >
                Nueva Orden
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Alertas */}
      <Alert
        message="Dashboard de Emergencia"
        description="Usando esta versión simplificada mientras se soluciona el dashboard principal"
        type="info"
        showIcon
        style={{ marginBottom: '24px' }}
      />

      {/* Métricas PRINCIPALES */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="Órdenes Hoy"
              value={stats?.generales?.ordenes_hoy || 0}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: '32px' }}
            />
            <Text type="secondary">Total: {stats?.generales?.total_ordenes || 0}</Text>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="Ingresos Hoy"
              value={stats?.hoy?.ingresos_totales || 0}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: '28px' }}
              formatter={value => `$${value}`}
            />
            <Progress 
              percent={stats?.hoy?.ingresos_totales > 0 ? 100 : 0} 
              size="small" 
              status={stats?.hoy?.ingresos_totales > 0 ? "active" : "normal"}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="Comisiones"
              value={stats?.hoy?.comisiones_totales || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#fa8c16', fontSize: '28px' }}
              formatter={value => `$${value}`}
            />
            <Tag color="orange">40% para lavadores</Tag>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="Ganancia Neta"
              value={stats?.hoy?.ganancia_neta || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#722ed1', fontSize: '28px' }}
              formatter={value => `$${value}`}
            />
            <Text type="secondary">Hoy</Text>
          </Card>
        </Col>
      </Row>

      {/* Métricas secundarias */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card size="small">
            <Title level={5} style={{ margin: 0, textAlign: 'center' }}>
              {stats?.generales?.total_clientes || 0}
            </Title>
            <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
              Clientes
            </Text>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Title level={5} style={{ margin: 0, textAlign: 'center' }}>
              {stats?.generales?.total_vehiculos || 0}
            </Title>
            <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
              Vehículos
            </Text>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Title level={5} style={{ margin: 0, textAlign: 'center' }}>
              {stats?.generales?.lavados_gratis || 0}
            </Title>
            <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
              Lavados Gratis
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Acciones rápidas */}
      <Card title="🚀 Acciones Rápidas" style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card 
              hoverable 
              onClick={() => navigate('/ordenes/nueva')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <PlusOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
              <Title level={5} style={{ margin: '12px 0' }}>Nueva Orden</Title>
              <Text type="secondary">Crear orden de lavado</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card 
              hoverable 
              onClick={() => navigate('/ordenes')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <CarOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
              <Title level={5} style={{ margin: '12px 0' }}>Órdenes Activas</Title>
              <Text type="secondary">Gestionar pendientes</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card 
              hoverable 
              onClick={() => navigate('/clientes')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <UserOutlined style={{ fontSize: '32px', color: '#722ed1' }} />
              <Title level={5} style={{ margin: '12px 0' }}>Clientes</Title>
              <Text type="secondary">Ver todos los clientes</Text>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Footer */}
      <div style={{ 
        textAlign: 'center', 
        padding: '20px',
        background: 'white',
        borderRadius: '12px',
        marginTop: '24px'
      }}>
        <Text type="secondary">
          🚗 FullWash 360 • Dashboard de Emergencia • {new Date().toLocaleDateString()}
        </Text>
        <div style={{ marginTop: '12px' }}>
          <Button 
            type="link" 
            onClick={() => navigate('/ordenes/nueva')}
          >
            Nueva Orden
          </Button>
          •
          <Button 
            type="link" 
            onClick={() => navigate('/ordenes')}
          >
            Ver Órdenes
          </Button>
          •
          <Button 
            type="link" 
            onClick={cargarDatos}
            loading={loading}
          >
            Actualizar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardEmergency;