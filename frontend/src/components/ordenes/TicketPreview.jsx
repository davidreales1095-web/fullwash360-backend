// src/components/ordenes/TicketPreview.jsx - VERSIÓN COMPLETA CORREGIDA
import React from 'react';
import { Card, Tag, Divider, Row, Col, Typography, Badge } from 'antd';
import { formatCurrency } from '../../utils/formatCurrency';
import { 
  CarOutlined, 
  UserOutlined, 
  CalendarOutlined,
  DollarOutlined,
  TrophyOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const TicketPreview = ({ orden }) => {
  if (!orden) {
    return (
      <Card style={{ textAlign: 'center', padding: '40px 20px' }}>
        <Text type="secondary">
          Complete el formulario para ver la vista previa del ticket
        </Text>
      </Card>
    );
  }

  // ✅ FUNCIÓN PARA OBTENER EL NOMBRE DEL LAVADOR
  const getLavadorNombre = () => {
    // 1. Si viene directamente en lavador_nombre (preview)
    if (orden.lavador_nombre && orden.lavador_nombre !== 'No asignado') {
      return orden.lavador_nombre;
    }
    
    // 2. Si viene en comision_lavador.lavador_nombre (orden real)
    if (orden.comision_lavador?.lavador_nombre) {
      return orden.comision_lavador.lavador_nombre;
    }
    
    // 3. Si viene como objeto populado
    if (orden.lavador_asignado?.nombre) {
      return `${orden.lavador_asignado.codigo || ''} - ${orden.lavador_asignado.nombre}`;
    }
    
    // 4. Si viene como objeto con propiedades separadas
    if (orden.lavador_codigo && orden.lavador_nombre) {
      return `${orden.lavador_codigo} - ${orden.lavador_nombre}`;
    }
    
    return 'No asignado';
  };

  // ✅ FUNCIÓN PARA OBTENER LA COMISIÓN
  const getComisionLavador = () => {
    if (orden.comision_lavador?.monto) {
      return orden.comision_lavador.monto;
    }
    
    if (orden.comision_lavador) {
      return orden.comision_lavador;
    }
    
    // Calcular 40% del precio (sistema actual)
    return orden.precio * 0.4;
  };

  // ✅ FUNCIÓN PARA OBTENER EL COLOR DEL TIPO DE LAVADO
  const getColorTipoLavado = () => {
    switch(orden.tipo_lavado?.toLowerCase()) {
      case 'premium': return 'gold';
      case 'elite': return 'purple';
      case 'express': return 'green';
      default: return 'blue';
    }
  };

  // ✅ FUNCIÓN PARA OBTENER EL COLOR DEL TIPO DE VEHÍCULO
  const getColorTipoVehiculo = () => {
    switch(orden.tipo_vehiculo?.toLowerCase()) {
      case 'carro': return 'blue';
      case 'moto': return 'green';
      case 'taxi': return 'orange';
      case 'camioneta': return 'purple';
      case 'suv': return 'cyan';
      default: return 'default';
    }
  };

  const lavadorNombre = getLavadorNombre();
  const comisionLavador = getComisionLavador();
  const esLavadaGratis = orden.es_decima_gratis || orden.contador_lavada % 10 === 0;

  return (
    <Card
      title={
        <div style={{ textAlign: 'center' }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            🚗 FULLWASH 360
          </Title>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Sistema de Lavado de Vehículos
          </Text>
        </div>
      }
      style={{ 
        maxWidth: 400,
        margin: '0 auto',
        fontFamily: "'Courier New', monospace",
        background: '#f8f9fa',
        border: '1px solid #d9d9d9',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
      headStyle={{ 
        background: '#1890ff', 
        color: 'white',
        borderBottom: '2px solid #1890ff'
      }}
    >
      {/* ENCABEZADO DEL TICKET */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <Badge.Ribbon 
          text={esLavadaGratis ? "🎉 10ma GRATIS" : "TICKET"} 
          color={esLavadaGratis ? "#52c41a" : "#1890ff"}
        >
          <div style={{ paddingTop: 20 }}>
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
              #{orden.numero_orden || `PREVIEW-${Date.now().toString().slice(-6)}`}
            </Title>
            <Text type="secondary">
              {orden.fecha_creacion ? 
                new Date(orden.fecha_creacion).toLocaleDateString('es-CO') : 
                'Fecha no disponible'
              }
            </Text>
          </div>
        </Badge.Ribbon>
      </div>

      <Divider style={{ margin: '12px 0' }} />

      {/* INFORMACIÓN DEL VEHÍCULO */}
      <div style={{ marginBottom: 16 }}>
        <Title level={5} style={{ marginBottom: 8 }}>
          <CarOutlined /> INFORMACIÓN DEL VEHÍCULO
        </Title>
        
        <Row gutter={[8, 8]} style={{ marginBottom: 8 }}>
          <Col span={12}>
            <Text strong>Placa:</Text>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Tag color="blue" style={{ fontSize: '14px', fontWeight: 'bold' }}>
              {orden.placa?.toUpperCase()}
            </Tag>
          </Col>

          <Col span={12}>
            <Text>Tipo de vehículo:</Text>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Tag color={getColorTipoVehiculo()}>
              {orden.tipo_vehiculo?.toUpperCase() || 'CARRO'}
            </Tag>
          </Col>

          <Col span={12}>
            <Text>Servicio:</Text>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Tag color={getColorTipoLavado()}>
              {orden.tipo_lavado?.toUpperCase() || 'EXPRESS'} WASH
            </Tag>
          </Col>

          {/* ✅ NUEVO: LAVADOR ASIGNADO */}
          <Col span={12}>
            <Text>
              <UserOutlined /> Lavador:
            </Text>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Tag color={lavadorNombre !== 'No asignado' ? 'green' : 'default'}>
              {lavadorNombre}
            </Tag>
          </Col>
        </Row>
      </div>

      {/* CONTADOR DE LAVADAS */}
      {orden.contador_lavada !== undefined && (
        <div style={{ 
          marginBottom: 16,
          padding: '8px',
          background: '#f0f9ff',
          borderRadius: '4px',
          borderLeft: '3px solid #1890ff'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong>
                <TrophyOutlined /> Lavada #{orden.contador_lavada}
              </Text>
            </div>
            <div>
              <Badge 
                count={`${orden.contador_lavada % 10}/10`} 
                style={{ 
                  backgroundColor: esLavadaGratis ? '#52c41a' : '#1890ff' 
                }} 
              />
            </div>
          </div>
          <div style={{ 
            height: '6px',
            background: '#e6f7ff',
            borderRadius: '3px',
            marginTop: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${((orden.contador_lavada % 10) / 10) * 100}%`,
              height: '100%',
              background: esLavadaGratis ? '#52c41a' : '#1890ff',
              transition: 'width 0.3s'
            }} />
          </div>
          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
            {esLavadaGratis ? 
              '🎉 ¡10ma lavada GRATIS!' : 
              `Faltan ${10 - (orden.contador_lavada % 10)} lavadas para gratis`
            }
          </Text>
        </div>
      )}

      <Divider style={{ margin: '12px 0' }} />

      {/* RESUMEN DE PAGO */}
      <div style={{ marginBottom: 16 }}>
        <Title level={5} style={{ marginBottom: 8 }}>
          <DollarOutlined /> RESUMEN DE PAGO
        </Title>
        
        <Row gutter={[8, 8]}>
          <Col span={12}>
            <Text>Subtotal:</Text>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Text>{formatCurrency(orden.precio)}</Text>
          </Col>

          {/* ✅ NUEVO: COMISIÓN DEL LAVADOR */}
          <Col span={12}>
            <Text style={{ color: '#fa8c16' }}>
              Comisión lavador (40%):
            </Text>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Text strong style={{ color: '#fa8c16' }}>
              {formatCurrency(comisionLavador)}
            </Text>
          </Col>

          {esLavadaGratis && (
            <Col span={24}>
              <div style={{ 
                padding: '8px',
                background: '#f6ffed',
                borderRadius: '4px',
                textAlign: 'center',
                border: '1px solid #b7eb8f'
              }}>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                <Text strong style={{ color: '#52c41a' }}>
                  DESCUENTO 10ma LAVADA: {formatCurrency(orden.precio)}
                </Text>
              </div>
            </Col>
          )}

          <Col span={24}>
            <Divider style={{ margin: '8px 0' }} />
          </Col>

          <Col span={12}>
            <Text strong style={{ fontSize: '16px' }}>
              TOTAL A PAGAR:
            </Text>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Title level={4} style={{ 
              margin: 0,
              color: esLavadaGratis ? '#52c41a' : '#1890ff'
            }}>
              {esLavadaGratis ? 'GRATIS 🎉' : formatCurrency(orden.precio)}
            </Title>
          </Col>
        </Row>
      </div>

      {/* INFORMACIÓN ADICIONAL */}
      {(orden.cliente || orden.notas_cliente) && (
        <>
          <Divider style={{ margin: '12px 0' }} />
          
          <div style={{ marginBottom: 16 }}>
            <Title level={5} style={{ marginBottom: 8 }}>
              <UserOutlined /> INFORMACIÓN ADICIONAL
            </Title>
            
            {orden.cliente && (
              <div style={{ marginBottom: 8 }}>
                <Text strong>Cliente: </Text>
                <Text>{orden.cliente.nombre_completo || orden.cliente}</Text>
                {orden.cliente.telefono && (
                  <div style={{ marginTop: '4px' }}>
                    <Text type="secondary">📞 {orden.cliente.telefono}</Text>
                  </div>
                )}
              </div>
            )}
            
            {orden.notas_cliente && (
              <div>
                <Text strong>Notas: </Text>
                <Text type="secondary" style={{ fontStyle: 'italic' }}>
                  "{orden.notas_cliente}"
                </Text>
              </div>
            )}
          </div>
        </>
      )}

      <Divider style={{ margin: '12px 0' }} />

      {/* PIE DE TICKET */}
      <div style={{ textAlign: 'center', paddingTop: 8 }}>
        <Text type="secondary" style={{ fontSize: '10px', display: 'block' }}>
          <CalendarOutlined /> {new Date().toLocaleDateString('es-CO', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
        
        <div style={{ 
          borderTop: '1px dashed #d9d9d9', 
          margin: '12px 0',
          paddingTop: '12px'
        }}>
          <Text strong style={{ fontSize: '12px' }}>
            ¡Gracias por preferirnos!
          </Text>
          <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
            Sistema de fidelización por VEHÍCULO - Cada 10 lavadas = 1 GRATIS
          </div>
        </div>
        
        {/* ✅ NUEVO: INFORMACIÓN DEL SISTEMA DE COMISIONES */}
        <div style={{ 
          marginTop: '12px',
          padding: '6px',
          background: '#fff7e6',
          borderRadius: '4px',
          border: '1px solid #ffd591'
        }}>
          <Text type="secondary" style={{ fontSize: '10px', display: 'block' }}>
            💰 Sistema de comisiones activo: Lavador recibe 40% del total
          </Text>
          <Text type="secondary" style={{ fontSize: '9px', display: 'block' }}>
            Lavador: {lavadorNombre} → {formatCurrency(comisionLavador)}
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default TicketPreview;