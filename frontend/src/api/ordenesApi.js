import axios from 'axios';
import lavadoresApi from './lavadoresApi';
import dayjs from 'dayjs';

const API_URL = 'http://localhost:5000/api';

const ordenesApi = {
  // ✅ CREAR NUEVA ORDEN - CORREGIDO
  crearOrden: async (ordenData) => {
    try {
      console.log("📤 Enviando orden al backend:", ordenData);
      const response = await axios.post(`${API_URL}/orders`, ordenData);
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
      const response = await axios.get(`${API_URL}/orders/activas`);
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
      const response = await axios.put(`${API_URL}/orders/${ordenId}/cobrar`, cobroData);
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
      const response = await axios.get(`${API_URL}/orders/debug/todas`);
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

  // ✅ OBTENER LAVADORES
  obtenerLavadores: async () => {
    try {
      return await lavadoresApi.obtenerLavadores();
    } catch (error) {
      console.error('❌ Error obteniendo lavadores:', error.response?.data || error.message);
      throw { 
        success: false, 
        message: 'Error obteniendo lavadores',
        lavadores: [] 
      };
    }
  },

  // ✅ TEST DE CONEXIÓN
  testConexion: async () => {
    try {
      const response = await axios.get(`${API_URL}/orders/test`);
      return response.data;
    } catch (error) {
      console.error('❌ Error en test de conexión:', error);
      return { 
        success: false, 
        message: 'Error de conexión con el servidor' 
      };
    }
  },

  // ✅ OBTENER HISTORIAL POR FECHA - CORREGIDO
  obtenerHistorialPorFecha: async (fechaParam = '') => {
    try {
      console.log(`📅 Solicitando historial para: ${fechaParam || 'hoy'}`);
      
      let url = `${API_URL}/orders/historial`;
      if (fechaParam) {
        url += `?fecha=${fechaParam}`;
      }
      
      const response = await axios.get(url);
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
      
      const url = `${API_URL}/orders/historial/filtrado?${params.toString()}`;
      const response = await axios.get(url);
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

  // ===========================
  // ✅ NUEVO: OBTENER ESTADÍSTICAS PARA DASHBOARD
  // ===========================
  
  // 📊 OBTENER ESTADÍSTICAS EN TIEMPO REAL
  obtenerEstadisticas: async (punto_id = null) => {
    try {
      console.log('📊 [API] Solicitando estadísticas reales...');
      
      const params = {};
      if (punto_id) {
        params.punto_id = punto_id;
      }
      
      const response = await axios.get(`${API_URL}/orders/estadisticas`, { params });
      
      console.log('✅ [API] Estadísticas recibidas:', response.data);
      
      // ✅ Validar estructura de respuesta
      if (response.data && response.data.success && response.data.data && response.data.data.stats) {
        return response.data;
      } else {
        throw new Error('Estructura de respuesta inesperada');
      }
      
    } catch (error) {
      console.error('❌ [API] Error obteniendo estadísticas:', error.response?.data || error.message);
      
      // ✅ En caso de error, devolver datos de ejemplo estructurados igual que el backend
      const datosEjemplo = {
        success: true,
        data: {
          stats: {
            generales: {
              ordenes_hoy: 12,
              total_ordenes: 45,
              ordenes_completadas_hoy: 10,
              tasa_exito: 83
            },
            hoy: {
              ingresos_totales: 450000,
              comisiones_totales: 180000,
              ganancia_neta: 270000,
              lavadores_activos: 3,
              clientes_activos: 8,
              promedio_por_orden: 37500
            },
            tendencias: {
              ingresos_semana: 2850000,
              diferencia_semana: 15
            },
            destacados: {
              top_lavadores: [
                { _id: 'lav001', nombre: 'Juan Pérez', total_comisiones: 75000, ordenes_count: 5 },
                { _id: 'lav002', nombre: 'María López', total_comisiones: 60000, ordenes_count: 4 },
                { _id: 'lav003', nombre: 'Carlos Ruiz', total_comisiones: 45000, ordenes_count: 3 }
              ],
              tipo_vehiculo_popular: { _id: 'carro', count: 8 },
              orden_mas_cara: {
                numero_orden: 'ORD-00123',
                placa: 'ABC123',
                total: 65000,
                cliente_nombre: 'Empresa XYZ'
              }
            },
            timestamp: new Date().toISOString(),
            ultima_actualizacion: 'Modo demostración'
          }
        },
        modo_demo: true,
        mensaje: 'Datos de ejemplo (servidor no disponible)'
      };
      
      return datosEjemplo;
    }
  },

  // 📈 OBTENER ESTADÍSTICAS DETALLADAS (PARA GRÁFICOS)
  obtenerEstadisticasDetalladas: async (dias = 7, punto_id = null) => {
    try {
      console.log(`📈 [API] Solicitando estadísticas detalladas (${dias} días)...`);
      
      const params = { dias };
      if (punto_id) {
        params.punto_id = punto_id;
      }
      
      const response = await axios.get(`${API_URL}/orders/estadisticas/detalladas`, { params });
      return response.data;
      
    } catch (error) {
      console.error('❌ [API] Error obteniendo estadísticas detalladas:', error.response?.data || error.message);
      
      // ✅ Datos de ejemplo para gráficos
      const datosEjemplo = {
        success: true,
        data: {
          ingresos_por_dia: [
            { _id: '2024-01-10', ingresos: 420000, ordenes: 11, comisiones: 168000 },
            { _id: '2024-01-11', ingresos: 380000, ordenes: 10, comisiones: 152000 },
            { _id: '2024-01-12', ingresos: 450000, ordenes: 12, comisiones: 180000 },
            { _id: '2024-01-13', ingresos: 520000, ordenes: 14, comisiones: 208000 },
            { _id: '2024-01-14', ingresos: 480000, ordenes: 13, comisiones: 192000 },
            { _id: '2024-01-15', ingresos: 390000, ordenes: 10, comisiones: 156000 },
            { _id: '2024-01-16', ingresos: 460000, ordenes: 12, comisiones: 184000 }
          ],
          distribucion_vehiculos: [
            { _id: 'carro', count: 32, ingresos: 1280000 },
            { _id: 'moto', count: 15, ingresos: 450000 },
            { _id: 'camioneta', count: 8, ingresos: 400000 },
            { _id: 'taxi', count: 5, ingresos: 150000 }
          ],
          distribucion_lavados: [
            { _id: 'express', count: 45, ingresos: 1350000 },
            { _id: 'elite', count: 10, ingresos: 600000 },
            { _id: 'premium', count: 5, ingresos: 350000 }
          ],
          horas_pico: [
            { _id: 10, count: 18 },
            { _id: 14, count: 22 },
            { _id: 16, count: 20 }
          ],
          periodo_dias: dias
        },
        modo_demo: true
      };
      
      return datosEjemplo;
    }
  },

  // 💰 OBTENER ESTADÍSTICAS DE COMISIONES POR LAVADOR
  obtenerComisionesLavador: async (lavador_id) => {
    try {
      console.log(`💰 [API] Solicitando comisiones para lavador: ${lavador_id}`);
      
      const response = await axios.get(`${API_URL}/orders/comisiones/${lavador_id}`);
      return response.data;
      
    } catch (error) {
      console.error('❌ [API] Error obteniendo comisiones:', error.response?.data || error.message);
      
      const datosEjemplo = {
        success: true,
        lavador: {
          _id: lavador_id,
          nombre: 'Lavador Ejemplo',
          codigo: 'LAV001',
          saldo_comisiones: 125000,
          porcentaje_comision: 40
        },
        estadisticas: {
          totalOrdenes: 25,
          totalVentas: 625000,
          totalComisiones: 250000,
          promedioComisionPorOrden: 10000,
          comisionesPorMes: [
            { mes: '2024-01', monto: 125000 },
            { mes: '2023-12', monto: 105000 }
          ]
        },
        ultimasOrdenes: [
          { numero_orden: 'ORD-00123', total: 25000, fecha_cobro: '2024-01-16T14:30:00Z' },
          { numero_orden: 'ORD-00122', total: 30000, fecha_cobro: '2024-01-16T11:15:00Z' }
        ],
        modo_demo: true
      };
      
      return datosEjemplo;
    }
  }
};

export default ordenesApi;