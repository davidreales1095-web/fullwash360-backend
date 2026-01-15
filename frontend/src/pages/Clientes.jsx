// src/pages/Clientes.jsx - VERSIÓN CORREGIDA
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Space, 
  Row, 
  Col, 
  Input,
  Avatar,
  message,
  Spin,
  Empty,
  Badge,
  Tag
} from 'antd';
import { 
  UserOutlined, 
  PlusOutlined, 
  SearchOutlined, 
  TeamOutlined,
  PhoneOutlined,
  MailOutlined,
  StarOutlined,
  CarOutlined,
  ReloadOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import clientesApi from '../api/clientesApi'; // ← CORRECCIÓN: solo un "../"

const { Title, Text } = Typography;
const { Search } = Input;

const Clientes = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('todos');

  // Cargar clientes reales al montar
  useEffect(() => {
    cargarClientesReales();
  }, []);

  const cargarClientesReales = async () => {
    setLoading(true);
    try {
      console.log('🔍 Cargando clientes desde BD...');
      
      // Depuración: verificar que la API existe
      console.log('clientesApi:', clientesApi);
      console.log('obtenerClientes:', clientesApi.obtenerClientes);
      
      const response = await clientesApi.obtenerClientes();
      console.log('📦 Respuesta completa:', response);
      
      // Diferentes estructuras de respuesta posibles
      let clientesData = [];
      
      if (Array.isArray(response)) {
        clientesData = response;
      } else if (response && typeof response === 'object') {
        // Caso 1: response.data como array
        if (response.data && Array.isArray(response.data)) {
          clientesData = response.data;
        }
        // Caso 2: response con propiedad success y data
        else if (response.success && response.data && Array.isArray(response.data)) {
          clientesData = response.data;
        }
        // Caso 3: response.clientes como array
        else if (response.clientes && Array.isArray(response.clientes)) {
          clientesData = response.clientes;
        }
        // Caso 4: response es un objeto simple (un solo cliente)
        else if (response._id || response.id) {
          clientesData = [response];
        }
      }
      
      console.log(`✅ ${clientesData.length} clientes cargados:`, clientesData);
      setClientes(clientesData);
      
      if (clientesData.length > 0) {
        message.success(`${clientesData.length} clientes cargados`);
      } else {
        message.info('No hay clientes registrados aún');
      }
    } catch (error) {
      console.error('❌ Error cargando clientes:', error);
      
      // Si es error de red o el servidor no responde
      if (error.message && error.message.includes('Network') || error.message.includes('Failed to fetch')) {
        message.error('Error de conexión con el servidor');
      } else {
        message.error(error.message || 'Error al cargar clientes');
      }
      
      // Fallback a datos de ejemplo para desarrollo
      const clientesEjemplo = [
        { 
          _id: '1', 
          nombre_completo: 'Juan Pérez', 
          telefono: '3001234567', 
          email: 'juan@email.com', 
          total_lavados: 12, 
          placa_vehiculo: 'ABC123',
          tipo_vehiculo: 'carro_particular'
        },
        { 
          _id: '2', 
          nombre_completo: 'María García', 
          telefono: '3109876543', 
          email: 'maria@email.com', 
          total_lavados: 8, 
          placa_vehiculo: 'XYZ789',
          tipo_vehiculo: 'carro_particular'
        },
        { 
          _id: '3', 
          nombre_completo: 'Carlos López', 
          telefono: '3204567890', 
          email: 'carlos@email.com', 
          total_lavados: 15, 
          placa_vehiculo: 'DEF456',
          tipo_vehiculo: 'moto'
        },
      ];
      setClientes(clientesEjemplo);
      message.info('Mostrando datos de ejemplo para desarrollo');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar clientes
  const clientesFiltrados = clientes.filter(cliente => {
    // Búsqueda por término
    const term = searchTerm.toLowerCase();
    const coincideBusqueda = !searchTerm || 
      (cliente.nombre_completo && cliente.nombre_completo.toLowerCase().includes(term)) ||
      (cliente.telefono && cliente.telefono.toLowerCase().includes(term)) ||
      (cliente.email && cliente.email.toLowerCase().includes(term)) ||
      (cliente.placa_vehiculo && cliente.placa_vehiculo.toLowerCase().includes(term));
    
    // Filtro por tipo
    let coincideFiltro = true;
    switch(filtroActivo) {
      case 'frecuentes':
        coincideFiltro = (cliente.total_lavados || 0) >= 10;
        break;
      case 'nuevos':
        coincideFiltro = (cliente.total_lavados || 0) === 0;
        break;
      case 'con-vehiculo':
        coincideFiltro = !!cliente.placa_vehiculo;
        break;
      default:
        coincideFiltro = true;
    }
    
    return coincideBusqueda && coincideFiltro;
  });

  // Métricas reales
  const metricasClientes = [
    { 
      titulo: 'Clientes Totales', 
      valor: clientes.length, 
      icono: <TeamOutlined />, 
      color: '#1890ff' 
    },
    { 
      titulo: 'Lavados Acumulados', 
      valor: clientes.reduce((sum, c) => sum + (c.total_lavados || 0), 0), 
      icono: <CarOutlined />, 
      color: '#52c41a' 
    },
    { 
      titulo: 'Clientes Frecuentes', 
      valor: clientes.filter(c => (c.total_lavados || 0) >= 10).length, 
      icono: <StarOutlined />, 
      color: '#fa8c16' 
    },
    { 
      titulo: 'Con Vehículo', 
      valor: clientes.filter(c => !!c.placa_vehiculo).length, 
      icono: <UserOutlined />, 
      color: '#722ed1' 
    },
  ];

  // Calcular lavados gratis obtenidos
  const calcularLavadosGratis = (lavados) => {
    return Math.floor((lavados || 0) / 10);
  };

  // Calcular progreso para próximo gratis
  const calcularProgreso = (lavados) => {
    return ((lavados || 0) % 10) * 10;
  };

  // Manejar clic en cliente
  const handleClienteClick = (cliente) => {
    // Por ahora solo muestra alerta, luego se puede implementar vista detalle
    message.info(`Ver detalle de ${cliente.nombre_completo}`);
    // navigate(`/clientes/${cliente._id || cliente.id}`);
  };

  return (
    <div className="clientes-page" style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 24
      }}>
        <div>
          <Title level={2} style={{ marginBottom: 4 }}>
            👥 Gestión de Clientes
          </Title>
          <Text type="secondary">
            Administra {clientes.length} clientes registrados en el sistema
          </Text>
        </div>
        <Space>
          <Button 
            icon={<ReloadOutlined />}
            onClick={cargarClientesReales}
            loading={loading}
          >
            Actualizar
          </Button>
          <Button 
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/clientes/nuevo')}
          >
            Nuevo Cliente
          </Button>
        </Space>
      </div>

      {/* Barra de búsqueda */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Search
              placeholder="Buscar por nombre, teléfono, email o placa..."
              enterButton={<SearchOutlined />}
              size="large"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={(value) => setSearchTerm(value)}
              loading={loading}
            />
          </Col>
          <Col xs={24} md={8}>
            <Space style={{ float: 'right' }}>
              <Tag.CheckableTag
                checked={filtroActivo === 'todos'}
                onChange={() => setFiltroActivo('todos')}
              >
                Todos
              </Tag.CheckableTag>
              <Tag.CheckableTag
                checked={filtroActivo === 'frecuentes'}
                onChange={() => setFiltroActivo('frecuentes')}
              >
                Frecuentes (10+)
              </Tag.CheckableTag>
              <Tag.CheckableTag
                checked={filtroActivo === 'con-vehiculo'}
                onChange={() => setFiltroActivo('con-vehiculo')}
              >
                Con Vehículo
              </Tag.CheckableTag>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Métricas */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {metricasClientes.map((metrica, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card hoverable>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 8, 
                  background: metrica.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 20
                }}>
                  {metrica.icono}
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{metrica.titulo}</Text>
                  <Title level={3} style={{ margin: 0 }}>{metrica.valor}</Title>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Lista de clientes */}
      <Card
        title={
          <Space>
            <UserOutlined />
            <span>Clientes Registrados</span>
            <Badge 
              count={clientesFiltrados.length} 
              showZero 
              style={{ backgroundColor: '#1890ff' }} 
            />
          </Space>
        }
        extra={
          <Button 
            icon={<FilterOutlined />}
            onClick={() => {
              setFiltroActivo('todos');
              setSearchTerm('');
            }}
          >
            Limpiar Filtros
          </Button>
        }
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
            <p>Cargando clientes...</p>
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <Empty
            description={
              <div>
                <Title level={4}>No hay clientes</Title>
                <Text type="secondary">
                  {searchTerm ? 'No se encontraron clientes con ese criterio' : 'No hay clientes registrados'}
                </Text>
              </div>
            }
          >
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => navigate('/clientes/nuevo')}
            >
              Agregar Primer Cliente
            </Button>
          </Empty>
        ) : (
          <Row gutter={[16, 16]}>
            {clientesFiltrados.map(cliente => (
              <Col xs={24} md={12} lg={8} key={cliente._id || cliente.id}>
                <Card 
                  hoverable
                  onClick={() => handleClienteClick(cliente)}
                  style={{ height: '100%', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <Avatar 
                      size={64}
                      style={{ backgroundColor: '#1890ff' }}
                      icon={<UserOutlined />}
                    />
                    <div style={{ flex: 1 }}>
                      <Title level={5} style={{ margin: 0 }}>{cliente.nombre_completo || 'Sin nombre'}</Title>
                      <Text type="secondary">{cliente.telefono || 'Sin teléfono'}</Text>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: 12 }}>
                    <Space>
                      {cliente.placa_vehiculo ? (
                        <Tag icon={<CarOutlined />} color="blue">
                          {cliente.placa_vehiculo}
                        </Tag>
                      ) : (
                        <Tag color="default">Sin vehículo</Tag>
                      )}
                      <Tag>
                        {cliente.total_lavados || 0} lavados
                      </Tag>
                      {cliente.tipo_vehiculo && (
                        <Tag color="green">
                          {cliente.tipo_vehiculo.replace('_', ' ')}
                        </Tag>
                      )}
                    </Space>
                  </div>
                  
                  {/* Barra de progreso de fidelización */}
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      fontSize: 12,
                      color: '#666',
                      marginBottom: 4
                    }}>
                      <span>Progreso lavado gratis</span>
                      <span>{(cliente.total_lavados || 0) % 10}/10</span>
                    </div>
                    <div style={{
                      height: 6,
                      backgroundColor: '#f0f0f0',
                      borderRadius: 3,
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${calcularProgreso(cliente.total_lavados)}%`,
                        height: '100%',
                        backgroundColor: ((cliente.total_lavados || 0) % 10 === 0 && (cliente.total_lavados || 0) > 0) ? '#52c41a' : '#1890ff'
                      }} />
                    </div>
                  </div>
                  
                  <div style={{ fontSize: 12, color: '#666' }}>
                    {calcularLavadosGratis(cliente.total_lavados) > 0 && (
                      <div>🎁 {calcularLavadosGratis(cliente.total_lavados)} lavados gratis obtenidos</div>
                    )}
                    {cliente.email && (
                      <div style={{ marginTop: 4 }}>
                        <MailOutlined /> {cliente.email}
                      </div>
                    )}
                    {(cliente.total_lavados || 0) > 0 && (
                      <div style={{ marginTop: 4 }}>
                        ⏳ Próximo gratis en {10 - ((cliente.total_lavados || 0) % 10)} lavados
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
        
        {/* Botón para nueva orden */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Button 
            type="primary" 
            size="large"
            onClick={() => navigate('/ordenes/nueva')}
          >
            🚗 Crear Nueva Orden para Cliente
          </Button>
        </div>
      </Card>

      {/* Información adicional */}
      <Card style={{ marginTop: 24 }}>
        <Title level={5}>ℹ️ Información del Sistema</Title>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <div style={{ padding: 12, background: '#f6ffed', borderRadius: 8 }}>
              <Title level={5} style={{ color: '#52c41a' }}>Sistema de Fidelización</Title>
              <ul style={{ margin: 0, paddingLeft: 20, color: '#666' }}>
                <li>Cada 10 lavados = 1 GRATIS</li>
                <li>El progreso se guarda por VEHÍCULO (placa)</li>
                <li>Los clientes pueden tener múltiples vehículos</li>
              </ul>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ padding: 12, background: '#e6f7ff', borderRadius: 8 }}>
              <Title level={5} style={{ color: '#1890ff' }}>Consejos</Title>
              <ul style={{ margin: 0, paddingLeft: 20, color: '#666' }}>
                <li>Registra la placa para seguimiento automático</li>
                <li>Actualiza el contador de lavados si el cliente viene de otro lugar</li>
                <li>Usa los filtros para encontrar clientes frecuentes</li>
              </ul>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Clientes;