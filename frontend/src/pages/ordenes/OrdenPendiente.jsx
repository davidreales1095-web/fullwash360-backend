// src/pages/ordenes/OrdenPendiente.jsx - VERSIÓN FINAL CORREGIDA
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Row, 
  Col, 
  Statistic, 
  Input, 
  Select, 
  Alert, 
  Tag, 
  Divider,
  message,
  Modal,
  Spin,
  Space,
  Typography
} from 'antd';
import { 
  DollarOutlined, 
  PrinterOutlined, 
  CheckCircleOutlined,
  ArrowLeftOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import ordenesApi from '../../api/ordenesApi';
import { formatCurrency } from '../../utils/formatCurrency';

const { Title, Text } = Typography;
const { Option } = Select;

// Función para calcular vuelto
const calcularVuelto = (total, recibido) => {
  const totalNum = parseFloat(total) || 0;
  const recibidoNum = parseFloat(recibido) || 0;
  
  if (recibidoNum < totalNum) {
    return 0;
  }
  
  return recibidoNum - totalNum;
};

const OrdenPendiente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [orden, setOrden] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cobrando, setCobrando] = useState(false);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [pagoRecibido, setPagoRecibido] = useState('');
  const [vuelto, setVuelto] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  // Cargar orden
  useEffect(() => {
    cargarOrden();
  }, [id]);

  const cargarOrden = async () => {
    try {
      setLoading(true);
      
      console.log(`🔍 [FRONTEND] Cargando orden ID: ${id}`);
      
      // PRIMERO: Intentar con el endpoint específico de orden por ID
      try {
        console.log(`📡 [FRONTEND] Llamando a obtenerOrdenPorId(${id})`);
        const response = await ordenesApi.obtenerOrdenPorId(id);
        
        console.log('✅ [FRONTEND] Respuesta de obtenerOrdenPorId - COMPLETA:', response);
        console.log('📊 [FRONTEND] response.data (si existe):', response?.data);
        
        // Axios devuelve la respuesta en response.data, pero si es undefined, usar response directamente
        const responseData = response?.data || response;
        
        console.log('📊 [FRONTEND] Datos finales a procesar:', responseData);
        
        if (responseData && responseData.success && responseData.orden) {
          const ordenData = responseData.orden;
          console.log('✅ [FRONTEND] Orden encontrada via ID:', ordenData);
          
          setOrden(ordenData);
          setPagoRecibido(ordenData.precio?.toString() || ordenData.total?.toString() || '0');
          return;
        } else {
          console.log('⚠️ [FRONTEND] Respuesta exitosa pero sin datos de orden:', responseData);
        }
      } catch (apiError) {
        console.log('⚠️ [FRONTEND] Endpoint específico falló:', apiError.message);
        console.log('🔍 [FRONTEND] Error completo:', apiError);
        console.log('🔍 [FRONTEND] Error response:', apiError.response?.data || apiError.response);
      }
      
      // SEGUNDO: Fallback a buscar en órdenes recientes
      console.log('🔄 [FRONTEND] Usando fallback: obtenerOrdenesRecientes');
      try {
        const responseRecent = await ordenesApi.obtenerOrdenesRecientes();
        
        console.log('📦 [FRONTEND] Respuesta completa de obtenerOrdenesRecientes:', responseRecent);
        console.log('📦 [FRONTEND] response.data (si existe):', responseRecent?.data);
        
        // Manejar diferentes estructuras de respuesta de Axios
        const datosRecent = responseRecent?.data || responseRecent;
        console.log('📦 [FRONTEND] Datos procesados:', datosRecent);
        
        let orders = [];
        
        // Buscar orders en diferentes estructuras posibles
        if (datosRecent && datosRecent.orders && Array.isArray(datosRecent.orders)) {
          orders = datosRecent.orders;
          console.log(`📦 [FRONTEND] Usando datosRecent.orders (${orders.length} órdenes)`);
        } else if (Array.isArray(datosRecent)) {
          orders = datosRecent;
          console.log(`📦 [FRONTEND] Usando datosRecent como array (${orders.length} órdenes)`);
        } else if (datosRecent && datosRecent.data && Array.isArray(datosRecent.data)) {
          orders = datosRecent.data;
          console.log(`📦 [FRONTEND] Usando datosRecent.data (${orders.length} órdenes)`);
        }
        
        console.log(`🔍 [FRONTEND] Buscando orden ${id} en ${orders.length} órdenes`);
        
        // Buscar la orden por diferentes formatos de ID
        const ordenEncontrada = orders.find(o => {
          const idOrden = o.id || o._id;
          return idOrden === id || (idOrden && idOrden.toString() === id);
        });
        
        if (ordenEncontrada) {
          console.log('✅ [FRONTEND] Orden encontrada en lista:', ordenEncontrada);
          setOrden(ordenEncontrada);
          setPagoRecibido(ordenEncontrada.precio?.toString() || ordenEncontrada.total?.toString() || '0');
        } else {
          console.error('❌ [FRONTEND] Orden NO encontrada en lista');
          console.error('❌ [FRONTEND] IDs disponibles:', orders.map(o => o.id || o._id));
          message.error('Orden no encontrada');
          navigate('/ordenes');
        }
      } catch (fallbackError) {
        console.error('❌ [FRONTEND] Error en fallback:', fallbackError);
        throw fallbackError;
      }
    } catch (error) {
      console.error('❌ [FRONTEND] Error crítico cargando orden:', error);
      message.error('Error al cargar la orden: ' + (error.message || 'Desconocido'));
      navigate('/ordenes');
    } finally {
      setLoading(false);
    }
  };

  // Calcular vuelto cuando cambia el pago recibido
  useEffect(() => {
    if (orden && pagoRecibido && metodoPago === 'efectivo') {
      const precioOrden = orden.precio || orden.total || 0;
      const vueltoCalculado = calcularVuelto(precioOrden, pagoRecibido);
      setVuelto(vueltoCalculado);
    } else {
      setVuelto(0);
    }
  }, [pagoRecibido, orden, metodoPago]);

  // Manejar cobro
  const handleCobrar = async () => {
    if (!orden) return;

    const precioOrden = orden.precio || orden.total || 0;
    
    // Validaciones
    if (metodoPago === 'efectivo' && parseFloat(pagoRecibido) < precioOrden) {
      message.error(`Pago insuficiente. Faltan ${formatCurrency(precioOrden - parseFloat(pagoRecibido))}`);
      return;
    }

    setCobrando(true);

    try {
      const datosPago = {
        metodo_pago: metodoPago,
        pago_recibido: metodoPago === 'efectivo' ? parseFloat(pagoRecibido) : precioOrden
      };

      console.log('💵 [FRONTEND] Cobrando orden:', datosPago);
      const response = await ordenesApi.cobrarOrden(id, datosPago);
      
      console.log('✅ [FRONTEND] Orden cobrada:', response);
      message.success('¡Orden cobrada exitosamente!');
      
      // Mostrar modal de éxito
      setModalVisible(true);
      
      // Actualizar orden con datos del cobro
      setOrden({
        ...orden,
        estado: 'completado',
        metodo_pago: metodoPago,
        pago_recibido: datosPago.pago_recibido,
        vuelto: vuelto
      });

    } catch (error) {
      console.error('❌ [FRONTEND] Error cobrando orden:', error);
      console.error('❌ [FRONTEND] error.response:', error.response?.data || error.response);
      message.error(error.response?.data?.error || 'Error al cobrar la orden');
    } finally {
      setCobrando(false);
    }
  };

  // Imprimir ticket (simulado)
  const handleImprimir = () => {
    message.success('Ticket enviado a impresora');
  };

  // Navegar de regreso
  const handleVolver = () => {
    navigate('/ordenes/nueva');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" tip="Cargando orden..." />
      </div>
    );
  }

  if (!orden) {
    return (
      <Alert
        message="Orden no encontrada"
        description="La orden que buscas no existe o ha sido eliminada."
        type="error"
        showIcon
        action={
          <Button type="primary" onClick={() => navigate('/ordenes')}>
            Ver todas las órdenes
          </Button>
        }
      />
    );
  }

  const precioOrden = orden.precio || orden.total || 0;
  const comisionLavador = orden.comision_lavador || (precioOrden * 0.4);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      {/* Header personalizado */}
      <div style={{ marginBottom: '24px' }}>
        <Space>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={handleVolver}
          />
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            💵 Cobrar Orden
          </Title>
        </Space>
        <Text type="secondary">
          Orden: {orden.numero_orden || `#${id}`} - {orden.placa}
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Información de la orden */}
        <Col span={24}>
          <Card title="Detalles de la Orden">
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Statistic
                  title="Vehículo"
                  value={orden.placa}
                  prefix={<Tag color="blue">{orden.tipo_vehiculo}</Tag>}
                  valueStyle={{ fontSize: '20px' }}
                />
              </Col>
              <Col xs={24} sm={12}>
                <Statistic
                  title="Servicio"
                  value={orden.tipo_lavado}
                  prefix={
                    <Tag 
                      color={
                        orden.tipo_lavado === 'premium' ? 'gold' : 
                        orden.tipo_lavado === 'elite' ? 'purple' : 'green'
                      }
                    >
                      {orden.tipo_lavado?.toUpperCase() || 'EXPRESS'}
                    </Tag>
                  }
                  valueStyle={{ fontSize: '20px' }}
                />
              </Col>
            </Row>

            <Divider />

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Statistic
                  title="Lavada #"
                  value={orden.contador_lavada || 1}
                  suffix={`/10`}
                  valueStyle={{ 
                    color: orden.es_decima_gratis ? '#52c41a' : '#1890ff',
                    fontSize: '28px'
                  }}
                />
                {orden.es_decima_gratis && (
                  <Tag color="success" style={{ marginTop: 8 }}>
                    🎉 ¡10ma lavada GRATIS!
                  </Tag>
                )}
              </Col>
              <Col xs={24} sm={12}>
                <Statistic
                  title="Lavador"
                  value={orden.lavador || orden.lavador_nombre || 'No asignado'}
                  valueStyle={{ fontSize: '18px' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Información de pago */}
        <Col span={24}>
          <Card title="Información de Pago">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Statistic
                title="TOTAL A PAGAR"
                value={precioOrden}
                formatter={(value) => formatCurrency(value)}
                valueStyle={{ 
                  fontSize: '42px',
                  color: orden.es_decima_gratis ? '#52c41a' : '#1890ff'
                }}
              />
              {orden.es_decima_gratis && (
                <Alert
                  message="¡Orden GRATIS!"
                  description="Esta es la 10ma lavada del vehículo"
                  type="success"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}
            </div>

            <Divider>Método de Pago</Divider>

            <Row gutter={16}>
              <Col span={24}>
                <Select
                  value={metodoPago}
                  onChange={setMetodoPago}
                  size="large"
                  style={{ width: '100%', marginBottom: 16 }}
                >
                  <Option value="efectivo">💰 Efectivo</Option>
                  <Option value="tarjeta">💳 Tarjeta</Option>
                  <Option value="transferencia">🏦 Transferencia</Option>
                  <Option value="yape">📱 Yape</Option>
                  <Option value="plin">📱 Plin</Option>
                </Select>
              </Col>

              {metodoPago === 'efectivo' && (
                <>
                  <Col span={24}>
                    <Input
                      type="number"
                      prefix={<DollarOutlined />}
                      size="large"
                      placeholder="Monto recibido"
                      value={pagoRecibido}
                      onChange={(e) => setPagoRecibido(e.target.value)}
                      style={{ marginBottom: 16 }}
                    />
                  </Col>
                  
                  {vuelto > 0 && (
                    <Col span={24}>
                      <Alert
                        message={`Vuelto: ${formatCurrency(vuelto)}`}
                        type="info"
                        showIcon
                      />
                    </Col>
                  )}

                  {pagoRecibido && parseFloat(pagoRecibido) < precioOrden && (
                    <Col span={24}>
                      <Alert
                        message={`Faltan: ${formatCurrency(precioOrden - parseFloat(pagoRecibido))}`}
                        type="warning"
                        showIcon
                      />
                    </Col>
                  )}
                </>
              )}
            </Row>

            <Divider />

            {/* Comisión del lavador */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={24}>
                <Statistic
                  title="Comisión del lavador (40%)"
                  value={comisionLavador}
                  formatter={(value) => formatCurrency(value)}
                  valueStyle={{ color: '#fa8c16', fontSize: '20px' }}
                />
              </Col>
            </Row>

            {/* Botones de acción */}
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Button
                  type="default"
                  size="large"
                  icon={<PrinterOutlined />}
                  onClick={handleImprimir}
                  block
                  disabled={orden.estado === 'completado'}
                  style={{ height: '50px' }}
                >
                  Vista Previa Ticket
                </Button>
              </Col>
              <Col xs={24} sm={12}>
                <Button
                  type="primary"
                  size="large"
                  icon={cobrando ? <LoadingOutlined /> : <CheckCircleOutlined />}
                  onClick={handleCobrar}
                  loading={cobrando}
                  block
                  disabled={orden.estado === 'completado'}
                  style={{ height: '50px', fontSize: '16px' }}
                >
                  {orden.estado === 'completado' ? '✅ Ya cobrada' : '💵 Cobrar Orden'}
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Modal de éxito */}
      <Modal
        title="¡Orden Cobrada Exitosamente!"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          navigate('/ordenes');
        }}
        footer={[
          <Button 
            key="imprimir" 
            type="primary" 
            icon={<PrinterOutlined />}
            onClick={() => {
              handleImprimir();
              setModalVisible(false);
              navigate('/ordenes');
            }}
          >
            Imprimir Ticket
          </Button>,
          <Button 
            key="nueva" 
            onClick={() => {
              setModalVisible(false);
              navigate('/ordenes/nueva');
            }}
          >
            Nueva Orden
          </Button>
        ]}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a' }} />
          <h3 style={{ marginTop: 16 }}>Orden #{orden.numero_orden} cobrada</h3>
          <p>El ticket ha sido generado y está listo para imprimir.</p>
          
          <Divider />
          
          <Row gutter={16}>
            <Col span={12}>
              <Statistic
                title="Total cobrado"
                value={precioOrden}
                formatter={(value) => formatCurrency(value)}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Comisión lavador"
                value={comisionLavador}
                formatter={(value) => formatCurrency(value)}
              />
            </Col>
          </Row>
        </div>
      </Modal>
    </div>
  );
};

export default OrdenPendiente;