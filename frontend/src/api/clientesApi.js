// src/api/clienteApi.js - VERSIÓN SIMPLIFICADA SIN INTERCEPTORES COMPLEJOS
import axios from 'axios';

const API_URL = 'https://fullwash360-backend.onrender.com/api/clientes';

// Configuración SIMPLE de axios
const clienteApi = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 segundos timeout
});

// ✅ INTERCEPTOR SIMPLE para respuestas
clienteApi.interceptors.response.use(
  (response) => response.data, // Extraer solo data
  (error) => {
    console.error('❌ Error de API:', error.response?.data || error.message);
    
    // Para 404 (cliente no encontrado), retornar objeto amigable
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
    
    // Para otros errores
    return Promise.reject(
      error.response?.data || { 
        success: false, 
        msg: 'Error de conexión con el servidor' 
      }
    );
  }
);

// Funciones de API SIMPLES Y DIRECTAS
export const clientesApi = {
  // ✅ BUSCAR CLIENTE POR PLACA (CORREGIDA)
  buscarPorPlaca: async (placa, punto_id = '000000000000000000000002') => {
    try {
      console.log(`🔍 Buscando cliente: ${placa}, punto: ${punto_id}`);
      
      // ✅ CORRECCIÓN: Usar la ruta correcta `/buscar/:placa`
      // ✅ Enviar punto_id como query parameter
      const response = await clienteApi.get(`/buscar/${placa}`, {
        params: { punto_id }
      });
      
      return response;
    } catch (error) {
      console.error('❌ Error en buscarPorPlaca:', error);
      // Si es un objeto amigable (404), retornarlo directamente
      if (error.encontrado !== undefined) {
        return error;
      }
      // Si no, retornar objeto de error
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

  // ✅ CREAR CLIENTE
  crearCliente: async (clienteData) => {
    try {
      console.log('📝 Creando cliente:', clienteData);
      const response = await clienteApi.post('/', clienteData);
      return response;
    } catch (error) {
      console.error('❌ Error creando cliente:', error);
      throw error;
    }
  },

  // ✅ OBTENER TODOS LOS CLIENTES
  obtenerClientes: async (punto_id = '000000000000000000000002') => {
    try {
      const response = await clienteApi.get('/', {
        params: { punto_id }
      });
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo clientes:', error);
      throw error;
    }
  },

  // ✅ BUSCAR CLIENTES POR TÉRMINO
  buscarClientes: async (termino, punto_id = '000000000000000000000002') => {
    try {
      const response = await clienteApi.get(`/buscar`, {
        params: { q: termino, punto_id }
      });
      return response;
    } catch (error) {
      console.error('❌ Error buscando clientes:', error);
      throw error;
    }
  }
};

export default clientesApi;