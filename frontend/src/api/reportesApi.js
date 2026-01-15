// src/api/reportesApi.js
import axios from "axios";

// URL fija para desarrollo - NO usar process.env sin configuración previa
const BASE_URL = "https://fullwash360-backend.onrender.com";

const api = axios.create({
  baseURL: `${BASE_URL}/api/orders`, // apunta a /api/orders
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  }
});

const reportesApi = {
  // =================== Órdenes activas ===================
  obtenerOrdenesActivas: async () => {
    try {
      const response = await api.get("/activas");
      return response.data;
    } catch (err) {
      console.error("Error en obtenerOrdenesActivas:", err);
      // Datos mock para desarrollo
      return [];
    }
  },

  // =================== Cobrar orden ===================
  cobrarOrden: async (ordenId, body) => {
    try {
      const response = await api.put(`/${ordenId}/cobrar`, body);
      return response.data;
    } catch (err) {
      console.error("Error en cobrarOrden:", err);
      throw err;
    }
  },

  // =================== Crear orden ===================
  crearOrden: async (body) => {
    try {
      const response = await api.post("/", body);
      return response.data;
    } catch (err) {
      console.error("Error en crearOrden:", err);
      throw err;
    }
  },

  // =================== Otros reportes ===================
  obtenerReporteDiario: async (fecha) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/reportes/diario`, { 
        params: fecha ? { fecha } : {} 
      });
      return response.data;
    } catch (err) {
      console.error("Error en obtenerReporteDiario:", err);
      // Datos mock
      return {
        fecha: fecha || new Date().toISOString().split('T')[0],
        totalVentas: 0,
        totalComisiones: 0,
        neto: 0,
        lavadasTotales: 0,
        ordenesCompletadas: 0
      };
    }
  },

  obtenerLavadores: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/reportes/comisiones/lavadores`);
      return response.data;
    } catch (err) {
      console.error("Error en obtenerLavadores:", err);
      // Datos mock para desarrollo
      return [
        { _id: '1', nombre: 'Juan Pérez', comisiones: 1250, lavadas: 25 },
        { _id: '2', nombre: 'María Gómez', comisiones: 980, lavadas: 20 },
        { _id: '3', nombre: 'Carlos López', comisiones: 750, lavadas: 15 }
      ];
    }
  },

  obtenerComisiones: async (inicio, fin, lavador) => {
    try {
      const params = { inicio, fin, lavador };
      const response = await axios.get(`${BASE_URL}/api/reportes/comisiones`, { params });
      return response.data;
    } catch (err) {
      console.error("Error en obtenerComisiones:", err);
      // Datos mock
      return [];
    }
  },

  // Nueva función para testear conexión
  testConexion: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/orders/test`);
      return response.data;
    } catch (err) {
      console.error("Error en testConexion:", err);
      return { message: "No se pudo conectar al servidor" };
    }
  }
};

export default reportesApi;