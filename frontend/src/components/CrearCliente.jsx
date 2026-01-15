import React, { useState, useContext } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Select, 
  InputNumber,
  message, 
  Row, 
  Col,
  Typography,
  Space,
  Divider,
  Tag,
  Modal,
  Alert
} from 'antd';
import { 
  ArrowLeftOutlined, 
  UserAddOutlined,
  CarOutlined,
  PhoneOutlined,
  IdcardOutlined,
  CheckCircleOutlined,
  CalculatorOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import clientesApi from '../../api/clientesApi';
import { AuthContext } from '../../context/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

const CrearCliente = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [lavadasAcumuladas, setLavadasAcumuladas] = useState(0);
  const { user } = useContext(AuthContext);

  const tiposVehiculo = [
    { value: 'carro', label: '🚗 Carro' },
    { value: 'moto', label: '🏍️ Moto' },
    { value: 'taxi', label: '🚕 Taxi' }
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      console.log('📤 Enviando datos del cliente:', values);
      
      // Preparar datos para el backend INCLUYENDO punto_id y lavados_pagados
      const clienteData = {
        nombre_completo: values.nombre_completo,
        telefono: values.telefono,
        placa_vehiculo: values.placa_vehiculo,
        tipo_vehiculo: values.tipo_vehiculo || 'carro',
        lavados_pagados: values.lavados_pagados || 0, // Campo de lavadas acumuladas
        punto_id: user.punto_id,
      };

      console.log('🧮 Datos completos enviados:', clienteData);

      const response = await clientesApi.crearCliente(clienteData);
      
      if (response.success) {
        const clienteCreado = response.cliente;
        const fidelizacion = response.fidelizacion;
        
        // Calcular lavadas restantes para gratis
        const lavadasRestantes = 10 - (clienteData.lavados_pagados % 10);
        
        // Mostrar mensaje de éxito
        message.success({
          content: (
            <div>
              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
              <span>Cliente creado exitosamente</span>
            </div>
          ),
          duration: 3,
        });

        // Mostrar modal de éxito con información de fidelización
        Modal.success({
          title: '🎉 Cliente registrado exitosamente',
          content: (
            <div style={{ marginTop: 16 }}>
              <p><strong>Nombre:</strong> {clienteCreado.nombre_completo}</p>
              <p><strong>Teléfono:</strong> {clienteCreado.telefono}</p>
              <p><strong>Placa:</strong> {clienteCreado.placa_vehiculo}</p>
              <p><strong>Tipo de vehículo:</strong> {clienteCreado.tipo_vehiculo || 'Carro'}</p>
              <Divider style={{ margin: '12px 0' }} />
              <Text strong style={{ color: '#1890ff' }}>
                📊 Sistema de Fidelización
              </Text>
              <p><strong>Lavadas acumuladas:</strong> {clienteData.lavados_pagados}</p>
              <p><strong>Lavadas para próximo GRATIS:</strong> {lavadasRestantes}</p>
              <p><strong>Estado:</strong> {fidelizacion?.estado || 'activo'}</p>
            </div>
          ),
          okText: 'Aceptar',
          onOk: () => {
            // Preguntar si quiere crear otro
            setTimeout(() => {
              const crearOtro = window.confirm('¿Desea crear otro cliente?');
              if (crearOtro) {
                form.resetFields();
                form.setFieldsValue({
                  tipo_vehiculo: 'carro',
                  lavados_pagados: 0
                });
                setLavadasAcumuladas(0);
              } else {
                navigate('/dashboard');
              }
            }, 500);
          }
        });
      } else {
        message.error({
          content: response.msg || 'Error al crear cliente',
          duration: 4,
        });
      }
    } catch (error) {
      console.error('❌ Error al crear cliente:', error);
      message.error({
        content: error.msg || error.message || 'Error de conexión',
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear placa automáticamente
  const formatPlaca = (e) => {
    const value = e.target.value.toUpperCase();
    form.setFieldsValue({ placa_vehiculo: value });
  };

  // Función para calcular lavadas restantes
  const calcularLavadasRestantes = (lavadas) => {
    return 10 - (lavadas % 10);
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px 16px',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: '24px' }}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/dashboard')}
          style={{ padding: 0, color: '#1890ff' }}
        >
          Volver al Dashboard
        </Button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{
            background: 'linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 4px 12px rgba(19, 194, 194, 0.3)'
          }}>
            <UserAddOutlined style={{ fontSize: '32px', color: 'white' }} />
          </div>
          <div>
            <Title level={2} style={{ margin: 0, color: '#1890ff', fontSize: '28px' }}>
              Registrar Nuevo Cliente
            </Title>
            <Text type="secondary" style={{ fontSize: '15px' }}>
              Sistema simplificado - Con fidelización por vehículo
            </Text>
          </div>
        </div>
      </Space>

      {/* Información del punto */}
      <Card 
        size="small" 
        style={{ 
          marginBottom: '20px',
          background: '#f0f9ff',
          border: '1px solid #91d5ff'
        }}
      >
        <Space>
          <Text strong>📍 Punto:</Text>
          <Tag color="blue">{user?.punto_nombre || `Punto ${user?.punto_id || 'No asignado'}`}</Tag>
          <Text type="secondary">|</Text>
          <Text strong>👤 Registrado por:</Text>
          <Tag color="green">{user?.nombre || user?.codigo}</Tag>
        </Space>
      </Card>

      {/* Formulario principal */}
      <Card 
        style={{ 
          borderRadius: '16px',
          boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
          border: 'none',
          marginBottom: '24px'
        }}
        styles={{ body: { padding: '32px' } }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            tipo_vehiculo: 'carro',
            lavados_pagados: 0
          }}
        >
          <Row gutter={[32, 24]}>
            {/* Columna izquierda: Datos personales */}
            <Col xs={24} md={12}>
              <Divider orientation="left" style={{ borderColor: '#1890ff' }}>
                <Space>
                  <IdcardOutlined style={{ color: '#1890ff' }} />
                  <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
                    Datos Personales
                  </Text>
                </Space>
              </Divider>
              
              <Form.Item
                label="Nombre Completo"
                name="nombre_completo"
                rules={[
                  { required: true, message: 'El nombre es obligatorio' },
                  { min: 3, message: 'Mínimo 3 caracteres' }
                ]}
              >
                <Input 
                  placeholder="Ej: Juan Carlos Pérez" 
                  size="large"
                  prefix={<UserAddOutlined style={{ color: '#1890ff' }} />}
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>

              <Form.Item
                label="Teléfono"
                name="telefono"
                rules={[
                  { required: true, message: 'El teléfono es obligatorio' },
                  { pattern: /^[0-9]{7,15}$/, message: 'Teléfono no válido (7-15 dígitos)' }
                ]}
              >
                <Input 
                  placeholder="Ej: 3001234567" 
                  size="large"
                  prefix={<PhoneOutlined style={{ color: '#52c41a' }} />}
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>

            {/* Columna derecha: Vehículo */}
            <Col xs={24} md={12}>
              <Divider orientation="left" style={{ borderColor: '#13c2c2' }}>
                <Space>
                  <CarOutlined style={{ color: '#13c2c2' }} />
                  <Text strong style={{ color: '#13c2c2', fontSize: '16px' }}>
                    Vehículo Principal
                  </Text>
                </Space>
              </Divider>

              <Form.Item
                label="Tipo de Vehículo"
                name="tipo_vehiculo"
                rules={[
                  { required: true, message: 'Seleccione el tipo de vehículo' }
                ]}
              >
                <Select 
                  size="large" 
                  placeholder="Seleccionar tipo de vehículo"
                  style={{ borderRadius: '8px' }}
                >
                  {tiposVehiculo.map(tipo => (
                    <Option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Placa del Vehículo"
                name="placa_vehiculo"
                rules={[
                  { required: true, message: 'La placa es obligatoria' },
                  { pattern: /^[A-Za-z0-9]{3,8}$/, message: 'Placa inválida (3-8 caracteres)' }
                ]}
                extra="El sistema de fidelización funciona por placa"
              >
                <Input 
                  placeholder="Ej: ABC123" 
                  size="large"
                  prefix={<CarOutlined style={{ color: '#13c2c2' }} />}
                  style={{ borderRadius: '8px', textTransform: 'uppercase' }}
                  onChange={formatPlaca}
                  maxLength={8}
                />
              </Form.Item>

              <Form.Item
                label="Lavadas Pagadas Acumuladas"
                name="lavados_pagados"
                rules={[
                  { required: true, message: 'Ingrese el número de lavadas pagadas' },
                  { type: 'number', min: 0, max: 999, message: 'Debe ser un número entre 0 y 999' }
                ]}
                extra={
                  lavadasAcumuladas > 0 ? (
                    <Space>
                      <CalculatorOutlined />
                      <Text type="secondary">
                        Lavadas restantes para GRATIS: {10 - (lavadasAcumuladas % 10)}
                      </Text>
                    </Space>
                  ) : '0 = cliente nuevo'
                }
              >
                <InputNumber 
                  min={0}
                  max={999}
                  size="large"
                  style={{ width: '100%', borderRadius: '8px' }}
                  placeholder="Ej: 5 (si ya tiene lavadas acumuladas)"
                  onChange={(value) => setLavadasAcumuladas(value || 0)}
                  addonAfter="lavadas"
                />
              </Form.Item>

              {/* Información del sistema */}
              {lavadasAcumuladas > 0 && (
                <Alert
                  message="📊 Información de Fidelización"
                  description={
                    <div>
                      <p><strong>Lavadas acumuladas:</strong> {lavadasAcumuladas}</p>
                      <p><strong>Lavadas para próximo GRATIS:</strong> {10 - (lavadasAcumuladas % 10)}</p>
                      <p><strong>Lavados gratis obtenidos:</strong> {Math.floor(lavadasAcumuladas / 10)}</p>
                      <p><strong>Estado:</strong> {lavadasAcumuladas % 10 === 0 ? '🔔 ¡Lavado GRATIS disponible!' : '✅ Activo'}</p>
                    </div>
                  }
                  type="info"
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
              )}
            </Col>
          </Row>

          <Divider style={{ margin: '32px 0' }} />
          
          <Row justify="space-between" align="middle">
            <Col>
              <Space direction="vertical" size="small">
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  ℹ️ 5 campos obligatorios: Nombre, Teléfono, Tipo de Vehículo, Placa y Lavadas Acumuladas
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Los demás datos se completan al crear órdenes
                </Text>
              </Space>
            </Col>
            
            <Col>
              <Space size="large">
                <Button 
                  size="large"
                  onClick={() => navigate('/dashboard')}
                  style={{ 
                    width: '120px',
                    borderRadius: '8px',
                    height: '44px'
                  }}
                >
                  Cancelar
                </Button>
                
                <Button 
                  type="primary" 
                  size="large"
                  htmlType="submit"
                  loading={loading}
                  icon={<UserAddOutlined />}
                  style={{ 
                    width: '180px',
                    background: 'linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    height: '44px',
                    fontSize: '16px'
                  }}
                >
                  {loading ? 'Creando...' : 'Crear Cliente'}
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Tarjeta informativa */}
      <Card 
        size="small" 
        styles={{ body: { padding: '16px' } }}
        style={{ 
          background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
          borderColor: '#b7eb8f',
          borderRadius: '12px'
        }}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              background: '#52c41a',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              🎯
            </div>
            <Text strong style={{ color: '#52c41a' }}>
              Sistema de Fidelización por Vehículo
            </Text>
          </div>
          
          <div style={{ paddingLeft: '32px' }}>
            <ul style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              <li>✅ <strong>Cada 10 lavados por vehículo</strong> = 1 GRATIS</li>
              <li>✅ Puede registrar <strong>lavadas acumuladas</strong> al crear el cliente</li>
              <li>✅ Si un cliente tiene 7 lavadas, le faltan 3 para el GRATIS</li>
              <li>✅ Si tiene 12 lavadas, ya obtuvo 1 GRATIS y le faltan 8 para el siguiente</li>
              <li>✅ El sistema calcula automáticamente las lavadas restantes</li>
              <li>✅ Cada lavado gratis se registra en el historial</li>
              <li>✅ Un cliente puede tener múltiples vehículos, cada uno con su contador</li>
            </ul>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default CrearCliente;