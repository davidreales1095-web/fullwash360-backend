// frontend/src/pages/ordenes/OrdenesActivas.jsx - VERSIÓN FINAL CORREGIDA
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
  
  // Estados para el modal de cobro
  const [modalVisible, setModalVisible] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [cobrando, setCobrando] = useState(false);
  const [form] = Form.useForm();
  
  // Estados para búsqueda
  const [searchText, setSearchText] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [backendConectado, setBackendConectado] = useState(false);

  // ====================================================
  // ✅ FUNCIÓN CORREGIDA PARA IMPRIMIR TICKET
  // ====================================================
  const imprimirTicket = (orden, lavador, datosCobro) => {
    try {
      console.log("🖨️  Iniciando impresión del ticket...", { orden, lavador, datosCobro });
      
      // Preparar datos del lavador
      let lavadorInfo = lavador;
      if (typeof lavador === 'string') {
        lavadorInfo = lavadores.find(l => l._id === lavador) || { 
          nombre: 'No asignado', 
          codigo: 'N/A' 
        };
      }

      // Crear ventana de impresión
      const ventanaImpresion = window.open('', '_blank', 'width=400,height=600,scrollbars=yes');
      
      // HTML del ticket - DISEÑO CORREGIDO PARA CLIENTE
      const contenidoHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ticket ${orden.numero_orden} - FULLWASH 360</title>
          <meta charset="UTF-8">
          <style>
            /* RESET Y ESTILOS BASE */
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              font-family: 'Courier New', monospace;
              line-height: 1.3;
            }
            
            body {
              width: 80mm;
              margin: 0 auto;
              padding: 5mm;
              background: white;
              font-size: 12px;
              color: #000;
            }
            
            /* ESTILOS ESPECÍFICOS PARA IMPRESIÓN */
            @media print {
              body {
                padding: 0;
                width: 80mm !important;
              }
              
              .no-print {
                display: none !important;
              }
            }
            
            /* CONTENEDOR PRINCIPAL */
            .ticket-container {
              width: 100%;
              max-width: 80mm;
              margin: 0 auto;
              border: 1px solid #ddd;
              padding: 10px;
              background: white;
              position: relative;
            }
            
            /* ENCABEZADO */
            .header {
              text-align: center;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 2px dashed #000;
            }
            
            .logo {
              font-size: 20px;
              font-weight: bold;
              color: #1890ff;
              margin-bottom: 5px;
            }
            
            .empresa {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 3px;
            }
            
            .slogan {
              font-size: 10px;
              color: #666;
              margin-bottom: 5px;
            }
            
            /* INFORMACIÓN DE LA ORDEN */
            .info-section {
              margin-bottom: 15px;
            }
            
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 4px;
              padding: 2px 0;
            }
            
            .label {
              font-weight: bold;
              min-width: 40%;
            }
            
            .value {
              text-align: right;
              font-weight: 500;
            }
            
            .destacado {
              background: #f0f8ff;
              padding: 4px 8px;
              border-radius: 3px;
              font-weight: bold;
            }
            
            /* TOTALES */
            .totales {
              margin: 15px 0;
              padding: 15px;
              background: #f6ffed;
              border: 2px solid #b7eb8f;
              border-radius: 5px;
              text-align: center;
            }
            
            .total-grande {
              font-size: 22px;
              font-weight: bold;
              color: #52c41a;
              margin: 10px 0;
            }
            
            .gratis {
              color: #52c41a;
              font-weight: bold;
              font-size: 14px;
              animation: blink 1s infinite;
            }
            
            @keyframes blink {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.7; }
            }
            
            /* PIE DE PÁGINA */
            .footer {
              margin-top: 20px;
              padding-top: 10px;
              border-top: 1px dashed #000;
              text-align: center;
              font-size: 10px;
              color: #666;
            }
            
            .gracias {
              font-size: 12px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            
            .promocion {
              font-size: 9px;
              color: #888;
              margin-top: 5px;
            }
            
            /* BOTÓN DE IMPRESIÓN (solo visible en pantalla) */
            .print-button {
              display: block;
              width: 100%;
              margin: 20px auto;
              padding: 12px;
              background: #1890ff;
              color: white;
              border: none;
              border-radius: 5px;
              font-size: 14px;
              font-weight: bold;
              cursor: pointer;
              text-align: center;
              text-decoration: none;
            }
            
            .print-button:hover {
              background: #40a9ff;
            }
            
            /* ESTILOS ESPECÍFICOS */
            .tag {
              display: inline-block;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 10px;
              font-weight: bold;
              margin-left: 5px;
            }
            
            .tag-blue { background: #1890ff; color: white; }
            .tag-green { background: #52c41a; color: white; }
            .tag-orange { background: #fa8c16; color: white; }
            .tag-red { background: #f5222d; color: white; }
            
            hr {
              border: none;
              border-top: 1px dashed #ccc;
              margin: 10px 0;
            }
            
            .divider {
              border-top: 1px dashed #000;
              margin: 10px 0;
              height: 0;
            }
          </style>
        </head>
        <body>
          <div class="ticket-container">
            <!-- ENCABEZADO -->
            <div class="header">
              <div class="logo">🚗 FULLWASH 360</div>
              <div class="empresa">SISTEMA DE LAVADO DE VEHÍCULOS</div>
              <div class="slogan">Calidad y rapidez en cada lavado</div>
            </div>
            
            <!-- INFORMACIÓN PRINCIPAL -->
            <div class="info-section">
              <div class="info-row">
                <span class="label">TICKET N°:</span>
                <span class="value destacado">${orden.numero_orden || 'ORD-0000'}</span>
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
                <span class="value">
                  <span class="tag tag-blue">${orden.placa?.toUpperCase() || 'SIN PLACA'}</span>
                </span>
              </div>
              
              <div class="info-row">
                <span class="label">VEHÍCULO:</span>
                <span class="value">
                  ${orden.tipo_vehiculo === 'carro' ? '🚗' : 
                    orden.tipo_vehiculo === 'moto' ? '🏍️' : 
                    orden.tipo_vehiculo === 'taxi' ? '🚕' : 
                    orden.tipo_vehiculo === 'camioneta' ? '🚙' : '🚗'}
                  ${orden.tipo_vehiculo?.toUpperCase() || 'CARRO'}
                </span>
              </div>
              
              <div class="info-row">
                <span class="label">SERVICIO:</span>
                <span class="value">
                  <span class="tag tag-green">
                    ${orden.servicios?.[0]?.nombre || 'Lavado Express'}
                  </span>
                </span>
              </div>
              
              <div class="info-row">
                <span class="label">LAVADOR:</span>
                <span class="value">
                  <span class="tag tag-orange">
                    ${lavadorInfo?.codigo ? lavadorInfo.codigo + ' - ' : ''}
                    ${lavadorInfo?.nombre || lavadorInfo?.lavador_nombre || 'No asignado'}
                  </span>
                </span>
              </div>
              
              <!-- ✅ CONTADOR DE LAVADAS CORREGIDO -->
              <div class="info-row">
                <span class="label">CONTADOR LAVADAS:</span>
                <span class="value" style="color: #1890ff; font-weight: bold;">
                  ${orden.contador_lavada ? `🏁 Lavada ${orden.contador_lavada}/10` : '🏁 Sistema 9+1 activo'}
                  ${orden.es_decima_gratis ? ' - ¡GRATIS! 🎉' : ''}
                </span>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <!-- DETALLES DE PAGO -->
            <div class="info-section">
              <div class="info-row">
                <span class="label">SUBTOTAL:</span>
                <span class="value">$${orden.total?.toLocaleString() || '0'}</span>
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
            </div>
            
            <!-- ✅ NOTA: SECCIÓN DE COMISIONES ELIMINADA (no debe aparecer en ticket de cliente) -->
            
            <!-- TOTALES -->
            <div class="totales">
              <div>TOTAL A PAGAR:</div>
              <div class="total-grande">
                ${orden.es_decima_gratis ? 'GRATIS 🎉' : `$${orden.total?.toLocaleString() || '0'}`}
              </div>
              ${orden.es_decima_gratis ? `
                <div style="font-size: 10px; color: #666; margin-top: 5px;">
                  (Valor regular: $${orden.total?.toLocaleString()})
                </div>
              ` : ''}
            </div>
            
            <div class="divider"></div>
            
            <!-- PIE DE PÁGINA -->
            <div class="footer">
              <div class="gracias">¡Gracias por su preferencia!</div>
              <div>Sistema de fidelización activo</div>
              <div class="promocion">Cada 10 lavadas = 1 GRATIS</div>
              <div>----------------------------------------</div>
              <div>FULLWASH 360 • ${new Date().getFullYear()}</div>
              <div>www.fullwash360.com</div>
              <div>----------------------------------------</div>
              <div style="font-size: 8px; margin-top: 5px;">
                Ticket generado: ${new Date().toLocaleString()}
              </div>
            </div>
            
            <!-- BOTÓN DE IMPRESIÓN (solo en pantalla) -->
            <button class="print-button no-print" onclick="window.print()">
              🖨️ IMPRIMIR TICKET
            </button>
            
            <div class="no-print" style="text-align: center; margin-top: 15px; font-size: 10px; color: #888;">
              Si la impresión no inicia automáticamente, haz clic en el botón arriba.
            </div>
          </div>
          
          <script>
            // Intento de impresión automática
            window.onload = function() {
              // Pequeño delay para que cargue todo
              setTimeout(function() {
                try {
                  window.print();
                  console.log('Impresión iniciada automáticamente');
                  
                  // Opcional: cerrar ventana después de un tiempo
                  setTimeout(function() {
                    if (window.confirm('¿Desea cerrar esta ventana?')) {
                      window.close();
                    }
                  }, 3000);
                } catch (error) {
                  console.error('Error al imprimir:', error);
                  alert('Para imprimir, haga clic en el botón "IMPRIMIR TICKET"');
                }
              }, 500);
            };
          </script>
        </body>
        </html>
      `;
      
      // Escribir el HTML en la ventana
      ventanaImpresion.document.write(contenidoHTML);
      ventanaImpresion.document.close();
      
      console.log('✅ Ticket generado correctamente');
      
    } catch (error) {
      console.error('❌ Error al generar el ticket:', error);
      // No mostramos error al usuario para no interrumpir el flujo
    }
  };

  // ====================================================
  // ✅ FUNCIÓN MODIFICADA PARA COBRAR CON IMPRESIÓN (CORREGIDA)
  // ====================================================
  const handleCobrarOrden = async (values) => {
    if (!ordenSeleccionada) return;
    
    setCobrando(true);
    try {
      // Buscar lavador seleccionado
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
        // Mensaje de éxito
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
        
        // ✅ CORRECCIÓN: IMPRIMIR TICKET CON DATOS ACTUALIZADOS DEL BACKEND
        const ordenActualizada = {
          ...ordenSeleccionada,
          total: res.orden?.total || ordenSeleccionada.total,
          // ✅ NO ASIGNAR VALOR POR DEFECTO 1 - Usar lo que venga del backend o mantener el actual
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
        
        // Cerrar modal y actualizar lista
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
  // ✅ FUNCIÓN CARGAR ÓRDENES ACTIVAS (CORREGIDA - SIN DATOS MOCK)
  // ====================================================
  const cargarOrdenesActivas = async () => {
    try {
      setLoading(true);
      const res = await ordenesApi.obtenerOrdenesActivas();
      
      console.log("📥 Respuesta del backend:", res);
      
      // ✅ VERIFICAR SI EL BACKEND ESTÁ CONECTADO
      if (res && res.success === false) {
        // El backend respondió pero con error
        setBackendConectado(false);
        message.warning(res.message || "Error al conectar con el servidor");
        
        // ✅ NO USAR DATOS MOCK - Dejar array vacío
        setOrdenes([]);
        setFilteredOrdenes([]);
        return;
      }
      
      // ✅ BACKEND CONECTADO CORRECTAMENTE
      setBackendConectado(true);
      
      // ✅ MANEJO DE DIFERENTES FORMATOS DE RESPUESTA
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
      
      // ✅ FORMATO CONSISTENTE PARA LAS ÓRDENES
      const ordenesFormateadas = ordenesArray.map(orden => ({
        ...orden,
        key: orden._id,
        tiempoTranscurrido: orden.fecha_creacion ? 
          dayjs(orden.fecha_creacion).fromNow() : '--',
        minutosTranscurridos: orden.fecha_creacion ? 
          Math.floor((new Date() - new Date(orden.fecha_creacion)) / (1000 * 60)) : 0,
        // ✅ Asegurar que contador_lavada sea un número (1-10)
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
      
      // ✅ NO USAR DATOS MOCK - Dejar arrays vacíos
      setOrdenes([]);
      setFilteredOrdenes([]);
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // ✅ FUNCIÓN CARGAR LAVADORES (CORREGIDA - SIN DATOS MOCK)
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
      
      // ✅ NO USAR DATOS MOCK - Dejar array vacío
      setLavadores([]);
      message.warning("No se pudieron cargar los lavadores. Verifica la conexión.");
    } finally {
      setLoadingLavadores(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    cargarOrdenesActivas();
    cargarLavadores();
  }, []);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    let interval;
    if (autoRefresh && backendConectado) {
      interval = setInterval(() => {
        cargarOrdenesActivas();
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, backendConectado]);

  // Filtrar órdenes por búsqueda
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

  // Abrir modal para cobrar una orden
  const abrirModalCobro = (orden) => {
    setOrdenSeleccionada(orden);
    form.setFieldsValue({
      lavador_asignado: undefined,
      metodo_pago: 'efectivo',
      pago_recibido: orden.total
    });
    setModalVisible(true);
  };

  // Cerrar modal
  const cerrarModal = () => {
    setModalVisible(false);
    setOrdenSeleccionada(null);
    form.resetFields();
  };

  // Función para cancelar orden
  const handleCancelarOrden = async (ordenId) => {
    try {
      // TODO: Implementar API para cancelar
      message.info("Función de cancelar pendiente de implementar");
    } catch (error) {
      console.error("Error cancelando orden:", error);
    }
  };

  // Calcular estadísticas
  const calcularEstadisticas = () => {
    const totalOrdenes = filteredOrdenes.length;
    const totalVentas = filteredOrdenes.reduce((sum, orden) => sum + (orden.total || 0), 0);
    const promedioTiempo = filteredOrdenes.length > 0
      ? filteredOrdenes.reduce((sum, orden) => sum + (orden.minutosTranscurridos || 0), 0) / filteredOrdenes.length
      : 0;

    return { totalOrdenes, totalVentas, promedioTiempo };
  };

  const estadisticas = calcularEstadisticas();

  // ✅ COLUMNAS DE LA TABLA (CON COLUMNA DE CONTADOR AÑADIDA)
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
        <Tag color={record.contador_lavada === 10 ? "green" : "blue"}>
          <NumberOutlined /> {record.contador_lavada || 1}/10
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
              ¡Gratis! (10ma)
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
        {/* Barra de búsqueda y estadísticas */}
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
                  <li>✅ Que el servidor esté corriendo en <code>{process.env.REACT_APP_API_URL || 'http://localhost:5000'}</code></li>
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

      {/* Modal para cobrar orden */}
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
            {/* Detalles de la orden */}
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
                        🎉 ¡LAVADA GRATIS! (Promoción 9+1)
                      </Tag>
                    )}
                    {ordenSeleccionada.contador_lavada && (
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#1890ff' }}>
                        <Text strong>Contador lavadas: {ordenSeleccionada.contador_lavada}/10</Text>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Formulario de cobro */}
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

              {/* Mostrar vuelto calculado */}
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

              {/* Mostrar comisión calculada */}
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