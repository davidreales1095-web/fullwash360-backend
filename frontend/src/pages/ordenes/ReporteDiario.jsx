// src/pages/ordenes/ReporteDiario.jsx - VERSIÓN ANT DESIGN v6
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  DatePicker, 
  Button, 
  Tag, 
  Space,
  Divider,
  Alert,
  Spin,
  Select,
  message,
  Typography
} from 'antd';
import { 
  DollarOutlined, 
  UserOutlined, 
  CarOutlined,
  DownloadOutlined,
  PrinterOutlined,
  CalendarOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ordenesApi from '../../api/ordenesApi';
import { formatCurrency, formatNumber } from '../../utils/formatCurrency';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ReporteDiario = () => {
  const [fecha, setFecha] = useState(new Date());
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lavadorFiltro, setLavadorFiltro] = useState('');
  const navigate = useNavigate();

  // Simulación de datos
  const cargarReporte = async () => {
    setLoading(true);
    try {
      // Datos de ejemplo
      const reporteEjemplo = {
        fecha: new Date().toISOString().split('T')[0],
        resumen: {
          total_ordenes: 15,
          total_ingresos: 225000,
          total_comisiones: 90000,
          ganancia_neta: 135000
        },
        metodo_pago: {
          efectivo: 150000,
          tarjeta: 50000,
          transferencia: 25000,
          otros: 0,
          total: 225000
        },
        comisiones_por_lavador: [
          { nombre: 'Juan Pérez', ordenes: 8, total_ingresos: 120000, total_comision: 48000 },
          { nombre: 'Carlos Gómez', ordenes: 5, total_ingresos: 75000, total_comision: 30000 },
          { nombre: 'María Rodríguez', ordenes: 2, total_ingresos: 30000, total_comision: 12000 }
        ],
        ordenes_detalle: [
          { numero_orden: 'ORD-001', placa: 'ABC123', tipo_vehiculo: 'carro', tipo_lavado: 'express', precio: 15000, metodo_pago: 'efectivo', lavador: 'Juan Pérez', comision: 6000, es_decima_gratis: false },
          { numero_orden: 'ORD-002', placa: 'XYZ789', tipo_vehiculo: 'moto', tipo_lavado: 'elite', precio: 15000, metodo_pago: 'tarjeta', lavador: 'Carlos Gómez', comision: 6000, es_decima_gratis: false }
        ],
        ordenes_por_tipo: {
          carro: { cantidad: 10, total: 150000 },
          moto: { cantidad: 3, total: 36000 },
          taxi: { cantidad: 2, total: 30000 }
        }
      };
      
      setReporte(reporteEjemplo);
    } catch (error) {
      console.error('Error cargando reporte:', error);
      message.error('Error al cargar el reporte diario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReporte();
  }, []);

  // Formatear fecha
  const formatoFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filtrar comisiones por lavador
  const comisionesFiltradas = reporte?.comisiones_por_lavador?.filter(lavador => 
    !lavadorFiltro || lavador.nombre.includes(lavadorFiltro)
  ) || [];

  // Columnas para tabla de comisiones
  const columnasComisiones = [
    {
      title: 'Lavador',
      dataIndex: 'nombre',
      key: 'nombre',
      render: (text) => (
        <div>
          <UserOutlined style={{ marginRight: 8 }} />
          <strong>{text}</strong>
        </div>
      ),
    },
    {
      title: 'Órdenes',
      dataIndex: 'ordenes',
      key: 'ordenes',
      align: 'center',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Total Ingresos',
      dataIndex: 'total_ingresos',
      key: 'total_ingresos',
      render: (text) => <strong>{formatCurrency(text)}</strong>,
    },
    {
      title: 'Comisión (40%)',
      dataIndex: 'total_comision',
      key: 'total_comision',
      render: (text) => (
        <strong style={{ color: '#fa8c16' }}>
          {formatCurrency(text)}
        </strong>
      ),
    },
  ];

  if (loading && !reporte) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" tip="Generando reporte..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '20px' }}>
      {/* Header personalizado */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        borderBottom: '2px solid #e0e0e0',
        paddingBottom: '15px'
      }}>
        <div>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            📊 Reporte Diario
          </Title>
          <Text type="secondary">Cierre de caja y comisiones</Text>
        </div>
        
        <Space>
          <DatePicker
            value={fecha}
            onChange={(date) => {
              setFecha(date);
              cargarReporte();
            }}
            format="DD/MM/YYYY"
            size="large"
            suffixIcon={<CalendarOutlined />}
          />
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => cargarReporte()}
            loading={loading}
          >
            Actualizar
          </Button>
          <Button 
            icon={<PrinterOutlined />} 
            onClick={() => message.success('Reporte enviado a impresión')}
          >
            Imprimir
          </Button>
          <Button 
            icon={<DownloadOutlined />} 
            type="primary"
            onClick={() => message.success('Reporte exportado como CSV')}
          >
            Exportar
          </Button>
        </Space>
      </div>

      {reporte && (
        <>
          {/* Resumen del día */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Total Órdenes"
                  value={reporte.resumen?.total_ordenes || 0}
                  valueStyle={{ color: '#1890ff', fontSize: '36px' }}
                  prefix={<CarOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Ingresos Totales"
                  value={reporte.resumen?.total_ingresos || 0}
                  formatter={(value) => formatCurrency(value)}
                  valueStyle={{ color: '#52c41a', fontSize: '32px' }}
                  prefix={<DollarOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Comisiones a Pagar"
                  value={reporte.resumen?.total_comisiones || 0}
                  formatter={(value) => formatCurrency(value)}
                  valueStyle={{ color: '#fa8c16', fontSize: '32px' }}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* Ganancia neta */}
          <Card style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={24}>
                <div style={{ textAlign: 'center' }}>
                  <Statistic
                    title="GANANCIA NETA DEL DÍA"
                    value={reporte.resumen?.ganancia_neta || 0}
                    formatter={(value) => formatCurrency(value)}
                    valueStyle={{ 
                      fontSize: '48px',
                      color: reporte.resumen?.ganancia_neta > 0 ? '#52c41a' : '#f5222d'
                    }}
                  />
                  <p style={{ color: '#666', marginTop: 8 }}>
                    Ingresos: {formatCurrency(reporte.resumen?.total_ingresos || 0)} - 
                    Comisiones: {formatCurrency(reporte.resumen?.total_comisiones || 0)}
                  </p>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Métodos de pago */}
          <Card title="Métodos de Pago" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Efectivo"
                  value={reporte.metodo_pago?.efectivo || 0}
                  formatter={(value) => formatCurrency(value)}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Tarjeta"
                  value={reporte.metodo_pago?.tarjeta || 0}
                  formatter={(value) => formatCurrency(value)}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Transferencia"
                  value={reporte.metodo_pago?.transferencia || 0}
                  formatter={(value) => formatCurrency(value)}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Otros"
                  value={reporte.metodo_pago?.otros || 0}
                  formatter={(value) => formatCurrency(value)}
                />
              </Col>
            </Row>
          </Card>

          {/* Comisiones por lavador */}
          <Card 
            title="Comisiones por Lavador" 
            style={{ marginBottom: 24 }}
            extra={
              <Select
                placeholder="Filtrar por lavador"
                style={{ width: 200 }}
                value={lavadorFiltro}
                onChange={setLavadorFiltro}
                allowClear
              >
                {reporte.comisiones_por_lavador?.map(lavador => (
                  <Option key={lavador.nombre} value={lavador.nombre}>
                    {lavador.nombre}
                  </Option>
                ))}
              </Select>
            }
          >
            <Table
              columns={columnasComisiones}
              dataSource={comisionesFiltradas}
              rowKey="nombre"
              pagination={false}
            />
          </Card>

          {/* Notas finales */}
          <Alert
            message="Cierre de Caja"
            description={
              <div>
                <p>
                  <strong>Fecha del reporte:</strong> {formatoFecha(reporte.fecha)}
                </p>
                <p>
                  <strong>Total a pagar a lavadores:</strong>{' '}
                  <span style={{ color: '#fa8c16', fontSize: '18px' }}>
                    {formatCurrency(reporte.resumen?.total_comisiones || 0)}
                  </span>
                </p>
                <p>
                  <strong>Ganancia neta de la empresa:</strong>{' '}
                  <span style={{ color: '#52c41a', fontSize: '18px' }}>
                    {formatCurrency(reporte.resumen?.ganancia_neta || 0)}
                  </span>
                </p>
              </div>
            }
            type="info"
            showIcon
            style={{ marginTop: 24 }}
          />
        </>
      )}

      {!reporte && !loading && (
        <Alert
          message="Sin datos"
          description="No hay datos de reporte para la fecha seleccionada."
          type="warning"
          showIcon
        />
      )}
    </div>
  );
};

export default ReporteDiario;