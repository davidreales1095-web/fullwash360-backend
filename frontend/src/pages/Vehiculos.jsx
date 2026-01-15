import React from 'react';
import { Card, Typography, Button, Space, Row, Col, Input, Tag } from 'antd';
import { 
  CarOutlined, 
  PlusOutlined, 
  SearchOutlined, 
  UserOutlined,
  HistoryOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Search } = Input;

const Vehiculos = () => {
  const navigate = useNavigate();

  // Datos de ejemplo para vehículos
  const vehiculosEjemplo = [
    { 
      id: 1, 
      placa: 'ABC-123', 
      marca: 'Toyota', 
      modelo: 'Corolla', 
      año: 2020, 
      color: 'Rojo',
      cliente: 'Juan Pérez',
      lavadas: 8,
      proximaLavadaGratis: 2
    },
    { 
      id: 2, 
      placa: 'XYZ-789', 
      marca: 'Honda', 
      modelo: 'Civic', 
      año: 2019, 
      color: 'Azul',
      cliente: 'María García',
      lavadas: 5,
      proximaLavadaGratis: 5
    },
    { 
      id: 3, 
      placa: 'DEF-456', 
      marca: 'Nissan', 
      modelo: 'Sentra', 
      año: 2021, 
      color: 'Blanco',
      cliente: 'Carlos López',
      lavadas: 12,
      proximaLavadaGratis: '¡Próxima gratis!'
    },
  ];

  return (
    <div className="vehiculos-page">
      {/* Header de la página */}
      <div className="page-header">
        <div>
          <Title level={2} style={{ marginBottom: '4px' }}>
            🚗 Gestión de Vehículos
          </Title>
          <Text type="secondary">
            Administra el registro de vehículos de tus clientes
          </Text>
        </div>
        <Space>
          <Button 
            icon={<PlusOutlined />} 
            type="primary"
            onClick={() => navigate('/vehiculos/nuevo')}
          >
            Nuevo Vehículo
          </Button>
        </Space>
      </div>

      {/* Barra de búsqueda */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={16}>
            <Search
              placeholder="Buscar vehículo por placa, marca, modelo o cliente..."
              enterButton={<><SearchOutlined /> Buscar</>}
              size="large"
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} md={8}>
            <Space style={{ float: 'right' }}>
              <Button icon={<HistoryOutlined />}>Historial</Button>
              <Button type="primary" onClick={() => navigate('/ordenes/nueva')}>
                Nueva Orden
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Estadísticas */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card hoverable>
            <div style={{ textAlign: 'center' }}>
              <Title level={1} style={{ color: '#1890ff', marginBottom: 8 }}>
                {vehiculosEjemplo.length}
              </Title>
              <Text type="secondary">Vehículos Registrados</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card hoverable>
            <div style={{ textAlign: 'center' }}>
              <Title level={1} style={{ color: '#52c41a', marginBottom: 8 }}>
                3
              </Title>
              <Text type="secondary">Marcas Más Frecuentes</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card hoverable>
            <div style={{ textAlign: 'center' }}>
              <Title level={1} style={{ color: '#fa8c16', marginBottom: 8 }}>
                25
              </Title>
              <Text type="secondary">Lavadas Totales</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Lista de vehículos */}
      <Card
        title={
          <Space>
            <CarOutlined />
            <span>Vehículos Registrados</span>
            <Tag color="blue">{vehiculosEjemplo.length} vehículos</Tag>
          </Space>
        }
      >
        {vehiculosEjemplo.map(vehiculo => (
          <Card 
            key={vehiculo.id}
            style={{ marginBottom: 12 }}
            hoverable
            onClick={() => navigate(`/vehiculos/${vehiculo.id}`)}
          >
            <Row gutter={16} align="middle">
              <Col xs={24} md={4}>
                <div style={{ textAlign: 'center' }}>
                  <CarOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                </div>
              </Col>
              <Col xs={24} md={6}>
                <div>
                  <Text strong style={{ display: 'block', fontSize: 16 }}>
                    {vehiculo.marca} {vehiculo.modelo}
                  </Text>
                  <Tag color="blue" style={{ marginTop: 4 }}>{vehiculo.placa}</Tag>
                </div>
              </Col>
              <Col xs={24} md={6}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Año/Color</Text>
                  <div>
                    <Text strong>{vehiculo.año}</Text>
                    <Tag color={vehiculo.color.toLowerCase()} style={{ marginLeft: 8 }}>
                      {vehiculo.color}
                    </Tag>
                  </div>
                </div>
              </Col>
              <Col xs={24} md={4}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Cliente</Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <UserOutlined style={{ color: '#666' }} />
                    <Text strong>{vehiculo.cliente}</Text>
                  </div>
                </div>
              </Col>
              <Col xs={24} md={4}>
                <div style={{ textAlign: 'right' }}>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Lavadas</Text>
                    <Text strong>{vehiculo.lavadas}</Text>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Próxima gratis</Text>
                    <Text strong style={{ color: '#52c41a' }}>
                      {vehiculo.proximaLavadaGratis}
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        ))}

        {/* Mensaje si no hay vehículos */}
        {vehiculosEjemplo.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <CarOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
            <Title level={4}>No hay vehículos registrados</Title>
            <Text type="secondary">
              Registra el primer vehículo para comenzar a gestionar lavados.
            </Text>
            <div style={{ marginTop: 24 }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => navigate('/vehiculos/nuevo')}
              >
                Registrar Primer Vehículo
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Acciones rápidas */}
      <Card style={{ marginTop: 16 }}>
        <Title level={5}>⚡ Acciones Rápidas</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Button 
              block 
              icon={<CheckCircleOutlined />}
              onClick={() => navigate('/ordenes/nueva')}
            >
              Nueva Orden
            </Button>
          </Col>
          <Col xs={24} sm={8}>
            <Button 
              block 
              icon={<HistoryOutlined />}
              onClick={() => navigate('/reportes')}
            >
              Ver Historial
            </Button>
          </Col>
          <Col xs={24} sm={8}>
            <Button 
              block 
              type="primary"
              icon={<CarOutlined />}
              onClick={() => navigate('/clientes')}
            >
              Ver Clientes
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Vehiculos;