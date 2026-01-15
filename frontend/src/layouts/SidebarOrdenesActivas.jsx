import React, { useState, useEffect } from 'react';
import { List, Avatar, Button, Tag, Spin, message, Badge, Typography } from 'antd';
import { 
  CarOutlined, 
  DollarOutlined, 
  ClockCircleOutlined, 
  ReloadOutlined,
  PlusCircleOutlined,  // ✅ AGREGADO
  HistoryOutlined      // ✅ AGREGADO
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ordenesApi from '../api/ordenesApi';  // ✅ CORREGIDO
import { formatCurrency } from '../utils/formatCurrency';  // ✅ CORREGIDO

const { Text } = Typography;

const SidebarOrdenesActivas = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estado, setEstado] = useState('pendiente');
  const navigate = useNavigate();

  const cargarOrdenesActivas = async () => {
    try {
      setLoading(true);
      
      // DEBUG: Verificar token
      const token = localStorage.getItem('token');
      console.log('🔄 [Sidebar] Token en localStorage:', token ? 'PRESENTE' : 'AUSENTE');
      
      const response = await ordenesApi.obtenerOrdenesActivas();
      
      console.log('📦 [Sidebar] Respuesta API:', response);
      
      if (response.success) {
        let ordenesFiltradas = response.ordenes || [];
        if (estado !== 'todos') {
          ordenesFiltradas = ordenesFiltradas.filter(orden => orden.estado === estado);
        }
        
        setOrdenes(ordenesFiltradas);
        console.log(`✅ [Sidebar] ${ordenesFiltradas.length} órdenes cargadas`);
      } else {
        message.error(response.error || 'Error al cargar órdenes activas');
      }
    } catch (error) {
      console.error('❌ [Sidebar] Error cargando órdenes:', error);
      message.error('Error de conexión con el servidor');
      
      // Si hay error 401 (no autorizado), redirigir al login
      if (error.status === 401) {
        message.error('Sesión expirada. Por favor inicie sesión nuevamente.');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarOrdenesActivas();
    const interval = setInterval(cargarOrdenesActivas, 30000);
    return () => clearInterval(interval);
  }, [estado]);

  const handleCobrar = (ordenId) => {
    console.log('🎯 [Sidebar] Cobrando orden:', ordenId);
    navigate(`/ordenes/${ordenId}/cobrar`);
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente': return 'orange';
      case 'en_proceso': return 'blue';
      case 'completado': return 'green';
      case 'cancelado': return 'red';
      default: return 'default';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'en_proceso': return 'En Proceso';
      case 'completado': return 'Completado';
      case 'cancelado': return 'Cancelado';
      default: return estado;
    }
  };

  if (loading && ordenes.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Spin size="small" />
        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
          Cargando órdenes...
        </Text>
      </div>
    );
  }

  return (
    <div className="sidebar-ordenes-activas">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '10px',
        padding: '0 5px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Badge 
            count={ordenes.length} 
            size="small" 
            style={{ 
              backgroundColor: ordenes.length > 0 ? '#52c41a' : '#faad14',
              marginRight: 8
            }} 
          />
          <Text strong style={{ color: 'white', fontSize: '14px' }}>
            Órdenes Activas
          </Text>
        </div>
        
        <Button 
          size="small" 
          type="text" 
          icon={<ReloadOutlined />}
          onClick={cargarOrdenesActivas}
          loading={loading}
          style={{ color: 'white' }}
        />
      </div>

      <div style={{ marginBottom: 10, display: 'flex', gap: 4 }}>
        {['pendiente', 'en_proceso'].map((estadoItem) => (
          <Button
            key={estadoItem}
            size="small"
            type={estado === estadoItem ? 'primary' : 'default'}
            onClick={() => setEstado(estadoItem)}
            style={{
              flex: 1,
              fontSize: '10px',
              padding: '2px 4px',
              height: '24px'
            }}
          >
            {estadoItem === 'pendiente' ? 'Pendientes' : 'En Proceso'}
          </Button>
        ))}
      </div>

      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        maxHeight: '200px'
      }}>
        <List
          size="small"
          dataSource={ordenes.slice(0, 5)}
          locale={{ 
            emptyText: (
              <div style={{ textAlign: 'center', padding: '20px', color: '#aaa' }}>
                <ClockCircleOutlined style={{ fontSize: '24px', marginBottom: 8 }} />
                <div>No hay órdenes {estado === 'pendiente' ? 'pendientes' : 'en proceso'}</div>
              </div>
            ) 
          }}
          renderItem={(orden) => (
            <List.Item
              style={{ 
                padding: '8px 5px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                cursor: 'pointer'
              }}
              onClick={() => handleCobrar(orden.id)}
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    size="small"
                    style={{
                      backgroundColor: orden.tipo_vehiculo === 'carro' ? '#1890ff' : 
                                      orden.tipo_vehiculo === 'moto' ? '#52c41a' : 
                                      orden.tipo_vehiculo === 'taxi' ? '#fa8c16' : '#722ed1'
                    }}
                    icon={<CarOutlined />}
                  />
                }
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong style={{ fontSize: '12px', color: 'white' }}>
                      {orden.numero_orden?.split('-').pop() || 'N/A'}
                    </Text>
                    <Tag 
                      color={getEstadoColor(orden.estado)} 
                      size="small"
                      style={{ margin: 0, fontSize: '9px', padding: '0 4px' }}
                    >
                      {getEstadoTexto(orden.estado)}
                    </Tag>
                  </div>
                }
                description={
                  <div>
                    <div style={{ fontSize: '11px', color: '#aaa' }}>
                      <strong style={{ color: 'white' }}>{orden.placa}</strong>
                      <span style={{ marginLeft: 4 }}>• {orden.tipo_lavado}</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#52c41a', marginTop: 2 }}>
                      {orden.es_decima_gratis ? '🎉 GRATIS' : formatCurrency(orden.precio || 0)}
                    </div>
                    <div style={{ fontSize: '9px', color: '#666', marginTop: 2 }}>
                      {orden.lavador || 'Sin lavador'}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
        
        {ordenes.length > 5 && (
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <Button 
              type="link" 
              size="small"
              onClick={() => navigate('/ordenes/activas')}
              style={{ color: '#1890ff', fontSize: '11px' }}
            >
              Ver todas ({ordenes.length})
            </Button>
          </div>
        )}
      </div>

      <div style={{ 
        marginTop: '10px', 
        paddingTop: '10px', 
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        gap: 4
      }}>
        <Button 
          size="small" 
          block
          type="primary"
          onClick={() => navigate('/ordenes/nueva')}
          style={{ fontSize: '11px', height: '28px' }}
        >
          <PlusCircleOutlined /> Nueva
        </Button>
        <Button 
          size="small" 
          block
          onClick={() => navigate('/ordenes/historial')}
          style={{ fontSize: '11px', height: '28px' }}
        >
          <HistoryOutlined /> Historial
        </Button>
      </div>
    </div>
  );
};

export default SidebarOrdenesActivas;