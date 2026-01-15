// frontend/src/pages/ordenes/NuevaOrden.jsx - VERSIÓN CORREGIDA CON BÚSQUEDA REAL
import React, { useState, useEffect } from "react";
import { 
  Form, Input, Select, Button, message, Card, 
  Row, Col, Typography, Divider, Alert, Spin, Tag, Collapse
} from "antd";
import { SearchOutlined, LoadingOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons';
import ordenesApi from "../../api/ordenesApi";
import clientesApi from "../../api/clientesApi"; // ✅ NUEVA IMPORTACIÓN
import { CONFIG } from "../../config";

const { Option } = Select;
const { Title, Text } = Typography;
const { Panel } = Collapse;

const NuevaOrden = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [buscandoVehiculo, setBuscandoVehiculo] = useState(false);
  const [tipoLavado, setTipoLavado] = useState("express");
  const [precio, setPrecio] = useState(15000);
  const [infoVehiculo, setInfoVehiculo] = useState(null);
  const [promocionInfo, setPromocionInfo] = useState(null);
  const [esClienteNuevo, setEsClienteNuevo] = useState(false); // ✅ NUEVO ESTADO
  const [creandoCliente, setCreandoCliente] = useState(false); // ✅ NUEVO ESTADO
  
  // ✅ TIPOS DE VEHÍCULO
  const tiposVehiculo = [
    { value: 'carro', label: '🚗 Carro' },
    { value: 'moto', label: '🏍️ Moto' },
    { value: 'taxi', label: '🚕 Taxi' },
    { value: 'camioneta', label: '🚙 Camioneta' }
  ];

  // ✅ TARIFAS (usa las de config o las locales)
  const tarifas = CONFIG.PRECIOS_DEFAULT;

  // ✅ FUNCIÓN PARA BUSCAR CLIENTE POR PLACA (VERSIÓN REAL)
  const buscarVehiculoPorPlaca = async (placa) => {
    if (!placa || placa.length < 3) {
      setInfoVehiculo(null);
      setPromocionInfo(null);
      setEsClienteNuevo(false);
      return;
    }

    setBuscandoVehiculo(true);
    try {
      // ✅ LLAMADA REAL AL BACKEND
      console.log(`🔍 Buscando cliente por placa: ${placa}`);
      const response = await clientesApi.buscarPorPlaca(placa, CONFIG.PUNTO_ID);
      
      console.log("✅ Respuesta de búsqueda:", response);
      
      if (response.success && response.encontrado && response.cliente) {
        // ✅ CLIENTE ENCONTRADO
        setEsClienteNuevo(false);
        
        const contadorActual = response.contador_actual || 0;
        const proximaLavada = contadorActual + 1;
        const esDecimaGratis = (proximaLavada === 10);
        
        setInfoVehiculo({
          placa: response.cliente.placa_vehiculo,
          marca: response.vehiculo?.marca || 'NO REGISTRADA',
          modelo: response.vehiculo?.modelo || 'NO REGISTRADO',
          lavadasTotales: response.vehiculo?.estadisticas?.total_lavados || 0,
          clienteNombre: response.cliente.nombre_completo,
          clienteTelefono: response.cliente.telefono
        });
        
        setPromocionInfo({
          lavadasParaGratis: contadorActual,
          esProximaGratis: esDecimaGratis,
          faltan: 10 - contadorActual,
          progreso: (contadorActual / 10) * 100,
          proximaLavada: proximaLavada
        });
        
        // ✅ SI EL VEHÍCULO YA TIENE TIPO, SUGERIRLO
        if (response.vehiculo?.tipo_vehiculo && !form.getFieldValue("tipo")) {
          form.setFieldsValue({ tipo: response.vehiculo.tipo_vehiculo });
          handleTipoVehiculoChange(response.vehiculo.tipo_vehiculo);
        }
        
      } else {
        // ❌ CLIENTE NO ENCONTRADO - Mostrar campos para crear
        setEsClienteNuevo(true);
        setInfoVehiculo(null);
        setPromocionInfo(null);
        
        // ✅ RESETEAR CAMPOS DEL CLIENTE
        form.setFieldsValue({
          nombre_cliente: '',
          telefono_cliente: '',
          lavadas_iniciales: 0
        });
        
        console.log("⚠️ Cliente no encontrado, modo creación activado");
      }
    } catch (error) {
      console.error("❌ Error buscando vehículo:", error);
      message.error("Error al buscar cliente. Intente nuevamente.");
      setEsClienteNuevo(true);
      setInfoVehiculo(null);
      setPromocionInfo(null);
    } finally {
      setBuscandoVehiculo(false);
    }
  };

  // ✅ MANEJAR CAMBIO DE PLACA
  const handlePlacaChange = (e) => {
    const placa = e.target.value.toUpperCase();
    if (placa.length >= 3) {
      buscarVehiculoPorPlaca(placa);
    } else {
      setInfoVehiculo(null);
      setPromocionInfo(null);
      setEsClienteNuevo(false);
    }
  };

  // ✅ OBTENER TIPOS DE LAVADO DISPONIBLES
  const getTiposLavadoDisponibles = (tipoVehiculo) => {
    const disponibilidad = {
      carro: ['express', 'premium'],
      moto: ['express', 'elite', 'premium'],
      taxi: ['express'],
      camioneta: ['express', 'elite', 'premium']
    };
    return disponibilidad[tipoVehiculo] || ['express'];
  };

  // ✅ OBTENER LABEL CON EMOJI Y PRECIO
  const getLabelTipoLavado = (tipo, precio) => {
    const map = { 
      express: '⚡ Express',
      elite: '✨ Elite', 
      premium: '👑 Premium'
    };
    const label = map[tipo] || tipo;
    return `${label} - $${precio.toLocaleString()}`;
  };

  // ✅ OBTENER LABEL DE TIPO DE VEHÍCULO
  const getLabelTipoVehiculo = (value) => {
    const map = { 
      carro: 'Carro', 
      moto: 'Moto', 
      taxi: 'Taxi', 
      camioneta: 'Camioneta' 
    };
    return map[value] || value;
  };

  // ✅ CALCULAR PRECIO CUANDO CAMBIAN LOS SELECTS
  useEffect(() => {
    const tipoVehiculo = form.getFieldValue("tipo");
    
    if (tipoVehiculo) {
      const tiposDisponibles = getTiposLavadoDisponibles(tipoVehiculo);
      
      if (!tiposDisponibles.includes(tipoLavado)) {
        const nuevoTipoLavado = tiposDisponibles[0];
        setTipoLavado(nuevoTipoLavado);
        const precioCalculado = tarifas[tipoVehiculo]?.[nuevoTipoLavado] || 15000;
        setPrecio(precioCalculado);
      } else {
        const precioCalculado = tarifas[tipoVehiculo]?.[tipoLavado] || 15000;
        
        // Si la próxima lavada es gratis, precio = 0
        if (promocionInfo?.esProximaGratis) {
          setPrecio(0);
        } else {
          setPrecio(precioCalculado);
        }
      }
    } else {
      setPrecio(15000);
    }
  }, [form, tipoLavado, promocionInfo]);

  // ✅ MANEJAR CAMBIO DE TIPO DE VEHÍCULO
  const handleTipoVehiculoChange = (value) => {
    const tiposDisponibles = getTiposLavadoDisponibles(value);
    const primerTipoDisponible = tiposDisponibles[0];
    setTipoLavado(primerTipoDisponible);
    
    const precioCalculado = tarifas[value]?.[primerTipoDisponible] || 15000;
    
    // Si la próxima lavada es gratis, precio = 0
    if (promocionInfo?.esProximaGratis) {
      setPrecio(0);
    } else {
      setPrecio(precioCalculado);
    }
  };

  // ✅ MANEJAR CAMBIO DE TIPO DE LAVADO
  const handleTipoLavadoChange = (value) => {
    setTipoLavado(value);
    const tipoVehiculo = form.getFieldValue("tipo");
    if (tipoVehiculo) {
      const precioCalculado = tarifas[tipoVehiculo]?.[value] || 15000;
      
      // Si la próxima lavada es gratis, precio = 0
      if (promocionInfo?.esProximaGratis) {
        setPrecio(0);
      } else {
        setPrecio(precioCalculado);
      }
    }
  };

  // ✅ CREAR CLIENTE NUEVO
  const crearClienteNuevo = async (placa, tipoVehiculo, datosCliente) => {
    try {
      setCreandoCliente(true);
      
      const clienteData = {
        nombre_completo: datosCliente.nombre_cliente,
        telefono: datosCliente.telefono_cliente,
        placa_vehiculo: placa,
        tipo_vehiculo: tipoVehiculo,
        tipo_lavado_preferido: tipoLavado,
        lavadas_iniciales: datosCliente.lavadas_iniciales || 0,
        punto_id: CONFIG.PUNTO_ID,
        usuario_id: CONFIG.USUARIO_ID
      };

      console.log("📝 Creando cliente nuevo:", clienteData);
      const response = await clientesApi.crearCliente(clienteData);
      
      if (response.success) {
        console.log("✅ Cliente creado:", response.cliente);
        return {
          cliente_id: response.cliente._id,
          vehiculo_id: response.vehiculo._id,
          cliente_nombre: response.cliente.nombre_completo,
          cliente_telefono: response.cliente.telefono
        };
      } else {
        throw new Error(response.msg || "Error al crear cliente");
      }
    } catch (error) {
      console.error("❌ Error creando cliente:", error);
      throw error;
    } finally {
      setCreandoCliente(false);
    }
  };

  // ✅ CREAR ORDEN (VERSIÓN MEJORADA)
  const handleCrearOrden = async (values) => {
    if (!values.placa || !values.tipo) {
      message.error("Placa y tipo de vehículo son obligatorios");
      return;
    }

    const tiposPermitidos = getTiposLavadoDisponibles(values.tipo);
    if (!tiposPermitidos.includes(tipoLavado)) {
      message.error(`El tipo de lavado ${tipoLavado} no está disponible para ${getLabelTipoVehiculo(values.tipo)}`);
      return;
    }

    // ✅ VALIDAR DATOS DE CLIENTE NUEVO
    if (esClienteNuevo) {
      if (!values.nombre_cliente || !values.telefono_cliente) {
        message.error("Para cliente nuevo, nombre y teléfono son obligatorios");
        return;
      }
    }

    setLoading(true);
    
    try {
      let cliente_id = null;
      let vehiculo_id = null;
      let cliente_nombre = infoVehiculo?.clienteNombre || '';
      let cliente_telefono = infoVehiculo?.clienteTelefono || '';

      // ✅ PASO 1: CREAR CLIENTE SI ES NUEVO
      if (esClienteNuevo) {
        const clienteCreado = await crearClienteNuevo(
          values.placa.toUpperCase(),
          values.tipo,
          values
        );
        
        cliente_id = clienteCreado.cliente_id;
        vehiculo_id = clienteCreado.vehiculo_id;
        cliente_nombre = clienteCreado.cliente_nombre;
        cliente_telefono = clienteCreado.cliente_telefono;
      }

      // ✅ PASO 2: CREAR LA ORDEN
      const payload = {
        placa: values.placa.toUpperCase(),
        tipo_vehiculo: values.tipo,
        tipo_lavado: tipoLavado,
        precio_manual: precio,
        notas_cliente: values.comentarios || "",
        usuario_id: CONFIG.USUARIO_ID,
        punto_id: CONFIG.PUNTO_ID,
        cliente_id: cliente_id,  // ✅ Si es nuevo, ya tiene ID
        vehiculo_id: vehiculo_id, // ✅ Si es nuevo, ya tiene ID
        es_decima_gratis: promocionInfo?.esProximaGratis || false
      };

      console.log("📦 Enviando payload de orden:", payload);
      const res = await ordenesApi.crearOrden(payload);
      
      if (res && res.success) {
        let mensajePromocion = '';
        if (promocionInfo?.esProximaGratis) {
          mensajePromocion = ' 🎉 ¡LAVADA GRATIS APLICADA! (Promoción 9+1)';
        } else if (promocionInfo) {
          mensajePromocion = ` 📊 ${promocionInfo.lavadasParaGratis}/10 lavadas (${promocionInfo.faltan} para gratis)`;
        }

        const mensajeCliente = esClienteNuevo 
          ? `👤 Cliente registrado: ${cliente_nombre}` 
          : `👤 Cliente existente: ${cliente_nombre}`;

        message.success({
          content: (
            <div>
              <Text strong style={{ fontSize: '16px' }}>✅ Orden creada correctamente{mensajePromocion}</Text>
              <Divider style={{ margin: '8px 0' }} />
              <div style={{ lineHeight: '1.8' }}>
                <div><Text strong>N° Orden:</Text> <Text copyable>{res.orden?.numero_orden || "Pendiente"}</Text></div>
                <div><Text strong>{mensajeCliente}</Text></div>
                <div><Text strong>Teléfono:</Text> <Text>{cliente_telefono}</Text></div>
                <div><Text strong>Placa:</Text> <Text>{values.placa.toUpperCase()}</Text></div>
                <div><Text strong>Vehículo:</Text> <Text>{getLabelTipoVehiculo(values.tipo)}</Text></div>
                <div><Text strong>Lavado:</Text> <Text>{getLabelTipoLavado(tipoLavado, precio)}</Text></div>
                <div><Text strong>Precio:</Text> 
                  <Text type={promocionInfo?.esProximaGratis ? "success" : "success"} strong>
                    ${promocionInfo?.esProximaGratis ? "0 (GRATIS)" : precio.toLocaleString()}
                  </Text>
                </div>
                {promocionInfo && !promocionInfo.esProximaGratis && (
                  <div><Text strong>Próxima lavada:</Text> <Text>#{promocionInfo.proximaLavada}/10</Text></div>
                )}
                {values.comentarios && (
                  <div><Text strong>Observaciones:</Text> <Text>{values.comentarios}</Text></div>
                )}
              </div>
            </div>
          ),
          duration: 8,
        });
        
        // ✅ RESETEAR FORMULARIO
        form.resetFields();
        setTipoLavado("express");
        setPrecio(15000);
        setInfoVehiculo(null);
        setPromocionInfo(null);
        setEsClienteNuevo(false);
        
      } else {
        message.error(res?.message || "Error creando la orden");
      }
      
    } catch (error) {
      console.error("❌ Error:", error);
      const errorMsg = error.response?.data?.message || error.message || "Error al crear la orden";
      message.error(errorMsg);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card 
      title="🆕 Crear Nueva Orden" 
      style={{ maxWidth: 650, margin: "20px auto" }}
      headStyle={{ backgroundColor: '#1890ff', color: 'white' }}
    >
      <Alert
        message="Sistema FullWash360"
        description="Complete los datos del vehículo para crear una nueva orden."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <Form form={form} layout="vertical" onFinish={handleCrearOrden}>
        {/* Placa con búsqueda */}
        <Form.Item
          label="Placa del vehículo"
          name="placa"
          rules={[{ required: true, message: "Ingresa la placa" }]}
          extra={buscandoVehiculo && "Buscando vehículo en el historial..."}
        >
          <Input 
            placeholder="Ej: ABC123" 
            size="large"
            style={{ textTransform: 'uppercase' }}
            maxLength={10}
            onChange={handlePlacaChange}
            suffix={buscandoVehiculo ? <LoadingOutlined /> : <SearchOutlined />}
          />
        </Form.Item>

        {/* Información del vehículo encontrado */}
        {infoVehiculo && !esClienteNuevo && (
          <Alert
            message={
              <div>
                <Text strong>✅ Cliente encontrado: </Text>
                {infoVehiculo.clienteNombre} ({infoVehiculo.clienteTelefono})
                <Tag color="blue" style={{ marginLeft: 8 }}>
                  {infoVehiculo.lavadasTotales} lavadas registradas
                </Tag>
              </div>
            }
            description={
              promocionInfo ? (
                <div>
                  <Text>Promoción 9+1: {promocionInfo.lavadasParaGratis}/10 lavadas</Text>
                  <Text> - Próxima lavada: #{promocionInfo.proximaLavada}</Text>
                  {promocionInfo.esProximaGratis && (
                    <div style={{ marginTop: 4 }}>
                      <Tag color="green">¡PRÓXIMA LAVADA GRATIS! 🎉</Tag>
                    </div>
                  )}
                  <div style={{ marginTop: 8 }}>
                    <div style={{ 
                      width: '100%', 
                      backgroundColor: '#f0f0f0', 
                      borderRadius: 4,
                      height: 8
                    }}>
                      <div style={{
                        width: `${promocionInfo.progreso}%`,
                        backgroundColor: promocionInfo.esProximaGratis ? '#52c41a' : '#1890ff',
                        height: '100%',
                        borderRadius: 4
                      }} />
                    </div>
                  </div>
                </div>
              ) : "No hay información de promoción"
            }
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Formulario para cliente nuevo */}
        {esClienteNuevo && (
          <Collapse 
            defaultActiveKey={['1']} 
            style={{ marginBottom: 16 }}
            bordered={false}
          >
            <Panel 
              header={
                <div>
                  <Text strong>📝 Registrar Nuevo Cliente</Text>
                  <Tag color="orange" style={{ marginLeft: 8 }}>Nuevo</Tag>
                </div>
              } 
              key="1"
            >
              <Alert
                message="Cliente no encontrado"
                description="Complete los datos para registrar al nuevo cliente."
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Nombre del Cliente"
                    name="nombre_cliente"
                    rules={[{ required: true, message: "Ingresa el nombre" }]}
                  >
                    <Input 
                      placeholder="Ej: Juan Pérez" 
                      size="large"
                      prefix={<UserOutlined />}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Teléfono"
                    name="telefono_cliente"
                    rules={[{ required: true, message: "Ingresa el teléfono" }]}
                  >
                    <Input 
                      placeholder="Ej: 555-1234" 
                      size="large"
                      prefix={<PhoneOutlined />}
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                label="Lavadas iniciales (opcional)"
                name="lavadas_iniciales"
                extra="Si el cliente ya ha tenido lavadas anteriores, indica cuántas (0-9)"
              >
                <Select defaultValue={0} size="large">
                  {[0,1,2,3,4,5,6,7,8,9].map(num => (
                    <Option key={num} value={num}>
                      {num} lavada{num !== 1 ? 's' : ''} realizada{num !== 1 ? 's' : ''}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Alert
                message="💡 Información importante"
                description="Este cliente será registrado automáticamente para futuras visitas. Su vehículo iniciará con el contador de lavadas que indiques."
                type="info"
                showIcon
              />
            </Panel>
          </Collapse>
        )}

        <Row gutter={16}>
          {/* Tipo de vehículo */}
          <Col span={12}>
            <Form.Item
              label="Tipo de vehículo"
              name="tipo"
              rules={[{ required: true, message: "Selecciona tipo" }]}
            >
              <Select 
                placeholder="Selecciona" 
                size="large"
                onChange={handleTipoVehiculoChange}
                disabled={creandoCliente}
              >
                {tiposVehiculo.map(item => (
                  <Option key={item.value} value={item.value}>
                    {item.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Tipo de lavado */}
          <Col span={12}>
            <Form.Item label="Tipo de lavado" required>
              <Select 
                value={tipoLavado}
                onChange={handleTipoLavadoChange}
                placeholder="Selecciona tipo de lavado"
                size="large"
                disabled={!form.getFieldValue("tipo") || creandoCliente}
              >
                {form.getFieldValue("tipo") && 
                  getTiposLavadoDisponibles(form.getFieldValue("tipo")).map(tipo => (
                    <Option key={tipo} value={tipo}>
                      {getLabelTipoLavado(tipo, tarifas[form.getFieldValue("tipo")]?.[tipo] || 0)}
                    </Option>
                  ))
                }
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Precio Calculado */}
        <Divider />
        <Card size="small" style={{ 
          backgroundColor: promocionInfo?.esProximaGratis ? '#f6ffed' : '#f0f8ff',
          border: promocionInfo?.esProximaGratis ? '2px solid #52c41a' : '1px solid #91d5ff',
          marginBottom: 16
        }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Text strong>Precio Total:</Text>
              {promocionInfo?.esProximaGratis && (
                <Tag color="green" style={{ marginLeft: 8 }}>¡GRATIS!</Tag>
              )}
              {esClienteNuevo && (
                <Tag color="orange" style={{ marginLeft: 8 }}>Cliente Nuevo</Tag>
              )}
            </Col>
            <Col>
              <Title 
                level={3} 
                style={{ 
                  margin: 0, 
                  color: promocionInfo?.esProximaGratis ? '#52c41a' : '#1890ff'
                }}
              >
                ${promocionInfo?.esProximaGratis ? "0" : precio.toLocaleString()}
              </Title>
            </Col>
          </Row>
          {form.getFieldValue("tipo") && tipoLavado && (
            <div>
              <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: '12px' }}>
                {getLabelTipoVehiculo(form.getFieldValue("tipo"))} • {getLabelTipoLavado(tipoLavado, tarifas[form.getFieldValue("tipo")]?.[tipoLavado] || 0)}
              </Text>
            </div>
          )}
          {promocionInfo && !promocionInfo.esProximaGratis && (
            <div>
              <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: '12px' }}>
                Próxima lavada: #{promocionInfo.proximaLavada}/10 • {promocionInfo.faltan} para gratis
              </Text>
            </div>
          )}
        </Card>

        {/* Observaciones */}
        <Form.Item label="Observaciones (opcional)" name="comentarios">
          <Input.TextArea 
            rows={2} 
            placeholder="Notas adicionales sobre el vehículo, daños, preferencias, etc." 
            maxLength={200}
            showCount
            disabled={creandoCliente}
          />
        </Form.Item>

        {/* Botón */}
        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading || creandoCliente}
            size="large"
            block
            disabled={!form.getFieldValue("tipo") || creandoCliente}
            style={{
              background: promocionInfo?.esProximaGratis ? '#52c41a' : '#1890ff',
              borderColor: promocionInfo?.esProximaGratis ? '#52c41a' : '#1890ff',
              height: '45px',
              fontSize: '16px'
            }}
          >
            {creandoCliente ? "Registrando cliente..." : 
             loading ? "Creando orden..." : 
             promocionInfo?.esProximaGratis ? "🎉 Crear Orden Gratis" : 
             esClienteNuevo ? "📝 Registrar Cliente y Crear Orden" : "📝 Crear Orden"}
          </Button>
        </Form.Item>

        {/* Info de precios */}
        <Alert
          message="Tarifas vigentes"
          description={
            <div>
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <div><strong>🚗 Carro:</strong></div>
                  <div>• Express: $15,000</div>
                  <div>• Premium: $20,000</div>
                </Col>
                <Col span={12}>
                  <div><strong>🏍️ Moto:</strong></div>
                  <div>• Express: $12,000</div>
                  <div>• Elite: $15,000</div>
                  <div>• Premium: $17,000</div>
                </Col>
                <Col span={12}>
                  <div><strong>🚕 Taxi:</strong></div>
                  <div>• Express: $15,000</div>
                </Col>
                <Col span={12}>
                  <div><strong>🚙 Camioneta:</strong></div>
                  <div>• Express: $15,000</div>
                  <div>• Elite: $15,000</div>
                  <div>• Premium: $15,000</div>
                </Col>
              </Row>
              <Divider style={{ margin: '8px 0' }} />
              <div>
                <Text type="secondary">
                  💡 <strong>Promoción 9+1:</strong> Cada 10ma lavada es GRATIS para clientes frecuentes.
                </Text>
              </div>
            </div>
          }
          type="info"
          showIcon
        />
      </Form>
    </Card>
  );
};

export default NuevaOrden;