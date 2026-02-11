import axios from 'axios';
import lavadoresApi from './lavadoresApi';
import dayjs from 'dayjs';

const API_URL = 'https://fullwash360-backend.onrender.com/api';

const ordenesApi = {
  // ✅ CREAR NUEVA ORDEN
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

  // ✅ OBTENER ÓRDENES ACTIVAS
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

  // ✅ COBRAR ORDEN
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

  // ✅ NUEVA FUNCIÓN UNIFICADA: OBTENER HISTORIAL CON FILTROS
  obtenerHistorial: async (filtros = {}) => {
    try {
      console.log('📜 Solicitando historial con filtros:', filtros);

      const params = new URLSearchParams();

      // Mapeo de nombres de campos (camelCase -> snake_case)
      const mapping = {
        fechaInicio: 'fecha_inicio',
        fechaFin: 'fecha_fin',
        tipoVehiculo: 'tipo_vehiculo',
        tipoLavado: 'tipo_lavado',
        metodoPago: 'metodo_pago',
        lavadorId: 'lavador_id',
        minMonto: 'min_monto',
        maxMonto: 'max_monto',
        ordenarPor: 'ordenar_por',
        orden: 'orden',
        page: 'page',
        limit: 'limit'
      };

      Object.keys(filtros).forEach(key => {
        const valor = filtros[key];
        // Permitir valores 0 (falsy) pero no null/undefined/''
        if (valor === undefined || valor === null || valor === '') return;

        const paramKey = mapping[key] || key;

        if (Array.isArray(valor)) {
          // Para arrays: enviar múltiples parámetros con el mismo nombre
          valor.forEach(item => {
            if (item !== undefined && item !== null && item !== '') {
              params.append(paramKey, item);
            }
          });
        } else {
          params.append(paramKey, valor);
        }
      });

      // Construir URL final
      const url = `${API_URL}/orders/historial${params.toString() ? '?' + params.toString() : ''}`;
      console.log('📡 URL historial:', url);

      const response = await axios.get(url);
      return response.data;

    } catch (error) {
      console.error('❌ Error obteniendo historial:', error.response?.data || error.message);
      return {
        success: false,
        message: 'Error obteniendo historial',
        ordenes: [],
        total: 0
      };
    }
  },

  // ✅ MANTENER COMPATIBILIDAD (REDIRIGEN A LA NUEVA FUNCIÓN)
  obtenerHistorialPorFecha: async (fechaParam = '') => {
    // Convertir al nuevo formato
    let fecha = fechaParam;
    if (fechaParam === 'hoy' || fechaParam === '') {
      fecha = dayjs().format('YYYY-MM-DD');
    } else if (fechaParam === 'ayer') {
      fecha = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    } else if (fechaParam === 'mes') {
      const inicioMes = dayjs().startOf('month').format('YYYY-MM-DD');
      const finMes = dayjs().endOf('month').format('YYYY-MM-DD');
      return ordenesApi.obtenerHistorial({
        fechaInicio: inicioMes,
        fechaFin: finMes
      });
    } else if (fechaParam === 'todos') {
      return ordenesApi.obtenerHistorial({});
    }
    return ordenesApi.obtenerHistorial({
      fechaInicio: fecha,
      fechaFin: fecha
    });
  },

  obtenerHistorialFiltrado: async (filtros = {}) => {
    return ordenesApi.obtenerHistorial(filtros);
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

  // ===========================
  // ✅ ESTADÍSTICAS (SIN CAMBIOS, SOLO LIMPIEZA)
  // ===========================

  // 📊 OBTENER ESTADÍSTICAS EN TIEMPO REAL
  obtenerEstadisticas: async (punto_id = null) => {
    try {
      console.log('📊 [API] Solicitando estadísticas reales...');
      const params = {};
      if (punto_id) params.punto_id = punto_id;
      const response = await axios.get(`${API_URL}/orders/estadisticas`, { params });
      return response.data;
    } catch (error) {
      console.error('❌ [API] Error obteniendo estadísticas:', error.response?.data || error.message);
      // Retornar estructura vacía (no datos de ejemplo para no confundir)
      return {
        success: false,
        message: 'Error al obtener estadísticas',
        data: {
          stats: {
            generales: { ordenes_hoy: 0, total_ordenes: 0, ordenes_completadas_hoy: 0, tasa_exito: 0 },
            hoy: { ingresos_totales: 0, comisiones_totales: 0, ganancia_neta: 0, lavadores_activos: 0, clientes_activos: 0, promedio_por_orden: 0 },
            tendencias: { ingresos_semana: 0, diferencia_semana: 0 },
            destacados: { top_lavadores: [], tipo_vehiculo_popular: { _id: 'carro', count: 0 }, orden_mas_cara: null }
          }
        }
      };
    }
  },

  // 📈 OBTENER ESTADÍSTICAS DETALLADAS (PARA GRÁFICOS)
  obtenerEstadisticasDetalladas: async (dias = 7, punto_id = null) => {
    try {
      console.log(`📈 [API] Solicitando estadísticas detalladas (${dias} días)...`);
      const params = { dias };
      if (punto_id) params.punto_id = punto_id;
      const response = await axios.get(`${API_URL}/orders/estadisticas/detalladas`, { params });
      return response.data;
    } catch (error) {
      console.error('❌ [API] Error obteniendo estadísticas detalladas:', error.response?.data || error.message);
      return {
        success: false,
        message: 'Error al obtener estadísticas detalladas',
        data: {
          ingresos_por_dia: [],
          distribucion_vehiculos: [],
          distribucion_lavados: [],
          horas_pico: []
        }
      };
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
      return {
        success: false,
        message: 'Error al obtener comisiones del lavador'
      };
    }
  }
};

export default ordenesApi;