import React, { useState } from 'react';
import { clientesApi } from '../api/clientesApi';

const ModalCliente = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre_completo: '',
    telefono: '',
    placa: '',
    tipo_vehiculo: 'carro_particular', // NUEVO: valor por defecto
    total_lavados: '0',
    tipo_lavado_preferido: 'basico'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Tipos de lavado
  const tiposLavado = [
    { value: 'basico', label: 'Básico' },
    { value: 'completo', label: 'Completo' },
    { value: 'premium', label: 'Premium' },
    { value: 'detallado', label: 'Detallado' }
  ];

  // NUEVO: Tipos de vehículo
  const tiposVehiculo = [
    { value: 'carro_particular', label: 'Carro Particular', icon: '🚗' },
    { value: 'moto', label: 'Moto', icon: '🏍️' },
    { value: 'taxi', label: 'Taxi', icon: '🚖' },
    { value: 'otro', label: 'Otro', icon: '🚚' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validaciones básicas
    if (!formData.nombre_completo.trim()) {
      setError('El nombre es obligatorio');
      setLoading(false);
      return;
    }

    if (!formData.telefono.trim()) {
      setError('El teléfono es obligatorio');
      setLoading(false);
      return;
    }

    try {
      // Convertir lavados a número
      const lavados = parseInt(formData.total_lavados) || 0;
      const clienteData = {
        ...formData,
        total_lavados: lavados
      };

      const response = await clientesApi.crearCliente(clienteData);
      
      if (response.success) {
        setSuccess('✅ Cliente registrado exitosamente!');
        
        // Calcular información de lavados gratis
        const lavadosGratis = Math.floor(lavados / 10);
        const lavadosRestantes = 10 - (lavados % 10);
        const proximoGratisEn = lavadosRestantes === 10 ? 0 : lavadosRestantes;
        
        // Obtener nombre del tipo de vehículo
        const vehiculoSeleccionado = tiposVehiculo.find(v => v.value === formData.tipo_vehiculo);
        const nombreVehiculo = vehiculoSeleccionado ? vehiculoSeleccionado.label : 'Vehículo';
        
        // Mostrar resumen
        setTimeout(() => {
          alert(
            `✅ CLIENTE REGISTRADO\n\n` +
            `👤 Nombre: ${formData.nombre_completo}\n` +
            `📞 Teléfono: ${formData.telefono}\n` +
            `🚗 ${nombreVehiculo}: ${formData.placa || 'No registrada'}\n` +
            `🧼 Lavados registrados: ${lavados}\n` +
            `🎁 Lavados gratis obtenidos: ${lavadosGratis}\n` +
            `⏳ Próximo gratis en: ${proximoGratisEn} lavados`
          );
        }, 300);
        
        // Limpiar formulario
        setFormData({
          nombre_completo: '',
          telefono: '',
          placa: '',
          tipo_vehiculo: 'carro_particular',
          total_lavados: '0',
          tipo_lavado_preferido: 'basico'
        });
        
        // Notificar éxito al componente padre
        if (onSuccess) {
          onSuccess(response.cliente);
        }
        
        // Cerrar modal después de éxito
        setTimeout(() => {
          onClose();
        }, 1500);
      }
      
    } catch (err) {
      setError(err.msg || 'Error al registrar cliente');
    } finally {
      setLoading(false);
    }
  };

  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;

  // Calcular progreso para lavados gratis
  const lavados = parseInt(formData.total_lavados) || 0;
  const lavadosGratis = Math.floor(lavados / 10);
  const lavadosRestantes = 10 - (lavados % 10);
  const progreso = (lavados % 10) * 10;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header del modal */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#111827',
            margin: 0
          }}>
            👤 Registrar Nuevo Cliente
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '0',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Contenido del modal */}
        <div style={{ padding: '20px' }}>
          {/* Mensajes de estado */}
          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fee',
              color: '#c00',
              borderRadius: '6px',
              marginBottom: '16px',
              border: '1px solid #fcc'
            }}>
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div style={{
              padding: '12px',
              backgroundColor: '#dfd',
              color: '#080',
              borderRadius: '6px',
              marginBottom: '16px',
              border: '1px solid #afa'
            }}>
              ✅ {success}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            {/* Nombre */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Nombre Completo *
              </label>
              <input
                type="text"
                name="nombre_completo"
                value={formData.nombre_completo}
                onChange={handleChange}
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="Ej: Juan Pérez García"
              />
            </div>

            {/* Teléfono */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Teléfono *
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="Ej: 3001234567"
              />
            </div>

            {/* Placa */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Placa del Vehículo
              </label>
              <input
                type="text"
                name="placa"
                value={formData.placa}
                onChange={handleChange}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  textTransform: 'uppercase'
                }}
                placeholder="Ej: ABC123"
              />
            </div>

            {/* NUEVO: Tipo de Vehículo */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '10px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Tipo de Vehículo *
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px'
              }}>
                {tiposVehiculo.map((tipo) => {
                  const isSelected = formData.tipo_vehiculo === tipo.value;
                  return (
                    <button
                      key={tipo.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, tipo_vehiculo: tipo.value }))}
                      disabled={loading}
                      style={{
                        padding: '15px 10px',
                        border: isSelected ? '2px solid #0ea5e9' : '1px solid #d1d5db',
                        backgroundColor: isSelected ? '#f0f9ff' : 'white',
                        borderRadius: '8px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                        opacity: loading ? 0.6 : 1
                      }}
                    >
                      <span style={{ fontSize: '28px' }}>{tipo.icon}</span>
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: '600',
                        color: isSelected ? '#0ea5e9' : '#374151'
                      }}>
                        {tipo.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lavados actuales */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Lavados Actuales
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="number"
                  name="total_lavados"
                  value={formData.total_lavados}
                  onChange={handleChange}
                  min="0"
                  max="999"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="0"
                />
                <div style={{
                  padding: '8px 12px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {lavados} lavados
                </div>
              </div>
              
              {/* Barra de progreso para lavados gratis */}
              {lavados > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>
                    <span>Progreso para lavado gratis</span>
                    <span>{lavados % 10}/10</span>
                  </div>
                  <div style={{
                    height: '8px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${progreso}%`,
                      height: '100%',
                      backgroundColor: lavados % 10 === 0 ? '#10b981' : '#0ea5e9',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginTop: '4px',
                    textAlign: 'center'
                  }}>
                    {lavadosGratis > 0 && `✅ ${lavadosGratis} lavado(s) gratis obtenido(s) | `}
                    {lavados % 10 === 0 ? 
                      '🎁 ¡Próximo lavado es GRATIS!' : 
                      `⏳ Faltan ${lavadosRestantes} lavados para el próximo gratis`
                    }
                  </div>
                </div>
              )}
            </div>

            {/* Tipo de lavado preferido */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Tipo de Lavado Preferido
              </label>
              <select
                name="tipo_lavado_preferido"
                value={formData.tipo_lavado_preferido}
                onChange={handleChange}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                {tiposLavado.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Botones */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '24px'
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
                disabled={loading}
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: loading ? '#9ca3af' : '#0ea5e9',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Registrando...' : 'Registrar Cliente'}
              </button>
            </div>
          </form>

          {/* Información del sistema de lavados gratis */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: '#f0f9ff',
            borderRadius: '8px',
            border: '1px solid #bae6fd'
          }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#0369a1',
              marginBottom: '8px'
            }}>
              ℹ️ Sistema de Lavados Gratis (10ma GRATIS)
            </h4>
            <ul style={{
              margin: 0,
              paddingLeft: '20px',
              fontSize: '12px',
              color: '#0c4a6e',
              lineHeight: '1.5'
            }}>
              <li><strong>Cada 10 lavados</strong>, el cliente recibe 1 GRATIS</li>
              <li>Ejemplo: 9 lavados → 1 gratis pendiente</li>
              <li>Ejemplo: 19 lavados → 1 gratis obtenido + 9 hacia el próximo</li>
              <li>Puedes registrar lavados previos del cliente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalCliente;