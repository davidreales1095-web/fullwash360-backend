// src/api/clientesApi.js - VERSIÓN CORREGIDA
import { apiClient } from '../config/api';

export const clientesApi = {
  // ✅ BUSCAR CLIENTE POR PLACA - CORREGIDO
  buscarPorPlaca: async (placa, punto_id = '000000000000000000000002') => {
    try {
      console.log(`🔍 Buscando cliente: ${placa}, punto: ${punto_id}`);
      
      // ✅ CORREGIDO: Usar apiClient con ruta correcta
      const response = await apiClient.get(`/clientes/buscar/${placa}`, {
        params: { punto_id }
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error en buscarPorPlaca:', error);
      
      // ✅ Manejo de 404 (cliente no encontrado)
      if (error.response && error.response.status === 404) {
        return {
          success: true,
          encontrado: false,
          message: 'Cliente no encontrado',
          cliente: null,
          vehiculo: null,
          contador_actual: 0
        };
      }
      
      // ✅ Error genérico
      return {
        success: false,
        encontrado: false,
        message: 'Error al buscar cliente',
        cliente: null,
        vehiculo: null,
        contador_actual: 0
      };
    }
  },

  // ✅ CREAR CLIENTE - CORREGIDO
  crearCliente: async (clienteData) => {
    try {
      console.log('📝 Creando cliente:', clienteData);
      const response = await apiClient.post('/clientes', clienteData);
      return response.data;
    } catch (error) {
      console.error('❌ Error creando cliente:', error);
      throw error;
    }
  },

  // ✅ OBTENER TODOS LOS CLIENTES - CORREGIDO
  obtenerClientes: async (punto_id = '000000000000000000000002') => {
    try {
      const response = await apiClient.get('/clientes', {
        params: { punto_id }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo clientes:', error);
      throw error;
    }
  },

  // ✅ BUSCAR CLIENTES POR TÉRMINO - CORREGIDO
  buscarClientes: async (termino, punto_id = '000000000000000000000002') => {
    try {
      const response = await apiClient.get('/clientes/buscar', {
        params: { q: termino, punto_id }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error buscando clientes:', error);
      throw error;
    }
  }
};

export default clientesApi;