import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Space,
  Tag,
  Input,
  message,
  Modal,
  Form,
  Avatar,
  Badge,
  Tooltip,
  Popconfirm,
  Spin,
  Checkbox,
  Row,
  Col,
  Statistic,
  Typography,
  Alert,
  Progress
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TeamOutlined,
  SyncOutlined,
  DollarOutlined,
  EyeOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import lavadoresApi from '../../api/lavadoresApi';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;
const { Title, Text } = Typography;

const ListaLavadores = () => {
  const [form] = Form.useForm();
  const [lavadores, setLavadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLavador, setEditingLavador] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    inactivos: 0,
    totalComisiones: 0
  });
  const navigate = useNavigate();

  // Cargar lavadores reales
  useEffect(() => {
    cargarLavadoresReales();
  }, []);

  const cargarLavadoresReales = async () => {
    setLoading(true);
    try {
      console.log('🔍 Cargando lavadores desde API...');
      const response = await lavadoresApi.obtenerLavadores();
      
      // ⚠️ ADAPTACIÓN: Ahora la API devuelve array directo con comisiones
      let lavadoresData = [];
      
      if (Array.isArray(response)) {
        // ✅ Nueva estructura: array directo
        lavadoresData = response;
        console.log(`✅ ${lavadoresData.length} lavadores cargados (array directo)`);
      } else if (response && response.success && Array.isArray(response.users)) {
        // ⚠️ Estructura antigua: {success: true, users: [...]}
        lavadoresData = response.users;
        console.log(`✅ ${lavadoresData.length} lavadores cargados desde response.users`);
      } else if (response && response.data && Array.isArray(response.data)) {
        lavadoresData = response.data;
      } else if (response && response.lavadores && Array.isArray(response.lavadores)) {
        lavadoresData = response.lavadores;
      } else if (response && response.success && Array.isArray(response.data)) {
        lavadoresData = response.data;
      } else {
        console.warn('⚠️ Formato de respuesta inesperado:', response);
        lavadoresData = [];
      }
      
      console.log('📊 Lavadores cargados:', lavadoresData);
      setLavadores(lavadoresData);
      
      // Calcular estadísticas CON COMISIONES
      const activos = lavadoresData.filter(l => l.activo === true || l.activo === 'true').length;
      const totalComisiones = lavadoresData.reduce((total, lavador) => {
        return total + (lavador.saldo_comisiones || 0);
      }, 0);
      
      setStats({
        total: lavadoresData.length,
        activos: activos,
        inactivos: lavadoresData.length - activos,
        totalComisiones: totalComisiones
      });
      
      if (lavadoresData.length > 0) {
        message.success(`${lavadoresData.length} lavadores cargados`);
      } else {
        message.info('No hay lavadores registrados aún');
      }
    } catch (error) {
      console.error('❌ Error cargando lavadores:', error);
      message.error(error.message || 'Error al cargar lavadores');
      
      // Datos de ejemplo MEJORADOS con comisiones
      const lavadoresEjemplo = [
        {
          _id: '1',
          codigo: 'L001',
          nombre: 'Juan Pérez',
          telefono: '3001234567',
          activo: true,
          rol: 'lavador',
          comision_porcentaje: 40,
          saldo_comisiones: 120000,
          estadisticas: {
            total_ordenes: 12,
            total_comisiones: 120000,
            promedio_comision_por_orden: 10000
          }
        },
        {
          _id: '2',
          codigo: 'L002',
          nombre: 'María García',
          telefono: '3109876543',
          activo: true,
          rol: 'lavador',
          comision_porcentaje: 40,
          saldo_comisiones: 85000,
          estadisticas: {
            total_ordenes: 8,
            total_comisiones: 85000,
            promedio_comision_por_orden: 10625
          }
        },
        {
          _id: '3',
          codigo: 'L003',
          nombre: 'Carlos López',
          telefono: '3204567890',
          activo: false,
          rol: 'lavador',
          comision_porcentaje: 40,
          saldo_comisiones: 45000,
          estadisticas: {
            total_ordenes: 4,
            total_comisiones: 45000,
            promedio_comision_por_orden: 11250
          }
        }
      ];
      setLavadores(lavadoresEjemplo);
      setStats({
        total: 3,
        activos: 2,
        inactivos: 1,
        totalComisiones: 250000
      });
      message.info('Mostrando datos de ejemplo para desarrollo');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar lavadores por búsqueda
  const lavadoresFiltrados = lavadores.filter(lavador =>
    lavador.nombre?.toLowerCase().includes(searchText.toLowerCase()) ||
    lavador.codigo?.toLowerCase().includes(searchText.toLowerCase()) ||
    lavador.telefono?.includes(searchText)
  );

  const columns = [
    {
      title: 'CÓDIGO',
      dataIndex: 'codigo',
      key: 'codigo',
      width: 120,
      render: (codigo) => (
        <Tag 
          color="blue" 
          style={{ 
            fontSize: '14px', 
            fontWeight: '600',
            padding: '8px 12px',
            borderRadius: '20px'
          }}
        >
          {codigo || 'N/A'}
        </Tag>
      )
    },
    {
      title: 'LAVADOR',
      key: 'nombre',
      render: (_, record) => (
        <Space style={{ padding: '8px 0' }}>
          <Avatar 
            size="large"
            style={{ 
              backgroundColor: record.activo ? '#1890ff' : '#d9d9d9',
              color: 'white',
              fontSize: '18px'
            }}
            icon={<UserOutlined />}
          />
          <div>
            <div style={{ fontWeight: '600', fontSize: '16px', color: '#333' }}>
              {record.nombre || 'Sin nombre'}
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
              <PhoneOutlined style={{ marginRight: '6px' }} /> 
              {record.telefono || record.phone || 'Sin teléfono'}
            </div>
            {/* ✅ NUEVO: Mostrar porcentaje de comisión */}
            <div style={{ fontSize: '12px', color: '#1890ff', marginTop: '2px' }}>
              <DollarOutlined /> Comisión: {record.comision_porcentaje || 40}%
            </div>
          </div>
        </Space>
      )
    },
    {
      title: 'SALDO COMISIONES',
      dataIndex: 'saldo_comisiones',
      key: 'saldo_comisiones',
      width: 180,
      render: (saldo, record) => (
        <div>
          <Tag 
            color="green" 
            style={{ 
              fontSize: '14px', 
              fontWeight: '600',
              padding: '8px 12px',
              borderRadius: '20px',
              background: '#f6ffed',
              borderColor: '#b7eb8f',
              color: '#389e0d',
              marginBottom: '4px'
            }}
          >
            <DollarOutlined /> ${(saldo || 0).toLocaleString('es-CO')}
          </Tag>
          {/* ✅ NUEVO: Mostrar estadísticas */}
          <div style={{ fontSize: '11px', color: '#666' }}>
            {record.estadisticas?.total_ordenes || 0} órdenes
          </div>
        </div>
      )
    },
    {
      title: 'ESTADO',
      dataIndex: 'activo',
      key: 'activo',
      width: 130,
      render: (activo) => (
        <Badge
          status={activo ? 'success' : 'error'}
          text={
            <Tag 
              color={activo ? 'green' : 'red'} 
              icon={activo ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              style={{ 
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: '500',
                borderRadius: '20px'
              }}
            >
              {activo ? 'ACTIVO' : 'INACTIVO'}
            </Tag>
          }
        />
      )
    },
    {
      title: 'ACCIÓN',
      key: 'acciones',
      width: 250,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => verDetallesComisiones(record._id)}
            size="small"
            style={{
              background: '#722ed1',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '500'
            }}
          >
            Comisiones
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => editarLavador(record)}
            size="small"
            style={{
              background: '#1890ff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '500'
            }}
          >
            Editar
          </Button>
          <Popconfirm
            title="¿Desactivar lavador?"
            description="El lavador se marcará como inactivo. ¿Continuar?"
            onConfirm={() => eliminarLavador(record._id)}
            okText="Sí"
            cancelText="No"
            okType="danger"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              style={{
                borderRadius: '6px',
                fontWeight: '500'
              }}
            >
              Desactivar
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // ✅ NUEVO: Ver detalles de comisiones
  const verDetallesComisiones = (lavadorId) => {
    navigate(`/lavadores/${lavadorId}/comisiones`);
  };

  const editarLavador = (lavador) => {
    setEditingLavador(lavador);
    form.setFieldsValue({
      nombre: lavador.nombre,
      telefono: lavador.telefono || lavador.phone || '',
      codigo: lavador.codigo,
      activo: lavador.activo !== false
    });
    setModalVisible(true);
  };

  const eliminarLavador = async (id) => {
    try {
      await lavadoresApi.eliminarLavador(id);
      message.success('Lavador desactivado correctamente');
      cargarLavadoresReales();
    } catch (error) {
      message.error('Error desactivando lavador');
    }
  };

  const guardarLavador = async (values) => {
    setSubmitLoading(true);
    try {
      const lavadorData = {
        ...values,
        rol: 'lavador',
        // ✅ NUEVO: Forzar 40% de comisión al crear/editar
        porcentaje_comision: 40
      };

      if (editingLavador) {
        await lavadoresApi.actualizarLavador(editingLavador._id, lavadorData);
        message.success('✅ Lavador actualizado correctamente');
      } else {
        await lavadoresApi.crearLavador(lavadorData);
        message.success('✅ Lavador creado correctamente');
      }
      
      setModalVisible(false);
      form.resetFields();
      cargarLavadoresReales();
    } catch (error) {
      message.error(error.message || '❌ Error guardando lavador');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Título y acciones */}
      <div style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Space>
              <Title level={3} style={{ margin: 0, color: '#1a1a1a' }}>
                👷 Gestión de Lavadores
              </Title>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                Administra los lavadores y sus comisiones
              </Text>
            </Space>
          </Col>
          <Col xs={24} md={12}>
            <Space style={{ float: 'right' }}>
              <Button
                icon={<HistoryOutlined />}
                onClick={() => navigate('/historial')}
                style={{ borderRadius: '8px' }}
              >
                Ver Historial
              </Button>
              <Button
                icon={<SyncOutlined />}
                onClick={cargarLavadoresReales}
                loading={loading}
                style={{ borderRadius: '8px' }}
              >
                Actualizar
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingLavador(null);
                  form.resetFields();
                  setModalVisible(true);
                }}
                style={{ 
                  background: '#1890ff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  padding: '8px 16px'
                }}
              >
                Nuevo Lavador
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Estadísticas - INCLUYE COMISIONES */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={6}>
          <Card 
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              color: 'white'
            }}
          >
            <Statistic
              title={<span style={{ color: 'white', opacity: 0.9 }}>Total Lavadores</span>}
              value={stats.total}
              prefix={<TeamOutlined />}
              style={{ color: 'white', fontSize: '32px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card 
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
              color: 'white'
            }}
          >
            <Statistic
              title={<span style={{ color: 'white', opacity: 0.9 }}>Activos</span>}
              value={stats.activos}
              prefix={<CheckCircleOutlined />}
              style={{ color: 'white', fontSize: '32px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card 
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              background: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)',
              color: 'white'
            }}
          >
            <Statistic
              title={<span style={{ color: 'white', opacity: 0.9 }}>Inactivos</span>}
              value={stats.inactivos}
              prefix={<CloseCircleOutlined />}
              style={{ color: 'white', fontSize: '32px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card 
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
              color: 'white'
            }}
          >
            <Statistic
              title={<span style={{ color: 'white', opacity: 0.9 }}>Total Comisiones</span>}
              value={stats.totalComisiones}
              prefix={<DollarOutlined />}
              style={{ color: 'white', fontSize: '32px' }}
              formatter={(value) => `$${value.toLocaleString('es-CO')}`}
            />
          </Card>
        </Col>
      </Row>

      {/* Barra de búsqueda */}
      <Card 
        style={{ 
          marginBottom: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
        }}
      >
        <Search
          placeholder="🔍 Buscar lavador por nombre, código o teléfono..."
          style={{ width: '100%' }}
          enterButton={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          size="large"
        />
      </Card>

      {/* Tabla de lavadores */}
      <Card
        style={{ 
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden'
        }}
      >
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <Spin size="large" />
            <p style={{ marginTop: '16px', color: '#666' }}>Cargando lavadores...</p>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={lavadoresFiltrados}
            loading={loading}
            rowKey="_id"
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} lavadores`
            }}
            locale={{
              emptyText: (
                <div style={{ textAlign: 'center', padding: '64px' }}>
                  <UserOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '16px' }} />
                  <Title level={4} style={{ color: '#666' }}>No hay lavadores registrados</Title>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    Comienza agregando tu primer lavador
                  </Text>
                  <br />
                  <Button 
                    type="primary" 
                    onClick={() => setModalVisible(true)}
                    style={{ marginTop: '24px' }}
                    size="large"
                  >
                    <PlusOutlined /> Agregar Primer Lavador
                  </Button>
                </div>
              )
            }}
          />
        )}
      </Card>

      {/* Modal para crear/editar lavador */}
      <Modal
        title={
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a' }}>
            <UserOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            {editingLavador ? '✏️ Editar Lavador' : '👷 Nuevo Lavador'}
          </div>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={submitLoading}
        okText={editingLavador ? 'Actualizar' : 'Crear'}
        cancelText="Cancelar"
        width={500}
        okButtonProps={{
          style: {
            background: '#1890ff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '500'
          }
        }}
        cancelButtonProps={{
          style: {
            borderRadius: '6px'
          }
        }}
        styles={{
          body: {
            paddingTop: '20px'
          }
        }}
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={guardarLavador}
          initialValues={{
            activo: true
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="codigo"
                label="Código"
                rules={[{ required: true, message: 'Ingresa el código del lavador' }]}
              >
                <Input 
                  placeholder="Ej: L001" 
                  prefix={<Tag color="blue">L</Tag>}
                  size="large"
                  style={{ borderRadius: '6px' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="telefono"
                label="Teléfono"
                rules={[
                  { required: true, message: 'Ingresa el teléfono' },
                  { pattern: /^[0-9]{10}$/, message: 'Teléfono inválido (10 dígitos)' }
                ]}
              >
                <Input 
                  placeholder="3001234567" 
                  size="large"
                  style={{ borderRadius: '6px' }}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="nombre"
            label="Nombre Completo"
            rules={[{ required: true, message: 'Ingresa el nombre del lavador' }]}
          >
            <Input 
              placeholder="Juan Pérez" 
              size="large"
              style={{ borderRadius: '6px' }}
            />
          </Form.Item>
          
          <Form.Item
            name="activo"
            label="Estado"
            valuePropName="checked"
          >
            <Checkbox style={{ fontSize: '15px' }}>
              <span style={{ marginLeft: '8px' }}>Lavador activo</span>
            </Checkbox>
          </Form.Item>

          <Alert
            message="Información del Sistema de Comisiones"
            description={
              <div>
                <p>✅ El lavador recibirá comisiones del <strong>40%</strong> sobre cada orden asignada.</p>
                <p>✅ Las comisiones se acumularán automáticamente en su saldo.</p>
                <p>✅ El saldo se actualiza en tiempo real al cobrar órdenes.</p>
              </div>
            }
            type="info"
            showIcon
            style={{ marginTop: '16px', borderRadius: '6px' }}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default ListaLavadores;