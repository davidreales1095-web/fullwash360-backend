// frontend/src/pages/ordenes/OrdenesActivas.jsx - ACTUALIZADO PROMOCIÓN 7+1 (8va GRATIS)
import React, { useState, useEffect } from "react";
import {
  Table, Button, Card, Typography, Tag, message,
  Modal, Select, InputNumber, Form, Row, Col, Alert,
  Space, Spin, Popconfirm, Tooltip, Badge, Statistic,
  Input, Divider
} from "antd";
import {
  DollarOutlined, UserOutlined, CarOutlined,
  ReloadOutlined, CheckCircleOutlined,
  SearchOutlined, ClockCircleOutlined,
  DeleteOutlined, PrinterOutlined, NumberOutlined
} from '@ant-design/icons';
import ordenesApi from "../../api/ordenesApi";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';

dayjs.extend(relativeTime);
dayjs.locale('es');

const { Title, Text } = Typography;
const { Option } = Select;

const OrdenesActivas = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [filteredOrdenes, setFilteredOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lavadores, setLavadores] = useState([]);
  const [loadingLavadores, setLoadingLavadores] = useState(false);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [cobrando, setCobrando] = useState(false);
  const [form] = Form.useForm();
  
  const [searchText, setSearchText] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [backendConectado, setBackendConectado] = useState(false);

  // ====================================================
  // ✅ FUNCIÓN IMPRIMIR TICKET - ACTUALIZADA A 7+1 (8va GRATIS)
  // ====================================================
  const imprimirTicket = (orden, lavador, datosCobro) => {
    try {
      console.log("🖨️  Iniciando impresión del ticket...", { orden, lavador, datosCobro });

      let lavadorInfo = lavador;
      if (typeof lavador === 'string') {
        lavadorInfo = lavadores.find(l => l._id === lavador) || {
          nombre: 'No asignado',
          codigo: 'N/A'
        };
      }

      const contenidoHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ticket ${orden.numero_orden || 'ORD-0000'}</title>
          <meta charset="UTF-8">
          <style>
            @media print {
              @page {
                size: 58mm auto portrait;
                margin: 0mm;
                padding: 0mm;
              }
              body {
                margin: 0 !important;
                padding: 2mm !important;
                width: 58mm !important;
                background: white !important;
                color: #000000 !important;
                font-family: 'Courier New', Courier, monospace !important;
                font-size: 11pt !important;
                line-height: 1.2 !important;
                font-weight: 700 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
                -webkit-font-smoothing: antialiased !important;
                text-rendering: optimizeLegibility !important;
              }
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              font-family: 'Courier New', Courier, monospace !important;
              color: #000000 !important;
              background: transparent !important;
              border-color: #000000 !important;
              font-weight: 700 !important;
            }
            body {
              width: 58mm;
              margin: 0 auto;
              padding: 2mm;
              background: white;
              font-size: 11pt;
              line-height: 1.2;
              -webkit-font-smoothing: antialiased;
              text-rendering: optimizeLegibility;
            }
            .ticket {
              width: 100%;
              border: 1.2pt solid black;
              padding: 3mm 2mm;
            }
            .no-print {
              display: none !important;
            }
            .center {
              text-align: center;
            }
            .bold {
              font-weight: 900 !important;
            }
            .divider {
              border-top: 1.2pt solid black;
              margin: 5px 0;
              height: 0;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
            }
            .label {
              font-weight: 900 !important;
              min-width: 42%;
            }
            .value {
              text-align: right;
              font-weight: 700 !important;
            }
            .total-block {
              margin: 8px 0;
              padding: 6px 0;
              border-top: 2pt solid black;
              border-bottom: 2pt solid black;
              text-align: center;
            }
            .total-number {
              font-size: 16pt;
              font-weight: 900 !important;
            }
            .footer {
              margin-top: 8px;
              font-size: 10pt;
              text-align: center;
            }
            @media screen {
              body {
                background: white;
                padding: 5mm;
              }
              .ticket {
                box-shadow: 0 0 5px rgba(0,0,0,0.2);
              }
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="center bold" style="font-size: 16pt;">🚗 FULLWASH 360</div>
            <div class="center" style="font-size: 11pt; font-weight: 700;">LAVADO DE VEHÍCULOS</div>
            <div class="center" style="font-size: 9pt; font-weight: 700; margin-bottom: 4px;">Calidad y rapidez garantizada</div>
            <div class="divider"></div>

            <div class="info-row">
              <span class="label">TICKET N°:</span>
              <span class="value">${orden.numero_orden || 'ORD-0000'}</span>
            </div>
            <div class="info-row">
              <span class="label">FECHA/HORA:</span>
              <span class="value">${new Date().toLocaleDateString('es-CO', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
            <div class="divider"></div>

            <div class="info-row">
              <span class="label">PLACA:</span>
              <span class="value">${orden.placa?.toUpperCase() || 'SIN PLACA'}</span>
            </div>
            <div class="info-row">
              <span class="label">VEHÍCULO:</span>
              <span class="value">${orden.tipo_vehiculo?.toUpperCase() || 'CARRO'}</span>
            </div>
            <div class="info-row">
              <span class="label">SERVICIO:</span>
              <span class="value">${orden.servicios?.[0]?.nombre || 'Lavado Express'}</span>
            </div>
            <div class="info-row">
              <span class="label">LAVADOR:</span>
              <span class="value">${lavadorInfo?.nombre || 'No asignado'}</span>
            </div>

            <div class="info-row">
              <span class="label">LAVADA N°:</span>
              <span class="value">
                ${orden.contador_lavada || 1}/8          {/* ✅ Cambiado 10 → 8 */}
                ${orden.es_decima_gratis ? '🎉 GRATIS' : ''}
              </span>
            </div>
            <div class="divider"></div>

            <div class="total-block">
              <div style="font-size: 11pt; font-weight: 700;">TOTAL A PAGAR</div>
              <div class="total-number">
                ${orden.es_decima_gratis ? 'GRATIS 🎉' : `$${orden.total?.toLocaleString() || '0'}`}
              </div>
            </div>

            <div class="info-row">
              <span class="label">MÉTODO DE PAGO:</span>
              <span class="value">${datosCobro?.metodo_pago?.toUpperCase() || 'EFECTIVO'}</span>
            </div>

            ${datosCobro?.pago_recibido ? `
              <div class="info-row">
                <span class="label">PAGO RECIBIDO:</span>
                <span class="value">$${datosCobro.pago_recibido.toLocaleString()}</span>
              </div>
            ` : ''}

            ${datosCobro?.vuelto > 0 ? `
              <div class="info-row">
                <span class="label">VUELTO:</span>
                <span class="value">$${datosCobro.vuelto.toLocaleString()}</span>
              </div>
            ` : ''}

            <div class="divider"></div>

            <div class="footer">
              <div style="font-weight: 900; font-size: 11pt;">¡Gracias por su preferencia!</div>
              <div style="font-size: 9pt; font-weight: 700;">Sistema de fidelización 7+1</div> {/* ✅ Cambiado 9+1 → 7+1 */}
              <div style="font-size: 8pt; font-weight: 700; margin-top: 2px;">
                FULLWASH 360 • ${new Date().getFullYear()}
              </div>
            </div>

            <button class="no-print" onclick="window.print()" style="
              display: block;
              width: 100%;
              margin-top: 15px;
              padding: 12px;
              background: black;
              color: white !important;
              border: none;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
              cursor: pointer;
            ">
              🖨️ IMPRIMIR TICKET
            </button>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 800);
              }, 300);
            };
          </script>
        </body>
        </html>
      `;

      const ventanaImpresion = window.open('', '_blank', 'width=400,height=600,scrollbars=yes');
      if (!ventanaImpresion) {
        message.warning('Permite ventanas emergentes para imprimir. O usa Ctrl+P.');
        return;
      }

      ventanaImpresion.document.open();
      ventanaImpresion.document.write(contenidoHTML);
      ventanaImpresion.document.close();

      console.log('✅ Ticket generado con nitidez máxima');
    } catch (error) {
      console.error('❌ Error al generar el ticket:', error);
    }
  };

  // ====================================================
  // ✅ FUNCIÓN COBRAR ORDEN CON IMPRESIÓN
  // ====================================================
  const handleCobrarOrden = async (values) => {
    if (!ordenSeleccionada) return;
    
    setCobrando(true);
    try {
      const lavadorSeleccionado = lavadores.find(l => l._id === values.lavador_asignado);
      
      const payload = {
        metodo_pago: values.metodo_pago,
        pago_recibido: values.pago_recibido,
        lavador_asignado: values.lavador_asignado,
        lavador_nombre: lavadorSeleccionado ? `${lavadorSeleccionado.nombre} (${lavadorSeleccionado.codigo})` : 'Lavador'
      };

      console.log("📦 Enviando datos de cobro:", payload);
      
      const res = await ordenesApi.cobrarOrden(ordenSeleccionada._id, payload);
      
      if (res && (res.success || res._id)) {
        message.success({
          content: (
            <div>
              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
              <Text strong>¡Orden cobrada exitosamente!</Text>
              <div style={{ marginTop: 8 }}>
                <Text>N° {ordenSeleccionada.numero_orden}</Text>
                <br />
                <Text>Total: ${ordenSeleccionada.total?.toLocaleString()}</Text>
                <br />
                <Text type="secondary">Vuelto: ${res.vuelto?.toLocaleString() || 0}</Text>
                <br />
                <Text type="secondary" style={{ color: '#fa8c16' }}>
                  Comisión lavador: ${res.comision_lavador?.toLocaleString() || 
                    Math.round(ordenSeleccionada.total * 0.4).toLocaleString()}
                </Text>
              </div>
            </div>
          ),
          duration: 5
        });
        
        const ordenActualizada = {
          ...ordenSeleccionada,
          total: res.orden?.total || ordenSeleccionada.total,
          contador_lavada: res.orden?.contador_lavada !== undefined 
            ? res.orden.contador_lavada 
            : ordenSeleccionada.contador_lavada,
          es_decima_gratis: res.orden?.es_decima_gratis !== undefined
            ? res.orden.es_decima_gratis
            : ordenSeleccionada.es_decima_gratis
        };
        
        imprimirTicket(
          ordenActualizada,
          lavadorSeleccionado,
          {
            metodo_pago: values.metodo_pago,
            pago_recibido: values.pago_recibido,
            vuelto: res.vuelto || 0,
            comision_lavador: res.comision_lavador || Math.round(ordenSeleccionada.total * 0.4)
          }
        );
        
        cerrarModal();
        cargarOrdenesActivas();
      } else {
        message.error(res?.message || "Error al cobrar la orden");
      }
    } catch (error) {
      console.error("❌ Error cobrando orden:", error);
      message.error(error.message || "Error de conexión");
    } finally {
      setCobrando(false);
    }
  };

  // ====================================================
  // ✅ FUNCIÓN CARGAR ÓRDENES ACTIVAS
  // ====================================================
  const cargarOrdenesActivas = async () => {
    try {
      setLoading(true);
      const res = await ordenesApi.obtenerOrdenesActivas();
      
      console.log("📥 Respuesta del backend:", res);
      
      if (res && res.success === false) {
        setBackendConectado(false);
        message.warning(res.message || "Error al conectar con el servidor");
        setOrdenes([]);
        setFilteredOrdenes([]);
        return;
      }
      
      setBackendConectado(true);
      
      let ordenesArray = [];
      
      if (Array.isArray(res)) {
        ordenesArray = res;
      } else if (res && res.success && Array.isArray(res.ordenes)) {
        ordenesArray = res.ordenes;
      } else if (res && Array.isArray(res.ordenes)) {
        ordenesArray = res.ordenes;
      } else if (res && res.ordenes && !Array.isArray(res.ordenes)) {
        ordenesArray = [res.ordenes];
      }
      
      const ordenesFormateadas = ordenesArray.map(orden => ({
        ...orden,
        key: orden._id,
        tiempoTranscurrido: orden.fecha_creacion ? 
          dayjs(orden.fecha_creacion).fromNow() : '--',
        minutosTranscurridos: orden.fecha_creacion ? 
          Math.floor((new Date() - new Date(orden.fecha_creacion)) / (1000 * 60)) : 0,
        contador_lavada: orden.contador_lavada && 
          typeof orden.contador_lavada === 'number' ? 
          orden.contador_lavada : 1
      }));
      
      console.log("✅ Órdenes formateadas:", ordenesFormateadas);
      
      setOrdenes(ordenesFormateadas);
      setFilteredOrdenes(ordenesFormateadas);
      
    } catch (error) {
      console.error("❌ Error cargando órdenes:", error);
      setBackendConectado(false);
      message.error("Error de conexión con el servidor. Verifica que el backend esté corriendo.");
      setOrdenes([]);
      setFilteredOrdenes([]);
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // ✅ FUNCIÓN CARGAR LAVADORES
  // ====================================================
  const cargarLavadores = async () => {
    setLoadingLavadores(true);
    try {
      const data = await ordenesApi.obtenerLavadores();
      if (Array.isArray(data)) {
        setLavadores(data);
      } else if (data && Array.isArray(data.lavadores)) {
        setLavadores(data.lavadores);
      } else {
        console.warn("⚠️ Formato inesperado de lavadores:", data);
        setLavadores([]);
      }
    } catch (error) {
      console.error("❌ Error cargando lavadores:", error);
      setLavadores([]);
      message.warning("No se pudieron cargar los lavadores. Verifica la conexión.");
    } finally {
      setLoadingLavadores(false);
    }
  };

  useEffect(() => {
    cargarOrdenesActivas();
    cargarLavadores();
  }, []);

  useEffect(() => {
    let interval;
    if (autoRefresh && backendConectado) {
      interval = setInterval(() => {
        cargarOrdenesActivas();
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, backendConectado]);

  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredOrdenes(ordenes);
      return;
    }
    const filtered = ordenes.filter(orden => 
      orden.placa?.toLowerCase().includes(searchText.toLowerCase()) ||
      orden.numero_orden?.toLowerCase().includes(searchText.toLowerCase()) ||
      orden.tipo_vehiculo?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredOrdenes(filtered);
  }, [searchText, ordenes]);

  const abrirModalCobro = (orden) => {
    setOrdenSeleccionada(orden);
    form.setFieldsValue({
      lavador_asignado: undefined,
      metodo_pago: 'efectivo',
      pago_recibido: orden.total
    });
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setOrdenSeleccionada(null);
    form.resetFields();
  };

  const handleCancelarOrden = async (ordenId) => {
    try {
      message.info("Función de cancelar pendiente de implementar");
    } catch (error) {
      console.error("Error cancelando orden:", error);
    }
  };

  const calcularEstadisticas = () => {
    const totalOrdenes = filteredOrdenes.length;
    const totalVentas = filteredOrdenes.reduce((sum, orden) => sum + (orden.total || 0), 0);
    const promedioTiempo = filteredOrdenes.length > 0
      ? filteredOrdenes.reduce((sum, orden) => sum + (orden.minutosTranscurridos || 0), 0) / filteredOrdenes.length
      : 0;
    return { totalOrdenes, totalVentas, promedioTiempo };
  };

  const estadisticas = calcularEstadisticas();

  // ✅ COLUMNAS DE LA TABLA - ACTUALIZADAS
  const columns = [
    {
      title: 'N° Orden',
      dataIndex: 'numero_orden',
      key: 'numero_orden',
      width: 120,
      render: (text, record) => (
        <div>
          <Text strong copyable>{text || '--'}</Text>
          <div style={{ fontSize: '11px', color: '#999' }}>
            {record.tiempoTranscurrido}
          </div>
        </div>
      )
    },
    {
      title: 'Placa',
      dataIndex: 'placa',
      key: 'placa',
      width: 100,
      render: (text) => <Tag color="blue" style={{ fontWeight: 'bold' }}>{text}</Tag>
    },
    {
      title: 'Vehículo',
      key: 'vehiculo',
      width: 120,
      render: (_, record) => {
        const tipo = record.tipo_vehiculo;
        const icono = {
          carro: '🚗',
          moto: '🏍️',
          taxi: '🚕',
          camioneta: '🚙'
        }[tipo] || '🚗';
        return (
          <div>
            <div>{icono} {tipo}</div>
          </div>
        );
      }
    },
    {
      title: 'Servicio',
      key: 'servicio',
      width: 150,
      render: (_, record) => {
        const servicio = record.servicios?.[0];
        return servicio ? (
          <div>
            <div>{servicio.nombre}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {servicio.tipo_lavado}
            </div>
          </div>
        ) : '--';
      }
    },
    {
      title: 'Lavada #',
      key: 'contador',
      width: 100,
      render: (_, record) => (
        <Tag color={record.es_decima_gratis ? "green" : "blue"}> {/* ✅ Cambiado condición a es_decima_gratis */}
          <NumberOutlined /> {record.contador_lavada || 1}/8  {/* ✅ Cambiado 10 → 8 */}
          {record.es_decima_gratis && " 🎉"}
        </Tag>
      )
    },
    {
      title: 'Tiempo',
      key: 'tiempo',
      width: 100,
      render: (_, record) => {
        const minutos = record.minutosTranscurridos;
        let color = 'green';
        if (minutos > 60) color = 'red';
        else if (minutos > 30) color = 'orange';
        return (
          <Tag color={color} icon={<ClockCircleOutlined />}>
            {minutos} min
          </Tag>
        );
      }
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 100,
      render: (total, record) => (
        <div>
          <Text strong type={record.es_decima_gratis ? "success" : "success"}>
            ${total?.toLocaleString()}
          </Text>
          {record.es_decima_gratis && (
            <div style={{ fontSize: '10px', color: '#52c41a' }}>
              ¡Gratis! (8va) {/* ✅ Cambiado 10ma → 8va */}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Cobrar orden">
            <Button
              type="primary"
              icon={<DollarOutlined />}
              onClick={() => abrirModalCobro(record)}
              size="small"
              disabled={!backendConectado}
            >
              Cobrar
            </Button>
          </Tooltip>
          
          <Tooltip title="Cancelar orden">
            <Popconfirm
              title="¿Cancelar esta orden?"
              description="Esta acción no se puede deshacer"
              onConfirm={() => handleCancelarOrden(record._id)}
              okText="Sí"
              cancelText="No"
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CarOutlined style={{ marginRight: 8, fontSize: '20px' }} />
              <Title level={4} style={{ margin: 0 }}>Órdenes Activas</Title>
              <Badge 
                count={filteredOrdenes.length} 
                showZero 
                style={{ marginLeft: 16, backgroundColor: '#1890ff' }}
              />
              {!backendConectado && (
                <Tag color="red" style={{ marginLeft: 8 }}>
                  ⚠️ Backend desconectado
                </Tag>
              )}
            </div>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={cargarOrdenesActivas}
                loading={loading}
              >
                Actualizar
              </Button>
              <Button
                type={autoRefresh ? "primary" : "default"}
                onClick={() => setAutoRefresh(!autoRefresh)}
                disabled={!backendConectado}
              >
                Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
              </Button>
            </Space>
          </div>
        }
        style={{ marginBottom: 20 }}
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col span={12}>
            <Input
              placeholder="Buscar por placa, número de orden o tipo de vehículo..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              allowClear
            />
          </Col>
          <Col span={12}>
            <Row gutter={16}>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Órdenes Activas"
                    value={estadisticas.totalOrdenes}
                    prefix={<CarOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Ventas Pendientes"
                    value={estadisticas.totalVentas}
                    prefix="$"
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Tiempo Promedio"
                    value={Math.round(estadisticas.promedioTiempo)}
                    suffix="min"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>

        {!backendConectado ? (
          <Alert
            message="Backend no conectado"
            description={
              <div>
                <p>El sistema no puede conectarse al servidor backend. Verifica:</p>
                <ul>
                  <li>✅ Que el servidor esté corriendo en <code>https://fullwash360-backend.onrender.com</code></li>
                  <li>✅ Que la API <code>/api/orders/activas</code> esté accesible</li>
                  <li>✅ Que no haya errores en la consola del backend</li>
                </ul>
                <p>Haz clic en "Actualizar" para reintentar.</p>
              </div>
            }
            type="error"
            showIcon
            style={{ marginBottom: 20 }}
            action={
              <Button type="primary" onClick={cargarOrdenesActivas}>
                Reintentar conexión
              </Button>
            }
          />
        ) : loading && ordenes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Cargando órdenes activas...</div>
          </div>
        ) : filteredOrdenes.length === 0 ? (
          <Alert
            message="No hay órdenes activas"
            description={
              searchText 
                ? `No se encontraron órdenes que coincidan con "${searchText}"`
                : "Todas las órdenes han sido cobradas o no hay nuevas órdenes. Crea una nueva orden para comenzar."
            }
            type="info"
            showIcon
            style={{ textAlign: 'center' }}
            action={
              <Button 
                type="primary" 
                href="/ordenes/nueva"
                icon={<CarOutlined />}
              >
                Crear Nueva Orden
              </Button>
            }
          />
        ) : (
          <div>
            <Alert
              message={`Mostrando ${filteredOrdenes.length} orden${filteredOrdenes.length !== 1 ? 'es' : ''} activa${filteredOrdenes.length !== 1 ? 's' : ''}`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Table
              dataSource={filteredOrdenes}
              columns={columns}
              rowKey="_id"
              pagination={{ 
                pageSize: 10, 
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} órdenes`
              }}
              size="middle"
              scroll={{ x: 1000 }}
              loading={loading}
            />
          </div>
        )}
      </Card>

      {/* Modal para cobrar orden - ACTUALIZADO */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <DollarOutlined style={{ marginRight: 8, color: '#52c41a', fontSize: '20px' }} />
            <span style={{ fontSize: '18px' }}>Cobrar Orden</span>
            <Tag color="blue" style={{ marginLeft: 'auto' }}>
              {ordenSeleccionada?.numero_orden}
            </Tag>
          </div>
        }
        open={modalVisible}
        onCancel={cerrarModal}
        footer={null}
        width={500}
        destroyOnClose
        centered
      >
        {ordenSeleccionada && (
          <div>
            <Card 
              size="small" 
              style={{ 
                marginBottom: 20,
                backgroundColor: '#f0f8ff',
                border: '1px solid #91d5ff'
              }}
            >
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Text strong>N° Orden:</Text>
                  <div>
                    <Tag color="blue" style={{ fontWeight: 'bold' }}>
                      {ordenSeleccionada.numero_orden}
                    </Tag>
                  </div>
                </Col>
                <Col span={12}>
                  <Text strong>Placa:</Text>
                  <div>
                    <Tag color="green" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                      {ordenSeleccionada.placa}
                    </Tag>
                  </div>
                </Col>
                <Col span={12}>
                  <Text strong>Vehículo:</Text>
                  <div>
                    {ordenSeleccionada.tipo_vehiculo === 'carro' && '🚗 '}
                    {ordenSeleccionada.tipo_vehiculo === 'moto' && '🏍️ '}
                    {ordenSeleccionada.tipo_vehiculo === 'taxi' && '🚕 '}
                    {ordenSeleccionada.tipo_vehiculo === 'camioneta' && '🚙 '}
                    {ordenSeleccionada.tipo_vehiculo}
                  </div>
                </Col>
                <Col span={12}>
                  <Text strong>Servicio:</Text>
                  <div>{ordenSeleccionada.servicios?.[0]?.nombre || '--'}</div>
                </Col>
                <Col span={24}>
                  <Divider style={{ margin: '12px 0' }} />
                  <div style={{ textAlign: 'center' }}>
                    <Text strong style={{ fontSize: '16px' }}>Total a pagar:</Text>
                    <Title level={2} style={{ margin: '8px 0', color: '#52c41a' }}>
                      ${ordenSeleccionada.total?.toLocaleString()}
                    </Title>
                    {ordenSeleccionada.es_decima_gratis && (
                      <Tag color="green" style={{ fontSize: '14px', padding: '4px 8px' }}>
                        🎉 ¡LAVADA GRATIS! (Promoción 7+1) {/* ✅ Cambiado 9+1 → 7+1 */}
                      </Tag>
                    )}
                    {ordenSeleccionada.contador_lavada && (
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#1890ff' }}>
                        <Text strong>Contador lavadas: {ordenSeleccionada.contador_lavada}/8</Text> {/* ✅ Cambiado 10 → 8 */}
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </Card>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleCobrarOrden}
            >
              <Form.Item
                label={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <UserOutlined style={{ marginRight: 8 }} />
                    <span>Seleccionar Lavador</span>
                  </div>
                }
                name="lavador_asignado"
                rules={[{ required: true, message: 'Selecciona un lavador' }]}
              >
                <Select
                  placeholder="Elige un lavador..."
                  size="large"
                  loading={loadingLavadores}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {lavadores.map(lavador => (
                    <Option key={lavador._id} value={lavador._id}>
                      {lavador.codigo} - {lavador.nombre}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Método de Pago"
                name="metodo_pago"
                initialValue="efectivo"
              >
                <Select size="large">
                  <Option value="efectivo">💵 Efectivo</Option>
                  <Option value="tarjeta">💳 Tarjeta</Option>
                  <Option value="transferencia">🏦 Transferencia</Option>
                  <Option value="yape">📱 Yape</Option>
                  <Option value="plin">📱 Plin</Option>
                  <Option value="otros">📄 Otros</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Pago Recibido"
                name="pago_recibido"
                rules={[
                  { required: true, message: 'Ingresa el monto recibido' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || value >= ordenSeleccionada.total) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('El monto recibido debe ser mayor o igual al total'));
                    },
                  }),
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  placeholder="Ej: 20000"
                />
              </Form.Item>

              <Form.Item shouldUpdate>
                {() => {
                  const pagoRecibido = form.getFieldValue('pago_recibido') || 0;
                  const vuelto = Math.max(0, pagoRecibido - ordenSeleccionada.total);
                  return vuelto > 0 ? (
                    <Alert
                      message={`Vuelto: $${vuelto.toLocaleString()}`}
                      type="info"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />
                  ) : null;
                }}
              </Form.Item>

              <Alert
                message="Sistema de Comisiones (Interno)"
                description={
                  <div>
                    <div>Comisión lavador: <Text strong>${Math.round(ordenSeleccionada.total * 0.4).toLocaleString()} (40%)</Text></div>
                    <div>Beneficio local: <Text strong type="success">${Math.round(ordenSeleccionada.total * 0.6).toLocaleString()}</Text></div>
                  </div>
                }
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={cobrando}
                  block
                  size="large"
                  icon={<CheckCircleOutlined />}
                  style={{ 
                    height: '45px', 
                    fontSize: '16px',
                    background: 'linear-gradient(135deg, #52c41a, #73d13d)',
                    border: 'none'
                  }}
                >
                  {cobrando ? (
                    <span>
                      <Spin size="small" style={{ marginRight: 8 }} />
                      Procesando cobro...
                    </span>
                  ) : (
                    <span>
                      <PrinterOutlined style={{ marginRight: 8 }} />
                      Cobrar e Imprimir Ticket
                    </span>
                  )}
                </Button>
                <div style={{ textAlign: 'center', marginTop: 8, fontSize: '12px', color: '#666' }}>
                  Después de cobrar, se abrirá automáticamente el ticket para imprimir
                </div>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrdenesActivas;