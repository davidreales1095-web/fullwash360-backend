// SelectorLavador.jsx - VERSIÓN CORREGIDA CON ENVÍO CORRECTO DE OBJECTID
import React, { useState, useEffect, useRef } from 'react';
import { Select, Spin, Alert, Button, Tag, Typography } from 'antd';
import { SyncOutlined, UserOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';

const { Option } = Select;
const { Text } = Typography;

const SelectorLavador = ({ value, onChange, debugMode = false }) => {
  const [lavadores, setLavadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(value || null);
  const isMounted = useRef(true);
  const isFetching = useRef(false);

  useEffect(() => {
    console.log('🎯 SelectorLavador montándose...');
    console.log('📥 Prop value recibida:', value, 'Tipo:', typeof value);
    
    // Inicializar selectedId con el valor de la prop
    setSelectedId(value || null);
    
    isMounted.current = true;
    cargarLavadores();
    
    return () => {
      console.log('🎯 SelectorLavador desmontándose...');
      isMounted.current = false;
    };
  }, [value]);

  const cargarLavadores = async () => {
    if (isFetching.current) {
      console.log('⏸️  Ya hay una petición en curso, omitiendo...');
      return;
    }
    
    isFetching.current = true;
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 INICIANDO: cargarLavadores()');
      
      const token = localStorage.getItem('token');
      console.log('🔑 Token disponible:', token ? `✅ (${token.substring(0, 20)}...)` : '❌ NO');
      
      if (!token) {
        throw new Error('No hay token de autenticación. Vuelve a iniciar sesión.');
      }
      
      console.log('🔄 Haciendo petición a /users/lavadores...');
      const data = await api.get('/users/lavadores');
      
      console.log('✅ PETICIÓN EXITOSA');
      console.log('📦 Data recibida:', data);
      
      if (isMounted.current) {
        if (data && data.success) {
          const lavadoresData = data.lavadores || [];
          console.log(`🚗 Lavadores en data: ${lavadoresData.length}`);
          
          // Asegurar que cada lavador tenga _id (ObjectId)
          const lavadoresFormateados = lavadoresData.map(lav => ({
            ...lav,
            _id: lav._id || lav.id, // Usar _id como estándar
            id: lav._id || lav.id   // Mantener compatibilidad
          }));
          
          setLavadores(lavadoresFormateados);
          
          if (lavadoresFormateados.length === 0) {
            console.log('⚠️  No hay lavadores registrados en el sistema');
          } else {
            console.log(`✅ ${lavadoresFormateados.length} lavadores cargados correctamente`);
            lavadoresFormateados.forEach((lav, i) => {
              console.log(`   ${i+1}. ${lav.codigo} - ${lav.nombre} (ID: ${lav._id})`);
            });
          }
        } else {
          console.error('❌ Data sin éxito:', data);
          throw new Error(data?.error || 'Respuesta no exitosa del servidor');
        }
      }
      
    } catch (error) {
      console.error('❌ ERROR en cargarLavadores:', error);
      
      if (isMounted.current) {
        let errorMessage = error.message;
        
        if (error.status === 401) {
          errorMessage = 'Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.';
        } else if (error.status === 404) {
          errorMessage = 'No se encontró la ruta de lavadores. Verifica la configuración del servidor.';
        } else if (error.status === 500) {
          errorMessage = 'Error interno del servidor. Contacta al administrador.';
        }
        
        setError(`Error: ${errorMessage}`);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        isFetching.current = false;
        console.log('🏁 FINALIZADO: cargarLavadores()');
      }
    }
  };

  const handleRefrescar = () => {
    console.log('🔄 Usuario solicitó refrescar lavadores');
    cargarLavadores();
  };

  // ✅ FUNCIÓN CORREGIDA: Maneja el cambio de selección
  const handleLavadorChange = (valorSeleccionado) => {
    console.log('🎯 [SelectorLavador] Valor seleccionado (raw):', valorSeleccionado);
    console.log('🎯 [SelectorLavador] Tipo del valor:', typeof valorSeleccionado);
    
    // VALIDAR EL VALOR SELECCIONADO
    let valorFinal = null;
    
    if (!valorSeleccionado || valorSeleccionado === '') {
      // Caso: "Sin lavador asignado" o selección limpiada
      console.log('👤 Seleccionado: Sin lavador asignado');
      valorFinal = null;
    } else if (typeof valorSeleccionado === 'string' && /^[0-9a-fA-F]{24}$/.test(valorSeleccionado)) {
      // Caso: ObjectId válido
      console.log('✅ ObjectId válido detectado:', valorSeleccionado);
      valorFinal = valorSeleccionado;
      
      // Encontrar el lavador seleccionado para mostrar información
      const lavadorSeleccionado = lavadores.find(l => l._id === valorSeleccionado);
      if (lavadorSeleccionado) {
        console.log(`👷 Lavador seleccionado: ${lavadorSeleccionado.nombre} (${lavadorSeleccionado.codigo})`);
      }
    } else {
      // Caso: Valor inválido
      console.error('❌ VALOR INVÁLIDO RECIBIDO:', valorSeleccionado);
      console.error('❌ El valor debe ser un ObjectId de 24 caracteres hexadecimales o null');
      valorFinal = null;
    }
    
    console.log('🎯 [SelectorLavador] Valor final a enviar:', valorFinal);
    
    // Actualizar estado interno
    setSelectedId(valorFinal);
    
    // Notificar al componente padre
    if (onChange) {
      console.log('📤 Enviando valor al componente padre...');
      onChange(valorFinal);
    } else {
      console.warn('⚠️  No hay función onChange definida en las props');
    }
  };

  // ==================== RENDERIZADO ====================

  if (loading) {
    console.log('🔄 RENDER: Estado de carga...');
    return (
      <Select
        placeholder={<span><Spin size="small" /> Cargando lavadores...</span>}
        disabled
        size="large"
        style={{ width: '100%' }}
      />
    );
  }

  if (error) {
    console.log('❌ RENDER: Mostrando error:', error);
    return (
      <div>
        <Alert
          message="Error al cargar lavadores"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 8 }}
        />
        <Button 
          icon={<SyncOutlined />} 
          onClick={handleRefrescar}
          size="small"
          type="primary"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  if (lavadores.length === 0) {
    console.log('⚠️  RENDER: Array vacío de lavadores');
    return (
      <div>
        <Alert
          message="No hay lavadores disponibles"
          description={
            <div>
              <p>El sistema no encontró lavadores registrados.</p>
              <p><strong>Solución:</strong></p>
              <ol style={{ marginLeft: '20px', fontSize: '12px' }}>
                <li>Verifica que los lavadores tengan rol "lavador"</li>
                <li>Verifica que estén activos (activo: true)</li>
                <li>Verifica que tengan el mismo punto_id que tu usuario</li>
                <li>O contacta al administrador</li>
              </ol>
            </div>
          }
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 16 }}
        />
        <Select
          placeholder="No hay lavadores disponibles"
          disabled
          size="large"
          style={{ width: '100%' }}
        />
        <div style={{ marginTop: 8, textAlign: 'center' }}>
          <Button 
            icon={<SyncOutlined />} 
            onClick={handleRefrescar}
            size="small"
            type="link"
          >
            Reintentar carga
          </Button>
        </div>
      </div>
    );
  }

  // ✅ RENDER PRINCIPAL - CON SELECTOR FUNCIONAL
  console.log('✅ RENDER: Mostrando', lavadores.length, 'lavadores');
  console.log('📊 Estado actual - selectedId:', selectedId);
  
  return (
    <div>
      <Select
        placeholder="Selecciona un lavador"
        value={selectedId} // ✅ Usamos el estado interno
        onChange={handleLavadorChange} // ✅ Usamos nuestra función corregida
        size="large"
        style={{ width: '100%' }}
        allowClear={true}
        showSearch={true}
        filterOption={(input, option) => {
          if (!option || !option.children) return false;
          return option.children.toString().toLowerCase().includes(input.toLowerCase());
        }}
        optionFilterProp="children"
      >
        {/* Opción para "Sin lavador asignado" */}
        <Option value="">
          <div style={{ color: '#999' }}>
            <Text type="secondary">Sin lavador asignado</Text>
            <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
              (Sin comisión)
            </Text>
          </div>
        </Option>
        
        {/* Opciones de lavadores */}
        {lavadores.map(lavador => {
          const lavadorId = lavador._id || lavador.id;
          const isSelected = selectedId === lavadorId;
          
          return (
            <Option key={lavadorId} value={lavadorId}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong={isSelected}>
                    {lavador.codigo} - {lavador.nombre}
                  </Text>
                  {lavador.telefono && (
                    <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                      ({lavador.telefono})
                    </Text>
                  )}
                </div>
                {isSelected && (
                  <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: '8px' }} />
                )}
              </div>
            </Option>
          );
        })}
      </Select>
      
      {/* Información adicional */}
      <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
        <Tag color="blue" icon={<UserOutlined />}>
          {lavadores.length} lavador{lavadores.length !== 1 ? 'es' : ''} disponible{lavadores.length !== 1 ? 's' : ''}
        </Tag>
        
        {selectedId && (
          <Tag color="green" style={{ marginLeft: '4px' }}>
            ✅ Comisión del 40% aplicada
          </Tag>
        )}
      </div>
      
      {/* Modo debug - Solo mostrar en desarrollo */}
      {debugMode && (
        <div style={{ 
          marginTop: '8px', 
          padding: '8px', 
          background: '#f6ffed', 
          border: '1px solid #b7eb8f',
          borderRadius: '4px',
          fontSize: '11px'
        }}>
          <Text strong>🔧 DEBUG INFO:</Text>
          <div>Selected ID: {selectedId || '(null)'}</div>
          <div>Tipo: {typeof selectedId}</div>
          <div>Lavadores cargados: {lavadores.length}</div>
          <Button 
            size="small" 
            type="link" 
            onClick={() => console.log('Lavadores:', lavadores)}
          >
            Ver datos en consola
          </Button>
        </div>
      )}
    </div>
  );
};

export default SelectorLavador;