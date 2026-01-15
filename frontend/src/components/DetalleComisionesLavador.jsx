import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  DatePicker,
  Statistic,
  Row,
  Col,
  message,
  Spin,
  Tag,
  Typography,
  Space,
  Button,
  Avatar,
  Descriptions,
  Timeline,
  Progress
} from 'antd';
import {
  DollarOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  CalendarOutlined,
  ShoppingOutlined,
  HistoryOutlined,
  PercentageOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import lavadoresApi from '../api/lavadoresApi';  // ✅ CORREGIDO: Cambiado de "../../" a "../"
import dayjs from 'dayjs';
import 'dayjs/locale/es';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

dayjs.locale('es');

const DetalleComisionesLavador = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lavador, setLavador] = useState(null);
  const [comisiones, setComisiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fechaInicio, setFechaInicio] = useState(dayjs().startOf('month'));
  const [fechaFin, setFechaFin] = useState(dayjs());
  const [estadisticas, setEstadisticas] = useState({});

  useEffect(() => {
    if (id) {
      cargarDetalleLavador();
      cargarComisionesLavador();
    }
  }, [id]);

  const cargarDetalleLavador = async () => {
    try {
      const data = await lavadoresApi.obtenerLavadorPorId(id);
      setLavador(data.lavador || data);
    } catch (error) {
      console.error('Error cargando lavador:', error);
      message.error('Error al cargar información del lavador');
    }
  };

  const cargarComisionesLavador = async () => {
    setLoading(true);
    try {
      const data = await lavadoresApi.obtenerComisionesLavador(id, {
        fechaInicio: fechaInicio.format('YYYY-MM-DD'),
        fechaFin: fechaFin.format('YYYY-MM-DD')
      });
      
      setComisiones(data.comisiones || []);
      setEstadisticas(data.estadisticas || {});
    } catch (error) {
      console.error('Error cargando comisiones:', error);
      message.error('Error al cargar comisiones del lavador');
    } finally {
      setLoading(false);
    }
  };

  const handleFechasChange = (dates) => {
    if (dates) {
      setFechaInicio(dates[0]);
      setFechaFin(dates[1]);
      // Recargar con nuevas fechas
      setTimeout(() => cargarComisionesLavador(), 100);
    }
  };

  const columns = [
    {
      title: 'FECHA',
      dataIndex: 'fecha_cobro',
      key: 'fecha',
      width: 120,
      render: (fecha) => dayjs(fecha).format('DD/MM/YY'),
      sorter: (a, b) => new Date(a.fecha_cobro) - new Date(b.fecha_cobro)
    },
    {
      title: 'ORDEN',
      dataIndex: 'numero_orden',
      key: 'orden',
      width: 120,
      render: (numero) => <Tag color="blue">#{numero}</Tag>
    },
    {
      title: 'PLACA',
      dataIndex: 'placa',
      key: 'placa',
      width: 100,
      render: (placa) => <Text strong>{placa}</Text>
    },
    {
      title: 'TOTAL ORDEN',
      dataIndex: 'total',
      key: 'total',
      width: 150,
      align: 'right',
      render: (total) => `$${total.toLocaleString('es-CO')}`,
      sorter: (a, b) => a.total - b.total
    },
    {
      title: 'COMISIÓN (40%)',
      dataIndex: 'comision',
      key: 'comision',
      width: 150,
      align: 'right',
      render: (comision) => (
        <Tag color="green" style={{ fontWeight: '600' }}>
          ${comision.toLocaleString('es-CO')}
        </Tag>
      ),
      sorter: (a, b) => a.comision - b.comision
    },
    {
      title: 'PORCENTAJE',
      key: 'porcentaje',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Text type="secondary">
          {record.porcentaje || 40}%
        </Text>
      )
    }
  ];

  if (loading && !lavador) {
    return (
      <div style={{ padding: '100px', textAlign: 'center' }}>
        <Spin size="large" />
        <p>Cargando información del lavador...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Encabezado */}
      <Card style={{ marginBottom: '24px' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              style={{ marginRight: '16px' }}
            >
              Volver
            </Button>
            <Avatar 
              size={64}
              style={{ 
                backgroundColor: lavador?.activo ? '#1890ff' : '#d9d9d9',
                color: 'white',
                fontSize: '24px'
              }}
              icon={<UserOutlined />}
            />
            <div>
              <Title level={3} style={{ margin: 0 }}>
                {lavador?.nombre || 'Lavador'}
              </Title>
              <Text type="secondary">
                Código: {lavador?.codigo} | Teléfono: {lavador?.telefono || 'N/A'}
              </Text>
            </div>
          </Space>
          
          <Tag color={lavador?.activo ? 'green' : 'red'} style={{ fontSize: '14px', padding: '8px 16px' }}>
            {lavador?.activo ? 'ACTIVO' : 'INACTIVO'}
          </Tag>
        </Space>
      </Card>

      {/* Estadísticas del lavador */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Saldo Total"
              value={lavador?.saldo_comisiones || 0}
              prefix={<DollarOutlined />}
              suffix="COP"
              valueStyle={{ color: '#389e0d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Comisión Período"
              value={estadisticas.totalComisiones || 0}
              prefix={<DollarOutlined />}
              suffix="COP"
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Órdenes Período"
              value={estadisticas.totalOrdenes || 0}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Porcentaje Comisión"
              value={lavador?.comision_porcentaje || 40}
              prefix={<PercentageOutlined />}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtros de fechas */}
      <Card style={{ marginBottom: '24px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text strong>Seleccionar período:</Text>
          <RangePicker
            style={{ width: '300px' }}
            value={[fechaInicio, fechaFin]}
            onChange={handleFechasChange}
            format="YYYY-MM-DD"
            allowClear={false}
          />
          <Text type="secondary">
            Período: {fechaInicio.format('DD/MM/YYYY')} - {fechaFin.format('DD/MM/YYYY')}
          </Text>
        </Space>
      </Card>

      {/* Tabla de comisiones */}
      <Card
        title={
          <Space>
            <HistoryOutlined />
            <span>Historial de Comisiones</span>
            <Tag color="blue">
              {comisiones.length} órdenes
            </Tag>
          </Space>
        }
        style={{ marginBottom: '24px' }}
      >
        <Table
          columns={columns}
          dataSource={comisiones}
          rowKey="orden_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: 'No hay comisiones en este período'
          }}
          summary={() => (
            <Table.Summary.Row style={{ background: '#f9f9f9' }}>
              <Table.Summary.Cell index={0} colSpan={3}>
                <Text strong>TOTALES:</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <Text strong>${estadisticas.totalVentas?.toLocaleString('es-CO') || 0}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} align="right">
                <Tag color="green" style={{ fontWeight: '700' }}>
                  ${estadisticas.totalComisiones?.toLocaleString('es-CO') || 0}
                </Tag>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3} align="center">
                <Text strong>40%</Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </Card>

      {/* Resumen */}
      <Card title="Resumen de Rendimiento">
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Descriptions column={1}>
              <Descriptions.Item label="Promedio por orden">
                <Text strong>
                  ${estadisticas.totalOrdenes > 0 
                    ? (estadisticas.totalComisiones / estadisticas.totalOrdenes).toFixed(0).toLocaleString('es-CO') 
                    : 0}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Comisión más alta">
                <Text strong>
                  ${Math.max(...comisiones.map(c => c.comision || 0)).toLocaleString('es-CO') || 0}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={12}>
            <div style={{ textAlign: 'center' }}>
              <Text strong>Porcentaje del total de comisiones:</Text>
              <Progress
                type="circle"
                percent={100}
                width={100}
                format={() => '40%'}
                strokeColor="#1890ff"
                style={{ marginTop: '16px' }}
              />
              <div style={{ marginTop: '8px' }}>
                <Text type="secondary">Comisión fija por orden</Text>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default DetalleComisionesLavador;