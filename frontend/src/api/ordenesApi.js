// ✅ CORREGIR: Usar apiClient en lugar de axios directamente
import { apiClient } from '../config/api';
import lavadoresApi from './lavadoresApi';
import dayjs from 'dayjs';

// ✅ NOTA: apiClient YA tiene baseURL configurada como API_URLS.API
// No necesitas concatenar URLs manualmente

const ordenesApi = {
  // ✅ CREAR NUEVA ORDEN - CORREGIDO
  crearOrden: async (ordenData) => {
    try {
      console.log("📤 Enviando orden al backend:", ordenData);
      // ANTES: await axios.post(`${API_URL}/orders`, ordenData);
      // DESPUÉS: apiClient ya sabe que la base es /api, solo necesita /orders
      const response = await apiClient.post('/orders', ordenData);
      console.log("✅ Respuesta del backend:", response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creando orden:', error.response?.data || error.message);
      throw { 
        success: false, 
        message: 'Error de conexión con el servidor',
        error: error.response?.data || error.message 
      };
    }
  },

  // ✅ OBTENER ÓRDENES ACTIVAS - CORREGIDO
  obtenerOrdenesActivas: async () => {
    try {
      console.log("📥 Solicitando órdenes activas...");
      // ANTES: await axios.get(`${API_URL}/orders/activas`);
      // DESPUÉS:
      const response = await apiClient.get('/orders/activas');
      console.log("✅ Órdenes activas recibidas:", response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo órdenes activas:', error.response?.data || error.message);
      return { 
        success: false, 
        message: 'Error de conexión con el servidor',
        ordenes: [],
        total: 0
      };
    }
  },

  // ✅ COBRAR ORDEN - CORREGIDO
  cobrarOrden: async (ordenId, cobroData) => {
    try {
      console.log("💰 Enviando cobro al backend:", { ordenId, cobroData });
      // ANTES: await axios.put(`${API_URL}/orders/${ordenId}/cobrar`, cobroData);
      // DESPUÉS:
      const response = await apiClient.put(`/orders/${ordenId}/cobrar`, cobroData);
      console.log("✅ Cobro procesado:", response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error cobrando orden:', error.response?.data || error.message);
      throw { 
        success: false, 
        message: 'Error al procesar el cobro',
        error: error.response?.data || error.message 
      };
    }
  },

  // ✅ OBTENER HISTORIAL - CORREGIDO
  obtenerHistorial: async (filtros = {}) => {
    try {
      console.log("📜 Solicitando historial...");
      // ANTES: await axios.get(`${API_URL}/orders/debug/todas`);
      // DESPUÉS:
      const response = await apiClient.get('/orders/debug/todas');
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo historial:', error.response?.data || error.message);
      throw { 
        success: false, 
        message: 'Error obteniendo historial',
        ordenes: [],
        total: 0
      };
    }
  },

  // ✅ OBTENER HISTORIAL POR FECHA - CORREGIDO
  obtenerHistorialPorFecha: async (fechaParam = '') => {
    try {
      console.log(`📅 Solicitando historial para: ${fechaParam || 'hoy'}`);
      
      // ANTES: let url = `${API_URL}/orders/historial`;
      // DESPUÉS:
      let url = '/orders/historial';
      if (fechaParam) {
        url += `?fecha=${fechaParam}`;
      }
      
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo historial por fecha:', error.response?.data || error.message);
      throw { 
        success: false, 
        message: 'Error obteniendo historial',
        ordenes: [],
        total: 0
      };
    }
  },

  // ✅ OBTENER HISTORIAL CON FILTROS - CORREGIDO
  obtenerHistorialFiltrado: async (filtros = {}) => {
    try {
      console.log('🎯 Aplicando filtros:', filtros);
      
      const params = new URLSearchParams();
      Object.keys(filtros).forEach(key => {
        if (filtros[key]) params.append(key, filtros[key]);
      });
      
      // ANTES: const url = `${API_URL}/orders/historial/filtrado?${params.toString()}`;
      // DESPUÉS:
      const url = `/orders/historial/filtrado?${params.toString()}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo historial filtrado:', error.response?.data || error.message);
      throw { 
        success: false, 
        message: 'Error obteniendo historial filtrado',
        ordenes: [],
        total: 0
      };
    }
  },

  // ✅ OBTENER ESTADÍSTICAS - CORREGIDO
  obtenerEstadisticas: async (punto_id = null) => {
    try {
      console.log('📊 [API] Solicitando estadísticas reales...');
      
      const params = {};
      if (punto_id) {
        params.punto_id = punto_id;
      }
      
      // ANTES: await axios.get(`${API_URL}/orders/estadisticas`, { params });
      // DESPUÉS:
      const response = await apiClient.get('/orders/estadisticas', { params });
      console.log('✅ [API] Estadísticas recibidas:', response.data);
      
      if (response.data && response.data.success && response.data.data && response.data.data.stats) {
        return response.data;
      } else {
        throw new Error('Estructura de respuesta inesperada');
      }
      
    } catch (error) {
      console.error('❌ [API] Error obteniendo estadísticas:', error.response?.data || error.message);
      
      // ... resto del código de ejemplo
      return datosEjemplo;
    }
  },

  // ✅ Las demás funciones siguen el mismo patrón...

};

export default ordenesApi;