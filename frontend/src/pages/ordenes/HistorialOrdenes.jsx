import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  DatePicker, 
  Space, 
  Statistic, 
  Row, 
  Col,
  Input,
  message,
  Typography,
  Select,
  Spin,
  Badge,
  Tooltip,
  Modal,
  Divider,
  Collapse,
  Slider,
  Alert,
  Progress
} from 'antd';
import { 
  SearchOutlined, 
  PrinterOutlined, 
  CalendarOutlined,
  ReloadOutlined,
  DollarOutlined,
  FilterOutlined,
  HistoryOutlined,
  CarOutlined,
  UserOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  EyeOutlined,
  SettingOutlined,
  ClearOutlined,
  InfoCircleOutlined,
  ExportOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { formatCurrency } from '../../utils/formatCurrency';
import ordenesApi from '../../api/ordenesApi';
import lavadoresApi from '../../api/lavadoresApi';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Configurar dayjs para zona horaria de Colombia
import 'dayjs/locale/es';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.locale('es');

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

// Función para obtener fecha en hora Colombia
const getFechaColombia = (date = null) => {
  if (date) {
    return dayjs(date).utcOffset(-5);
  }
  return dayjs().utcOffset(-5);
};

const HistorialOrdenes = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('hoy');
  const [fechaEspecifica, setFechaEspecifica] = useState(getFechaColombia());
  const [estadisticas, setEstadisticas] = useState(null);
  const [search, setSearch] = useState('');
  const [filtrosAvanzados, setFiltrosAvanzados] = useState({
    tipoVehiculo: [],
    tipoLavado: [],
    metodoPago: [],
    lavadorId: null,
    minMonto: 0,
    maxMonto: 1000000,
    ordenarPor: 'fecha',
    orden: 'desc'
  });
  const [lavadores, setLavadores] = useState([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [rangoFechas, setRangoFechas] = useState([
    getFechaColombia().subtract(7, 'day'),
    getFechaColombia()
  ]);
  const navigate = useNavigate();

  // Cargar lavadores al inicio
  useEffect(() => {
    cargarLavadores();
  }, []);

  // ✅ Cargar historial al montar el componente
  useEffect(() => {
    cargarHistorial();
  }, []); // Solo al montar

  const cargarLavadores = async () => {
    try {
      const data = await lavadoresApi.obtenerLavadores();
      setLavadores(data);
    } catch (error) {
      console.error('Error cargando lavadores:', error);
    }
  };

  // ✅ NUEVA VERSIÓN: Cargar historial usando la API unificada
  const cargarHistorial = async () => {
    setLoading(true);
    try {
      let filtros = {};

      switch (filterType) {
        case 'hoy':
          filtros = {
            fechaInicio: getFechaColombia().format('YYYY-MM-DD'),
            fechaFin: getFechaColombia().format('YYYY-MM-DD')
          };
          break;
        case 'ayer':
          filtros = {
            fechaInicio: getFechaColombia().subtract(1, 'day').format('YYYY-MM-DD'),
            fechaFin: getFechaColombia().subtract(1, 'day').format('YYYY-MM-DD')
          };
          break;
        case 'mes':
          filtros = {
            fechaInicio: getFechaColombia().startOf('month').format('YYYY-MM-DD'),
            fechaFin: getFechaColombia().endOf('month').format('YYYY-MM-DD')
          };
          break;
        case 'especifica':
          filtros = {
            fechaInicio: fechaEspecifica.format('YYYY-MM-DD'),
            fechaFin: fechaEspecifica.format('YYYY-MM-DD')
          };
          break;
        case 'personalizado':
          filtros = {
            fechaInicio: rangoFechas[0].format('YYYY-MM-DD'),
            fechaFin: rangoFechas[1].format('YYYY-MM-DD'),
            ...filtrosAvanzados
          };
          break;
        case 'todos':
        default:
          filtros = {};
          break;
      }

      // Agregar filtros de ordenamiento
      filtros.ordenarPor = filtrosAvanzados.ordenarPor;
      filtros.orden = filtrosAvanzados.orden;

      console.log('📡 Cargando historial con filtros:', filtros);

      // ✅ Llamada a la nueva función unificada
      const response = await ordenesApi.obtenerHistorial(filtros);

      console.log('✅ Historial cargado:', response);

      if (response.success) {
        // Formatear órdenes
        const ordenesFormateadas = (response.ordenes || []).map(orden => {
          const tipoVehiculoStd = convertirTipoVehiculoParaMostrar(orden.tipo_vehiculo);
          const tipoLavadoStd = convertirTipoLavadoParaMostrar(
            orden.tipo_lavado || orden.servicios?.[0]?.tipo_lavado
          );

          return {
            id: orden._id || orden.id,
            numero_orden: orden.numero_orden,
            placa: orden.placa || 'SIN PLACA',
            tipo_vehiculo: tipoVehiculoStd,
            tipo_vehiculo_original: orden.tipo_vehiculo,
            tipo_lavado: tipoLavadoStd,
            tipo_lavado_original: orden.tipo_lavado || orden.servicios?.[0]?.tipo_lavado,
            precio: orden.total || orden.precio || 0,
            total: orden.total || orden.precio || 0,
            metodo_pago: orden.metodo_pago || 'efectivo',
            es_decima_gratis: orden.es_decima_gratis || false,
            contador_lavada: orden.contador_lavada || 1,
            lavador_asignado: orden.lavador_asignado,
            lavador_nombre: orden.comision_lavador?.lavador_nombre || 
                          orden.lavador_asignado?.nombre || 
                          'No asignado',
            lavador_id: orden.comision_lavador?.lavador_id || orden.lavador_asignado?._id,
            comision_lavador: orden.comision_lavador?.monto || 0,
            comision_porcentaje: orden.comision_lavador?.porcentaje || 40,
            cliente: orden.cliente,
            fecha_creacion: orden.fecha_creacion,
            fecha_cobro: orden.fecha_cobro,
            hora_cobro: orden.fecha_cobro ? getFechaColombia(orden.fecha_cobro).format('HH:mm') : '',
            _original: orden
          };
        });

        // Aplicar ordenamiento local (por si acaso, aunque el backend ya ordena)
        let ordenesOrdenadas = [...ordenesFormateadas];
        if (filtrosAvanzados.ordenarPor === 'fecha') {
          ordenesOrdenadas.sort((a, b) => {
            const fechaA = new Date(a.fecha_cobro || a.fecha_creacion);
            const fechaB = new Date(b.fecha_cobro || b.fecha_creacion);
            return filtrosAvanzados.orden === 'asc' ? fechaA - fechaB : fechaB - fechaA;
          });
        } else if (filtrosAvanzados.ordenarPor === 'monto') {
          ordenesOrdenadas.sort((a, b) => {
            return filtrosAvanzados.orden === 'asc' ? a.precio - b.precio : b.precio - a.precio;
          });
        }

        setOrdenes(ordenesOrdenadas);

        // Calcular estadísticas
        const total = ordenesOrdenadas.length;
        const totalIngresos = ordenesOrdenadas.reduce((sum, o) => sum + o.precio, 0);
        const totalComisiones = ordenesOrdenadas.reduce((sum, o) => sum + o.comision_lavador, 0);
        const gananciaNeta = totalIngresos - totalComisiones;
        const promedioOrden = total > 0 ? totalIngresos / total : 0;

        setEstadisticas({
          total,
          totalIngresos,
          totalComisiones,
          gananciaNeta,
          promedioOrden,
          porcentajeComisiones: totalIngresos > 0 ? (totalComisiones / totalIngresos) * 100 : 0
        });

        message.success(`✅ Historial cargado: ${ordenesOrdenadas.length} órdenes`);
      } else {
        message.error(response.error || 'Error al cargar el historial');
      }
    } catch (error) {
      console.error('❌ Error cargando historial:', error);
      message.error('Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  // Funciones de conversión (igual que antes)
  const convertirTipoLavadoParaMostrar = (tipoBackend) => {
    const mapeo = {
      'express': 'express',
      'elite': 'elite',
      'premium': 'premium',
      'completo': 'elite',
      'basico': 'express',
      'interior': 'elite',
      'exterior': 'express',
      'motor': 'premium'
    };
    return mapeo[tipoBackend] || 'express';
  };

  const convertirTipoVehiculoParaMostrar = (tipoBackend) => {
    const mapeo = {
      'carro': 'carro',
      'auto': 'carro',
      'moto': 'moto',
      'taxi': 'taxi',
      'camioneta': 'camioneta',
      'suv': 'camioneta',
      'camion': 'camioneta',
      'bus': 'camioneta',
      'otro': 'carro'
    };
    return mapeo[tipoBackend] || 'carro';
  };

  const getLabelTipoLavado = (tipo) => {
    const labels = {
      'express': '⚡ Express',
      'elite': '✨ Elite',
      'premium': '👑 Premium'
    };
    return labels[tipo] || tipo;
  };

  const getLabelTipoVehiculo = (tipo) => {
    const labels = {
      'carro': '🚗 Carro',
      'moto': '🏍️ Moto',
      'taxi': '🚕 Taxi',
      'camioneta': '🚙 Camioneta'
    };
    return labels[tipo] || tipo;
  };

  const getColorTipoLavado = (tipo) => {
    const colors = {
      'express': 'green',
      'elite': 'purple',
      'premium': 'gold'
    };
    return colors[tipo] || 'default';
  };

  const getColorTipoVehiculo = (tipo) => {
    const colors = {
      'carro': 'blue',
      'moto': 'green',
      'taxi': 'orange',
      'camioneta': 'cyan'
    };
    return colors[tipo] || 'default';
  };

  // Función para exportar a Excel
  const exportarExcel = () => {
    try {
      const data = ordenesFiltradas.map(orden => ({
        'Número Orden': orden.numero_orden,
        'Fecha': orden.fecha_cobro ? getFechaColombia(orden.fecha_cobro).format('DD/MM/YYYY') : '',
        'Hora': orden.hora_cobro,
        'Placa': orden.placa,
        'Vehículo': getLabelTipoVehiculo(orden.tipo_vehiculo),
        'Servicio': getLabelTipoLavado(orden.tipo_lavado),
        'Total': orden.precio,
        'Método Pago': orden.metodo_pago,
        'Lavador': orden.lavador_nombre,
        'Comisión': orden.comision_lavador,
        'Comisión %': `${orden.comision_porcentaje}%`,
        '10ma Gratis': orden.es_decima_gratis ? 'Sí' : 'No'
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial');

      const wscols = [
        { wch: 12 }, { wch: 12 }, { wch: 8 }, { wch: 10 }, { wch: 15 },
        { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 12 },
        { wch: 10 }, { wch: 10 },
      ];
      worksheet['!cols'] = wscols;

      const fecha = getFechaColombia().format('YYYY-MM-DD_HH-mm');
      XLSX.writeFile(workbook, `historial_ordenes_${fecha}.xlsx`);
      message.success('✅ Archivo Excel exportado correctamente');
    } catch (error) {
      console.error('Error exportando a Excel:', error);
      message.error('Error al exportar a Excel');
    }
  };

  // Función para exportar a PDF
  const exportarPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('HISTORIAL DE ÓRDENES - FULLWASH360', 105, 15, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Fecha de generación: ${getFechaColombia().format('DD/MM/YYYY HH:mm')}`, 14, 25);
      doc.text(`Total de órdenes: ${ordenesFiltradas.length}`, 14, 32);
      if (estadisticas) {
        doc.text(`Ingresos totales: ${formatCurrency(estadisticas.totalIngresos)}`, 14, 39);
        doc.text(`Comisiones: ${formatCurrency(estadisticas.totalComisiones)}`, 14, 46);
      }
      const tableColumn = ['Orden', 'Fecha', 'Placa', 'Vehículo', 'Servicio', 'Total', 'Lavador'];
      const tableRows = ordenesFiltradas.map(orden => [
        orden.numero_orden,
        orden.fecha_cobro ? getFechaColombia(orden.fecha_cobro).format('DD/MM/YYYY') : '',
        orden.placa,
        getLabelTipoVehiculo(orden.tipo_vehiculo).replace(/[^\w\s]/gi, ''),
        getLabelTipoLavado(orden.tipo_lavado).replace(/[^\w\s]/gi, ''),
        formatCurrency(orden.precio),
        orden.lavador_nombre
      ]);
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 55,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] },
        margin: { top: 55 }
      });
      const fecha = getFechaColombia().format('YYYY-MM-DD_HH-mm');
      doc.save(`historial_ordenes_${fecha}.pdf`);
      message.success('✅ Archivo PDF exportado correctamente');
    } catch (error) {
      console.error('Error exportando a PDF:', error);
      message.error('Error al exportar a PDF');
    }
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltrosAvanzados({
      tipoVehiculo: [],
      tipoLavado: [],
      metodoPago: [],
      lavadorId: null,
      minMonto: 0,
      maxMonto: 1000000,
      ordenarPor: 'fecha',
      orden: 'desc'
    });
    setSearch('');
    setFilterType('hoy');
    setMostrarFiltros(false);
    message.success('Filtros limpiados');
    cargarHistorial(); // Recargar con filtros limpios
  };

  // Ver detalles de la orden
  const verDetallesOrden = (orden) => {
    Modal.info({
      title: `Detalles de Orden ${orden.numero_orden}`,
      width: 600,
      content: (
        <div>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card size="small" title="Información General">
                <p><strong>Placa:</strong> {orden.placa}</p>
                <p><strong>Vehículo:</strong> {getLabelTipoVehiculo(orden.tipo_vehiculo)}</p>
                <p><strong>Servicio:</strong> {getLabelTipoLavado(orden.tipo_lavado)}</p>
                <p><strong>Método Pago:</strong> {orden.metodo_pago}</p>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="Financiero">
                <p><strong>Total:</strong> {formatCurrency(orden.precio)}</p>
                <p><strong>Comisión Lavador:</strong> {formatCurrency(orden.comision_lavador)} ({orden.comision_porcentaje}%)</p>
                <p><strong>10ma Gratis:</strong> {orden.es_decima_gratis ? 'Sí' : 'No'}</p>
                <p><strong>Contador Lavada:</strong> {orden.contador_lavada}</p>
              </Card>
            </Col>
            <Col span={24}>
              <Card size="small" title="Lavador">
                <p><strong>Nombre:</strong> {orden.lavador_nombre}</p>
                <p><strong>Fecha Cobro:</strong> {orden.fecha_cobro ? getFechaColombia(orden.fecha_cobro).format('DD/MM/YYYY HH:mm') : 'No cobrada'}</p>
              </Card>
            </Col>
          </Row>
        </div>
      ),
      onOk() {},
    });
  };

  // Filtrar órdenes por búsqueda (local)
  const ordenesFiltradas = ordenes.filter(orden => {
    if (!search) return true;
    const searchTerm = search.toLowerCase();
    return (
      orden.placa.toLowerCase().includes(searchTerm) ||
      orden.numero_orden.toLowerCase().includes(searchTerm) ||
      orden.lavador_nombre.toLowerCase().includes(searchTerm) ||
      orden.tipo_vehiculo.toLowerCase().includes(searchTerm) ||
      orden.tipo_lavado.toLowerCase().includes(searchTerm)
    );
  });

  // Columnas de la tabla (sin cambios)
  const columns = [
    {
      title: 'Orden',
      dataIndex: 'numero_orden',
      key: 'numero_orden',
      width: 120,
      fixed: 'left',
      render: (text, record) => (
        <div>
          <Text strong style={{ color: '#1890ff', fontSize: '14px' }}>{text}</Text>
          <div style={{ fontSize: '11px', color: '#666' }}>
            {record.hora_cobro || (record.fecha_cobro ? getFechaColombia(record.fecha_cobro).format('HH:mm') : '--:--')}
          </div>
        </div>
      ),
    },
    {
      title: 'Vehículo',
      key: 'vehiculo',
      width: 140,
      render: (record) => (
        <div>
          <Tag 
            color={getColorTipoVehiculo(record.tipo_vehiculo)}
            icon={<CarOutlined />}
            style={{ marginBottom: '4px', fontWeight: '600' }}
          >
            {getLabelTipoVehiculo(record.tipo_vehiculo).split(' ')[1]}
          </Tag>
          <div><strong style={{ fontSize: '13px' }}>{record.placa}</strong></div>
        </div>
      ),
    },
    {
      title: 'Servicio',
      key: 'tipo_lavado',
      width: 100,
      render: (record) => (
        <Tag 
          color={getColorTipoLavado(record.tipo_lavado)}
          style={{ fontWeight: '600', borderRadius: '6px' }}
        >
          {getLabelTipoLavado(record.tipo_lavado).split(' ')[1]}
        </Tag>
      ),
    },
    {
      title: 'Pago',
      key: 'pago',
      width: 130,
      render: (record) => (
        <div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#52c41a' }}>
            {formatCurrency(record.precio)}
          </div>
          <div style={{ fontSize: '12px', marginTop: '2px' }}>
            <Tag 
              size="small" 
              color={
                record.metodo_pago === 'efectivo' ? 'green' :
                record.metodo_pago === 'tarjeta' ? 'blue' :
                'orange'
              }
              style={{ borderRadius: '4px' }}
            >
              {record.metodo_pago}
            </Tag>
          </div>
          {record.es_decima_gratis && (
            <Badge 
              count="10ma GRATIS" 
              style={{ 
                backgroundColor: '#fa8c16', 
                fontSize: '9px',
                marginTop: '4px'
              }} 
            />
          )}
        </div>
      ),
    },
    {
      title: 'Lavador',
      key: 'lavador',
      width: 140,
      render: (record) => (
        <div>
          <Space>
            <UserOutlined style={{ color: '#666' }} />
            <div>
              <div style={{ fontWeight: 500, fontSize: '13px' }}>
                {record.lavador_nombre}
              </div>
              {record.comision_lavador > 0 && (
                <div style={{ fontSize: '11px', color: '#fa8c16' }}>
                  {formatCurrency(record.comision_lavador)} <small>(40%)</small>
                </div>
              )}
            </div>
          </Space>
        </div>
      ),
    },
    {
      title: 'Fecha',
      key: 'fecha',
      width: 100,
      render: (record) => (
        <div style={{ fontSize: '12px' }}>
          {record.fecha_cobro ? getFechaColombia(record.fecha_cobro).format('DD/MM/YY') : 
           record.fecha_creacion ? getFechaColombia(record.fecha_creacion).format('DD/MM/YY') : '--'}
        </div>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Ver detalles">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => verDetallesOrden(record)}
              style={{ color: '#1890ff' }}
            />
          </Tooltip>
          <Tooltip title="Reimprimir ticket">
            <Button 
              type="text" 
              icon={<PrinterOutlined />} 
              size="small"
              onClick={() => {
                message.success(`Ticket ${record.numero_orden} enviado a impresión`);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <Card 
        bordered={false}
        style={{ 
          marginBottom: '20px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
        bodyStyle={{ padding: '20px 24px' }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size="small">
              <Space align="center">
                <HistoryOutlined style={{ fontSize: '28px', color: 'white' }} />
                <Title level={3} style={{ margin: 0, color: 'white', fontWeight: '600' }}>
                  Historial de Órdenes
                </Title>
              </Space>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                Consulta y gestiona todas las órdenes completadas del sistema
              </Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Badge 
                count={ordenes.length} 
                style={{ 
                  backgroundColor: '#52c41a',
                  boxShadow: '0 0 0 2px #fff'
                }}
                showZero 
              />
              <Button
                type="primary"
                ghost
                icon={<ExportOutlined />}
                onClick={exportarExcel}
              >
                Exportar Excel
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Estadísticas */}
      {estadisticas && (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={4}>
            <Card bordered={false} style={{ borderRadius: '8px' }}>
              <Statistic
                title="Órdenes"
                value={estadisticas.total}
                valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: '600' }}
                prefix={<HistoryOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Card bordered={false} style={{ borderRadius: '8px' }}>
              <Statistic
                title="Ingresos Totales"
                value={estadisticas.totalIngresos}
                formatter={(value) => formatCurrency(value)}
                valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: '600' }}
                prefix={<DollarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Card bordered={false} style={{ borderRadius: '8px' }}>
              <Statistic
                title="Comisiones"
                value={estadisticas.totalComisiones}
                formatter={(value) => formatCurrency(value)}
                valueStyle={{ color: '#fa8c16', fontSize: '28px', fontWeight: '600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Card bordered={false} style={{ borderRadius: '8px' }}>
              <Statistic
                title="Ganancia Neta"
                value={estadisticas.gananciaNeta}
                formatter={(value) => formatCurrency(value)}
                valueStyle={{ 
                  color: estadisticas.gananciaNeta > 0 ? '#52c41a' : '#f5222d',
                  fontSize: '28px',
                  fontWeight: '600'
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Card bordered={false} style={{ borderRadius: '8px' }}>
              <div style={{ textAlign: 'center' }}>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>Margen de Comisión</Text>
                <Progress
                  type="circle"
                  percent={Math.round(estadisticas.porcentajeComisiones)}
                  width={60}
                  strokeColor={{
                    '0%': '#ff4d4f',
                    '100%': '#52c41a',
                  }}
                  format={percent => `${percent}%`}
                />
                <Text type="secondary" style={{ display: 'block', marginTop: '8px', fontSize: '12px' }}>
                  del total de ventas
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filtros principales */}
      <Card 
        bordered={false}
        style={{ marginBottom: '20px', borderRadius: '8px' }}
        bodyStyle={{ padding: '20px' }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>
                <CalendarOutlined /> Período
              </Text>
              <Select
                value={filterType}
                onChange={(value) => setFilterType(value)}
                style={{ width: '100%' }}
                size="middle"
              >
                <Option value="hoy">Hoy</Option>
                <Option value="ayer">Ayer</Option>
                <Option value="mes">Este mes</Option>
                <Option value="todos">Todos los registros</Option>
                <Option value="personalizado">Rango personalizado</Option>
                <Option value="especifica">Fecha específica</Option>
              </Select>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            {filterType === 'personalizado' && (
              <div>
                <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>
                  Rango de fechas
                </Text>
                <RangePicker
                  style={{ width: '100%' }}
                  value={rangoFechas}
                  onChange={(dates) => setRangoFechas(dates)}
                  format="DD/MM/YYYY"
                  size="middle"
                />
              </div>
            )}
            {filterType === 'especifica' && (
              <div>
                <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>
                  Fecha específica
                </Text>
                <DatePicker
                  style={{ width: '100%' }}
                  value={fechaEspecifica}
                  onChange={(date) => setFechaEspecifica(date)}
                  format="DD/MM/YYYY"
                  size="middle"
                />
              </div>
            )}
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>
                <SearchOutlined /> Búsqueda
              </Text>
              <Input
                placeholder="Placa, orden, lavador..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                prefix={<SearchOutlined />}
                allowClear
                size="middle"
              />
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '30px' }}>
              <Button
                icon={<ReloadOutlined spin={loading} />}
                onClick={cargarHistorial}
                loading={loading}
                size="middle"
              >
                Actualizar
              </Button>
              <Button
                icon={mostrarFiltros ? <ClearOutlined /> : <FilterOutlined />}
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                size="middle"
              >
                {mostrarFiltros ? 'Ocultar' : 'Filtros'}
              </Button>
            </div>
          </Col>
        </Row>

        {/* Filtros avanzados */}
        {mostrarFiltros && (
          <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '6px' }}>
            <Title level={5} style={{ marginBottom: '16px' }}>
              <SettingOutlined /> Filtros Avanzados
            </Title>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>Tipo de vehículo</Text>
                <Select
                  mode="multiple"
                  placeholder="Todos los vehículos"
                  style={{ width: '100%' }}
                  value={filtrosAvanzados.tipoVehiculo}
                  onChange={(value) => setFiltrosAvanzados({...filtrosAvanzados, tipoVehiculo: value})}
                  allowClear
                  size="middle"
                >
                  <Option value="carro">🚗 Carro</Option>
                  <Option value="moto">🏍️ Moto</Option>
                  <Option value="taxi">🚕 Taxi</Option>
                  <Option value="camioneta">🚙 Camioneta</Option>
                </Select>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>Tipo de servicio</Text>
                <Select
                  mode="multiple"
                  placeholder="Todos los servicios"
                  style={{ width: '100%' }}
                  value={filtrosAvanzados.tipoLavado}
                  onChange={(value) => setFiltrosAvanzados({...filtrosAvanzados, tipoLavado: value})}
                  allowClear
                  size="middle"
                >
                  <Option value="express">⚡ Express</Option>
                  <Option value="elite">✨ Elite</Option>
                  <Option value="premium">👑 Premium</Option>
                </Select>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>Método de pago</Text>
                <Select
                  mode="multiple"
                  placeholder="Todos los métodos"
                  style={{ width: '100%' }}
                  value={filtrosAvanzados.metodoPago}
                  onChange={(value) => setFiltrosAvanzados({...filtrosAvanzados, metodoPago: value})}
                  allowClear
                  size="middle"
                >
                  <Option value="efectivo">Efectivo</Option>
                  <Option value="tarjeta">Tarjeta</Option>
                  <Option value="transferencia">Transferencia</Option>
                </Select>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>Lavador</Text>
                <Select
                  placeholder="Todos los lavadores"
                  style={{ width: '100%' }}
                  value={filtrosAvanzados.lavadorId}
                  onChange={(value) => setFiltrosAvanzados({...filtrosAvanzados, lavadorId: value})}
                  allowClear
                  size="middle"
                >
                  {lavadores.map(lavador => (
                    <Option key={lavador._id} value={lavador._id}>
                      {lavador.nombre} ({lavador.codigo})
                    </Option>
                  ))}
                </Select>
              </Col>
              
              <Col xs={24} sm={24} md={12}>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>Rango de montos</Text>
                <Slider
                  range
                  min={0}
                  max={100000}
                  step={5000}
                  value={[filtrosAvanzados.minMonto, filtrosAvanzados.maxMonto]}
                  onChange={(value) => setFiltrosAvanzados({
                    ...filtrosAvanzados,
                    minMonto: value[0],
                    maxMonto: value[1]
                  })}
                  tipFormatter={value => formatCurrency(value)}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                  <Tag color="blue">{formatCurrency(filtrosAvanzados.minMonto)}</Tag>
                  <Tag color="green">{formatCurrency(filtrosAvanzados.maxMonto)}</Tag>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>Ordenar por</Text>
                <Select
                  style={{ width: '100%' }}
                  value={filtrosAvanzados.ordenarPor}
                  onChange={(value) => setFiltrosAvanzados({...filtrosAvanzados, ordenarPor: value})}
                  size="middle"
                >
                  <Option value="fecha">Fecha (más reciente)</Option>
                  <Option value="monto">Monto (mayor a menor)</Option>
                  <Option value="placa">Placa (A-Z)</Option>
                </Select>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>Orden</Text>
                <Select
                  style={{ width: '100%' }}
                  value={filtrosAvanzados.orden}
                  onChange={(value) => setFiltrosAvanzados({...filtrosAvanzados, orden: value})}
                  size="middle"
                >
                  <Option value="desc">Descendente</Option>
                  <Option value="asc">Ascendente</Option>
                </Select>
              </Col>
              
              <Col xs={24} style={{ marginTop: '16px' }}>
                <Divider />
                <Space wrap>
                  <Button 
                    type="primary"
                    icon={<FilterOutlined />}
                    onClick={cargarHistorial}
                    loading={loading}
                    size="middle"
                  >
                    Aplicar Filtros
                  </Button>
                  <Button 
                    icon={<ClearOutlined />}
                    onClick={limpiarFiltros}
                    size="middle"
                  >
                    Limpiar Todo
                  </Button>
                  <Button 
                    icon={<FileExcelOutlined />}
                    onClick={exportarExcel}
                    size="middle"
                  >
                    Excel
                  </Button>
                  <Button 
                    icon={<FilePdfOutlined />}
                    onClick={exportarPDF}
                    size="middle"
                  >
                    PDF
                  </Button>
                </Space>
              </Col>
            </Row>
          </div>
        )}
      </Card>

      {/* Tabla de órdenes */}
      <Card
        bordered={false}
        style={{ borderRadius: '8px', overflow: 'hidden' }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Text strong style={{ fontSize: '16px' }}>
                  Órdenes Encontradas
                </Text>
                <Badge 
                  count={ordenesFiltradas.length} 
                  style={{ 
                    backgroundColor: ordenesFiltradas.length > 0 ? '#52c41a' : '#d9d9d9'
                  }}
                  showZero
                />
              </Space>
            </Col>
            <Col>
              <Text type="secondary" style={{ fontSize: '13px' }}>
                Actualizado: {getFechaColombia().format('DD/MM/YYYY HH:mm')}
              </Text>
            </Col>
          </Row>
        </div>
        
        <Table
          columns={columns}
          dataSource={ordenesFiltradas}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} órdenes`
          }}
          locale={{
            emptyText: (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <HistoryOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                <Title level={4} style={{ color: '#bfbfbf' }}>
                  No hay órdenes disponibles
                </Title>
                <Text type="secondary">
                  No se encontraron órdenes con los filtros aplicados
                </Text>
                <br />
                <Button 
                  type="link" 
                  onClick={limpiarFiltros}
                  style={{ marginTop: '16px' }}
                >
                  Limpiar filtros
                </Button>
              </div>
            )
          }}
          scroll={{ x: 1200 }}
          sticky
        />
      </Card>

      {/* Instrucciones para usar */}
      <Alert
        message="💡 Consejos para usar el historial"
        description={
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li><strong>Filtro "Hoy"</strong> muestra órdenes del día actual (hora Colombia)</li>
            <li><strong>Filtro "Ayer"</strong> muestra órdenes del día anterior</li>
            <li><strong>Filtro "Este mes"</strong> muestra órdenes del mes en curso</li>
            <li><strong>Exporta a Excel</strong> para análisis detallado</li>
            <li>Haz clic en el icono 👁️ para ver detalles completos de cada orden</li>
          </ul>
        }
        type="info"
        showIcon
        style={{ marginTop: '24px' }}
      />
    </div>
  );
};

export default HistorialOrdenes;