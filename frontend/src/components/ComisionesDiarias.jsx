import React, { useState, useEffect } from 'react';
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
  Input,
  Select,
  Modal,
  Tooltip,
  Badge,
  Divider,
  Descriptions
} from 'antd';
import {
  DollarOutlined,
  UserOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  EyeOutlined,
  HistoryOutlined,
  PercentageOutlined,
  ShoppingOutlined,
  ReloadOutlined,
  CalendarOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import lavadoresApi from "../api/lavadoresApi";
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extender dayjs con plugins necesarios
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es');

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ComisionesDiarias = () => {
  // ✅ CAMBIO 1: Usar hora Colombia (UTC-5) para las fechas
  const [lavadores, setLavadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fechaInicio, setFechaInicio] = useState(dayjs().utcOffset(-5).startOf('day'));
  const [fechaFin, setFechaFin] = useState(dayjs().utcOffset(-5).endOf('day'));
  const [filtroEstado, setFiltroEstado] = useState('activos');
  const [busqueda, setBusqueda] = useState('');
  const [totalComisiones, setTotalComisiones] = useState(0);
  const [totalOrdenes, setTotalOrdenes] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [lavadorSeleccionado, setLavadorSeleccionado] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    cargarComisionesDiarias();
  }, []);

  const cargarComisionesDiarias = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const dataLavadores = await lavadoresApi.obtenerLavadores();
      
      let lavadoresFiltrados = dataLavadores;
      
      if (filtroEstado === 'activos') {
        lavadoresFiltrados = lavadoresFiltrados.filter(l => l.activo);
      } else if (filtroEstado === 'inactivos') {
        lavadoresFiltrados = lavadoresFiltrados.filter(l => !l.activo);
      }
      
      if (busqueda) {
        lavadoresFiltrados = lavadoresFiltrados.filter(l =>
          l.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          l.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
          l.telefono?.includes(busqueda)
        );
      }

      const lavadoresConComisiones = await Promise.all(
        lavadoresFiltrados.map(async (lavador) => {
          try {
            // ✅ ENVIAR FECHAS EN FORMATO COLOMBIA
            const comisionesData = await lavadoresApi.obtenerComisionesLavador(
              lavador._id,
              {
                fechaInicio: fechaInicio.format('YYYY-MM-DD'),
                fechaFin: fechaFin.format('YYYY-MM-DD')
              }
            );
            
            return {
              ...lavador,
              comisionesPeriodo: comisionesData.comisiones || [],
              estadisticasPeriodo: comisionesData.estadisticas || {
                totalComisiones: 0,
                totalOrdenes: 0,
                totalVentas: 0
              }
            };
          } catch (error) {
            console.error(`Error obteniendo comisiones para ${lavador.nombre}:`, error);
            return {
              ...lavador,
              comisionesPeriodo: [],
              estadisticasPeriodo: {
                totalComisiones: 0,
                totalOrdenes: 0,
                totalVentas: 0
              }
            };
          }
        })
      );

      setLavadores(lavadoresConComisiones);
      
      const totalComisionesCalculado = lavadoresConComisiones.reduce(
        (sum, l) => sum + (l.estadisticasPeriodo.totalComisiones || 0), 0
      );
      setTotalComisiones(totalComisionesCalculado);

      const totalOrdenesCalculado = lavadoresConComisiones.reduce(
        (sum, l) => sum + (l.estadisticasPeriodo.totalOrdenes || 0), 0
      );
      setTotalOrdenes(totalOrdenesCalculado);

    } catch (error) {
      console.error('Error cargando comisiones diarias:', error);
      message.error('Error al cargar comisiones diarias');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleFechasChange = (dates) => {
    if (dates) {
      // ✅ MANTENER ZONA HORARIA COLOMBIA AL CAMBIAR FECHAS
      setFechaInicio(dates[0].utcOffset(-5));
      setFechaFin(dates[1].utcOffset(-5));
    }
  };

  const handleVerDetalle = (lavador) => {
    setLavadorSeleccionado(lavador);
    setModalVisible(true);
  };

  const handleExportExcel = () => {
    message.success('Exportando datos a Excel...');
    // Aquí iría la lógica de exportación
  };

  const handleRefresh = () => {
    cargarComisionesDiarias();
  };

  const columns = [
    {
      title: 'LAVADOR',
      dataIndex: 'nombre',
      key: 'nombre',
      width: 220,
      fixed: 'left',
      render: (nombre, record) => (
        <Space align="center">
          <Badge 
            dot 
            color={record.activo ? '#52c41a' : '#ff4d4f'}
            offset={[-5, 5]}
          >
            <Avatar 
              size="large"
              icon={<UserOutlined />}
              style={{ 
                backgroundColor: record.activo ? '#1890ff' : '#d9d9d9',
                cursor: 'pointer'
              }}
              onClick={() => handleVerDetalle(record)}
            />
          </Badge>
          <div>
            <Text strong style={{ fontSize: '14px' }}>{nombre}</Text>
            <div style={{ marginTop: '2px' }}>
              <Tag color="blue" size="small">{record.codigo}</Tag>
              {record.telefono && (
                <Text type="secondary" style={{ fontSize: '11px', marginLeft: '8px' }}>
                  📱 {record.telefono}
                </Text>
              )}
            </div>
          </div>
        </Space>
      ),
      sorter: (a, b) => a.nombre.localeCompare(b.nombre)
    },
    {
      // ✅ CAMBIO 2: "ÓRDENES" → "ÓRDENES HOY"
      title: 'ÓRDENES HOY',
      key: 'ordenes',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Tooltip title="Órdenes de hoy">
          <div style={{ textAlign: 'center' }}>
            <Badge 
              count={record.estadisticasPeriodo.totalOrdenes || 0} 
              style={{ 
                backgroundColor: '#1890ff',
                fontSize: '12px'
              }}
            />
          </div>
        </Tooltip>
      ),
      sorter: (a, b) => 
        (a.estadisticasPeriodo.totalOrdenes || 0) - (b.estadisticasPeriodo.totalOrdenes || 0)
    },
    {
      // ✅ CAMBIO 3: "COMISIONES PERÍODO" → "COMISIONES HOY"
      title: 'COMISIONES HOY',
      key: 'comisiones',
      width: 180,
      align: 'right',
      render: (_, record) => (
        <Tooltip title="Comisiones de hoy">
          <div>
            <Text strong style={{ 
              color: '#389e0d', 
              fontSize: '15px',
              fontWeight: '600'
            }}>
              ${(record.estadisticasPeriodo.totalComisiones || 0).toLocaleString('es-CO')}
            </Text>
            <div style={{ fontSize: '11px', color: '#8c8c8c', marginTop: '2px' }}>
              Hoy
            </div>
          </div>
        </Tooltip>
      ),
      sorter: (a, b) => 
        (a.estadisticasPeriodo.totalComisiones || 0) - (b.estadisticasPeriodo.totalComisiones || 0)
    },
    {
      // ✅ CAMBIO 4: "SALDO ACUMULADO" → "SALDO HISTÓRICO"
      title: 'SALDO HISTÓRICO',
      dataIndex: 'saldo_comisiones',
      key: 'saldo',
      width: 180,
      align: 'right',
      render: (saldo, record) => (
        <Tooltip title="Total acumulado de todas las comisiones">
          <div>
            <Text strong style={{ 
              color: '#096dd9', 
              fontSize: '15px',
              fontWeight: '600'
            }}>
              ${(saldo || 0).toLocaleString('es-CO')}
            </Text>
            <div style={{ fontSize: '11px', color: '#8c8c8c', marginTop: '2px' }}>
              Acumulado total
            </div>
          </div>
        </Tooltip>
      ),
      sorter: (a, b) => (a.saldo_comisiones || 0) - (b.saldo_comisiones || 0)
    },
    {
      title: 'ACCIONES',
      key: 'acciones',
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Ver detalle">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleVerDetalle(record)}
              style={{ color: '#1890ff' }}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Historial completo">
            <Button
              type="text"
              icon={<HistoryOutlined />}
              size="small"
              onClick={() => message.info(`Redirigiendo al historial de ${record.nombre}`)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div style={{ 
      padding: '20px 24px', 
      backgroundColor: '#f0f2f5', 
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial'
    }}>
      {/* Header Principal */}
      <Card 
        bordered={false}
        style={{ 
          marginBottom: '20px',
          borderRadius: '8px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)'
        }}
        bodyStyle={{ padding: '20px 24px' }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size="small">
              <Space align="center">
                <BarChartOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                <Title level={3} style={{ margin: 0, fontWeight: '600' }}>
                  Comisiones Diarias
                </Title>
              </Space>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                Gestión y control de comisiones por lavador • Período: {fechaInicio.format('DD/MM/YYYY')} - {fechaFin.format('DD/MM/YYYY')}
              </Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Tooltip title="Refrescar datos">
                <Button
                  icon={<ReloadOutlined spin={refreshing} />}
                  onClick={handleRefresh}
                  loading={refreshing}
                  shape="circle"
                />
              </Tooltip>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExportExcel}
              >
                Exportar
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Tarjetas de Estadísticas */}
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card 
            bordered={false}
            style={{ borderRadius: '8px' }}
            bodyStyle={{ padding: '20px' }}
          >
            <Statistic
              title={
                <Space>
                  <ShoppingOutlined style={{ color: '#1890ff' }} />
                  <span>Total Órdenes</span>
                </Space>
              }
              value={totalOrdenes}
              valueStyle={{ 
                color: '#1890ff',
                fontSize: '28px',
                fontWeight: '600'
              }}
              suffix={
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  órdenes
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            bordered={false}
            style={{ borderRadius: '8px' }}
            bodyStyle={{ padding: '20px' }}
          >
            <Statistic
              title={
                <Space>
                  <DollarOutlined style={{ color: '#52c41a' }} />
                  <span>Total Comisiones</span>
                </Space>
              }
              value={totalComisiones}
              prefix="$"
              valueStyle={{ 
                color: '#52c41a',
                fontSize: '28px',
                fontWeight: '600'
              }}
              suffix="COP"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            bordered={false}
            style={{ borderRadius: '8px' }}
            bodyStyle={{ padding: '20px' }}
          >
            <Statistic
              title={
                <Space>
                  <UserOutlined style={{ color: '#722ed1' }} />
                  <span>Lavadores Activos</span>
                </Space>
              }
              value={lavadores.filter(l => l.activo).length}
              valueStyle={{ 
                color: '#722ed1',
                fontSize: '28px',
                fontWeight: '600'
              }}
              suffix={
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  de {lavadores.length}
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            bordered={false}
            style={{ borderRadius: '8px' }}
            bodyStyle={{ padding: '20px' }}
          >
            <Statistic
              title={
                <Space>
                  <PercentageOutlined style={{ color: '#fa8c16' }} />
                  <span>Comisión Promedio</span>
                </Space>
              }
              value={lavadores.length > 0 ? totalComisiones / lavadores.length : 0}
              prefix="$"
              precision={0}
              valueStyle={{ 
                color: '#fa8c16',
                fontSize: '28px',
                fontWeight: '600'
              }}
              suffix="COP"
            />
          </Card>
        </Col>
      </Row>

      {/* Filtros Compactos */}
      <Card 
        bordered={false}
        style={{ 
          marginBottom: '20px',
          borderRadius: '8px'
        }}
        bodyStyle={{ padding: '16px 20px' }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>
                <CalendarOutlined /> Rango de fechas
              </Text>
              <RangePicker
                style={{ width: '100%' }}
                value={[fechaInicio, fechaFin]}
                onChange={handleFechasChange}
                format="DD/MM/YYYY"
                allowClear={false}
                size="middle"
              />
            </div>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>
                <FilterOutlined /> Estado
              </Text>
              <Select
                style={{ width: '100%' }}
                value={filtroEstado}
                onChange={setFiltroEstado}
                size="middle"
              >
                <Option value="todos">Todos</Option>
                <Option value="activos">Activos</Option>
                <Option value="inactivos">Inactivos</Option>
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>
                <SearchOutlined /> Buscar lavador
              </Text>
              <Input
                placeholder="Nombre, código o teléfono..."
                prefix={<SearchOutlined />}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onPressEnter={cargarComisionesDiarias}
                allowClear
                size="middle"
              />
            </div>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <Button
                onClick={() => {
                  // ✅ CAMBIO 5: Botón limpiar también usa hora Colombia
                  setFechaInicio(dayjs().utcOffset(-5).startOf('day'));
                  setFechaFin(dayjs().utcOffset(-5).endOf('day'));
                  setFiltroEstado('activos');
                  setBusqueda('');
                }}
              >
                Limpiar
              </Button>
              <Button
                type="primary"
                icon={<FilterOutlined />}
                onClick={cargarComisionesDiarias}
                loading={loading}
              >
                Aplicar Filtros
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Tabla Principal */}
      <Card 
        bordered={false}
        style={{ 
          borderRadius: '8px',
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Text strong style={{ fontSize: '16px' }}>
                  Detalle de Comisiones por Lavador
                </Text>
                <Tag color="blue" style={{ borderRadius: '12px' }}>
                  {lavadores.length} lavadores
                </Tag>
              </Space>
            </Col>
            <Col>
              <Text type="secondary" style={{ fontSize: '13px' }}>
                Última actualización: {dayjs().format('HH:mm')}
              </Text>
            </Col>
          </Row>
        </div>
        
        <Table
          columns={columns}
          dataSource={lavadores}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} lavadores`
          }}
          locale={{
            emptyText: (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <ShoppingOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                <Title level={4} style={{ color: '#bfbfbf' }}>
                  No hay datos disponibles
                </Title>
                <Text type="secondary">
                  No se encontraron lavadores con comisiones en el período seleccionado
                </Text>
                <br />
                <Button 
                  type="link" 
                  onClick={cargarComisionesDiarias}
                  style={{ marginTop: '16px' }}
                >
                  Recargar datos
                </Button>
              </div>
            )
          }}
          scroll={{ x: 900 }}
          sticky
        />
      </Card>

      {/* Modal de Detalle */}
      <Modal
        title={
          <Space align="center">
            <Avatar 
              size={40}
              icon={<UserOutlined />}
              style={{ 
                backgroundColor: lavadorSeleccionado?.activo ? '#1890ff' : '#d9d9d9',
              }}
            />
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {lavadorSeleccionado?.nombre || 'Lavador'}
              </Title>
              <Text type="secondary">
                Detalle completo de comisiones y rendimiento
              </Text>
            </div>
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Cerrar
          </Button>,
          <Button 
            key="history" 
            type="primary"
            onClick={() => {
              message.info('Redirigiendo al historial completo...');
              setModalVisible(false);
            }}
          >
            Ver Historial Completo
          </Button>
        ]}
        width={800}
        centered
        styles={{
          header: { borderBottom: '1px solid #f0f0f0', paddingBottom: '16px' },
          footer: { borderTop: '1px solid #f0f0f0', paddingTop: '16px' }
        }}
      >
        {lavadorSeleccionado && (
          <div>
            {/* Resumen */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col span={8}>
                <Card size="small" bordered={false}>
                  <Statistic
                    title="Comisión %"
                    value={lavadorSeleccionado.comision_porcentaje || 40}
                    suffix="%"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" bordered={false}>
                  <Statistic
                    title="Órdenes Hoy"
                    value={lavadorSeleccionado.estadisticasPeriodo.totalOrdenes || 0}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" bordered={false}>
                  <Statistic
                    title="Comisiones Hoy"
                    value={lavadorSeleccionado.estadisticasPeriodo.totalComisiones || 0}
                    prefix="$"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Detalles */}
            <Descriptions 
              bordered 
              column={2}
              size="small"
              style={{ marginBottom: '24px' }}
              labelStyle={{ fontWeight: '600', width: '40%' }}
            >
              <Descriptions.Item label="Código">
                <Tag color="blue">{lavadorSeleccionado.codigo}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Teléfono">
                {lavadorSeleccionado.telefono || 'No registrado'}
              </Descriptions.Item>
              <Descriptions.Item label="Período analizado">
                {fechaInicio.format('DD/MM/YYYY')} - {fechaFin.format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Saldo Histórico Total">
                <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
                  ${(lavadorSeleccionado.saldo_comisiones || 0).toLocaleString('es-CO')}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ventas Hoy">
                ${(lavadorSeleccionado.estadisticasPeriodo.totalVentas || 0).toLocaleString('es-CO')}
              </Descriptions.Item>
              <Descriptions.Item label="Promedio por Orden">
                <Text strong>
                  ${lavadorSeleccionado.estadisticasPeriodo.totalOrdenes > 0 
                    ? Math.round((lavadorSeleccionado.estadisticasPeriodo.totalComisiones || 0) / lavadorSeleccionado.estadisticasPeriodo.totalOrdenes)
                    : 0
                  }
                </Text>
              </Descriptions.Item>
            </Descriptions>

            {/* Últimas órdenes */}
            <Divider orientation="left">
              <Space>
                <HistoryOutlined />
                <span>Últimas Órdenes de Hoy</span>
              </Space>
            </Divider>
            
            {lavadorSeleccionado.comisionesPeriodo.length > 0 ? (
              lavadorSeleccionado.comisionesPeriodo.slice(0, 3).map((orden, index) => (
                <Card 
                  key={index} 
                  size="small" 
                  style={{ marginBottom: '8px', borderLeft: '3px solid #1890ff' }}
                >
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Space direction="vertical" size={0}>
                        <Text strong>Orden #{orden.numero_orden} • {orden.placa}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {dayjs(orden.fecha_cobro).format('DD/MM/YYYY HH:mm')}
                        </Text>
                      </Space>
                    </Col>
                    <Col>
                      <Space>
                        <Text type="secondary">
                          Total: ${orden.total?.toLocaleString('es-CO')}
                        </Text>
                        <Divider type="vertical" />
                        <Text strong style={{ color: '#52c41a' }}>
                          Comisión: ${orden.comision?.toLocaleString('es-CO')}
                        </Text>
                      </Space>
                    </Col>
                  </Row>
                </Card>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <ShoppingOutlined style={{ fontSize: '32px', color: '#d9d9d9', marginBottom: '12px' }} />
                <Text type="secondary">
                  No hay órdenes registradas hoy
                </Text>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ComisionesDiarias;