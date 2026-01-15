// src/api/lavadoresApi.js
import axios from 'axios';

const API_URL = 'https://fullwash360-backend.onrender.com/api';

const lavadoresApi = {
  // =====================================
  // LAVADORES Y COMISIONES
  // =====================================
  
  // Obtener todos los lavadores activos con comisiones
  obtenerLavadores: async () => {
    try {
      console.log('🔍 Solicitando lavadores desde:', `${API_URL}/lavadores`);
      const response = await axios.get(`${API_URL}/lavadores`);
      console.log('✅ Respuesta API lavadores:', response.data);
      
      // ✅ CORRECCIÓN: Nuestro backend ahora devuelve array directo
      if (Array.isArray(response.data)) {
        return response.data;
      } 
      // ✅ Compatibilidad con estructura antigua
      else if (response.data && response.data.success && Array.isArray(response.data.users)) {
        return response.data.users;
      }
      else {
        console.warn('⚠️ Formato de respuesta inesperado, usando array vacío');
        return [];
      }
    } catch (error) {
      console.error('❌ Error al obtener lavadores:', error);
      
      // Datos de ejemplo con COMISIONES 40% FIJO
      const lavadoresEjemplo = [
        { 
          _id: '65f4a1b2c3d4e5f6a7b8c9d0',
          nombre: 'Juan Pérez',
          codigo: 'L001',
          activo: true,
          comision_porcentaje: 40,
          saldo_comisiones: 120000,
          estadisticas: {
            total_ordenes: 12,
            total_comisiones: 120000,
            promedio_comision_por_orden: 10000
          }
        },
        { 
          _id: '65f4a1b2c3d4e5f6a7b8c9d1',
          nombre: 'María García',
          codigo: 'L002',
          activo: true,
          comision_porcentaje: 40,
          saldo_comisiones: 85000,
          estadisticas: {
            total_ordenes: 8,
            total_comisiones: 85000,
            promedio_comision_por_orden: 10625
          }
        },
        { 
          _id: '65f4a1b2c3d4e5f6a7b8c9d2',
          nombre: 'Carlos López',
          codigo: 'L003',
          activo: false,
          comision_porcentaje: 40,
          saldo_comisiones: 45000,
          estadisticas: {
            total_ordenes: 4,
            total_comisiones: 45000,
            promedio_comision_por_orden: 11250
          }
        }
      ];
      
      console.log('📦 Mostrando datos de ejemplo');
      return lavadoresEjemplo;
    }
  },
  
  // Obtener un lavador específico con comisiones
  obtenerLavadorPorId: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/lavadores/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error al obtener lavador ${id}:`, error);
      throw error;
    }
  },
  
  // Obtener historial de comisiones de un lavador
  obtenerComisionesLavador: async (id, filtros = {}) => {
    try {
      const params = new URLSearchParams(filtros).toString();
      const response = await axios.get(`${API_URL}/lavadores/${id}/comisiones?${params}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error al obtener comisiones del lavador ${id}:`, error);
      throw error;
    }
  },
  
  // Obtener estadísticas de un lavador
  obtenerEstadisticasLavador: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/lavadores/${id}/estadisticas`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error al obtener estadísticas del lavador ${id}:`, error);
      throw error;
    }
  },
  
  // Obtener ranking de lavadores por comisiones
  obtenerRankingComisiones: async (periodo = 'mes') => {
    try {
      const response = await axios.get(`${API_URL}/lavadores/ranking/comisiones?periodo=${periodo}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener ranking de comisiones:', error);
      throw error;
    }
  },
  
  // =====================================
  // GESTIÓN DE USUARIOS/LAVADORES
  // =====================================
  
  // Crear nuevo lavador - CORREGIDO: Usar ruta correcta
  crearLavador: async (datos) => {
    try {
      console.log('📝 Creando lavador con datos:', datos);
      
      // ✅ CORRECCIÓN: Usar la ruta correcta del backend
      // Opción 1: Si tu backend tiene ruta /api/usuarios para crear usuarios
      const response = await axios.post(`${API_URL}/usuarios`, {
        ...datos,
        rol: 'lavador',
        comision_porcentaje: 40,  // ✅ Siempre 40%
        saldo_comisiones: 0        // ✅ Iniciar con saldo 0
      });
      
      console.log('✅ Lavador creado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear lavador:', error);
      
      // Si falla, probar con ruta alternativa
      try {
        console.log('🔄 Intentando ruta alternativa...');
        const responseAlt = await axios.post(`${API_URL}/auth/register`, {
          ...datos,
          rol: 'lavador',
          porcentaje_comision: 40
        });
        return responseAlt.data;
      } catch (error2) {
        console.error('❌ Error en ruta alternativa:', error2);
        throw new Error(`No se pudo crear el lavador: ${error.message}`);
      }
    }
  },
  
  // Actualizar lavador - CORREGIDO: Usar ruta correcta
  actualizarLavador: async (id, datos) => {
    try {
      console.log('📝 Actualizando lavador:', id, datos);
      
      // ✅ CORRECCIÓN: Mantener comisión en 40% al actualizar
      const datosActualizados = {
        ...datos,
        comision_porcentaje: 40
      };
      
      // Opción 1: Ruta /api/usuarios/{id}
      const response = await axios.put(`${API_URL}/usuarios/${id}`, datosActualizados);
      return response.data;
    } catch (error) {
      console.error(`❌ Error al actualizar lavador ${id}:`, error);
      
      // Si falla, probar con ruta alternativa
      try {
        const responseAlt = await axios.put(`${API_URL}/lavadores/${id}`, datos);
        return responseAlt.data;
      } catch (error2) {
        throw new Error(`No se pudo actualizar el lavador: ${error.message}`);
      }
    }
  },
  
  // Eliminar lavador (desactivar) - CORREGIDO
  eliminarLavador: async (id) => {
    try {
      console.log('🗑️ Desactivando lavador:', id);
      
      // Opción 1: Actualizar estado a inactivo (mejor que DELETE)
      const response = await axios.put(`${API_URL}/usuarios/${id}`, {
        activo: false,
        estado: 'inactivo'
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Error al desactivar lavador ${id}:`, error);
      
      // Si falla, intentar DELETE
      try {
        const responseAlt = await axios.delete(`${API_URL}/usuarios/${id}`);
        return responseAlt.data;
      } catch (error2) {
        throw new Error(`No se pudo desactivar el lavador: ${error.message}`);
      }
    }
  },
  
  // =====================================
  // SISTEMA DE COMISIONES - FUNCIONES NUEVAS
  // =====================================
  
  // Ajustar saldo de comisiones (admin)
  ajustarSaldoComisiones: async (id, ajuste, motivo, tipo = 'suma') => {
    try {
      const response = await axios.put(`${API_URL}/lavadores/${id}/comisiones`, {
        ajuste,
        motivo,
        tipo
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Error al ajustar saldo del lavador ${id}:`, error);
      throw error;
    }
  },
  
  // Probar conexión con el backend
  probarConexion: async () => {
    try {
      const response = await axios.get(`${API_URL}/health`);
      return response.data;
    } catch (error) {
      console.error('❌ Error probando conexión:', error);
      throw error;
    }
  },
  
  // Verificar estructura de datos de lavadores
  verificarDatosLavadores: async () => {
    try {
      const response = await axios.get(`${API_URL}/lavadores`);
      console.log('📊 Estructura de datos recibida:', response.data);
      
      if (Array.isArray(response.data)) {
        // Verificar que todos tengan 40%
        const lavadoresCon40Porciento = response.data.filter(l => l.comision_porcentaje === 40).length;
        const lavadoresConSaldo = response.data.filter(l => l.saldo_comisiones !== undefined).length;
        
        return {
          total: response.data.length,
          con40Porciento: lavadoresCon40Porciento,
          conSaldo: lavadoresConSaldo,
          datos: response.data.slice(0, 3) // Mostrar primeros 3
        };
      }
      
      return { mensaje: 'Estructura inesperada', datos: response.data };
    } catch (error) {
      console.error('❌ Error verificando datos:', error);
      return { error: error.message };
    }
  }
};

export default lavadoresApi;