import api from './axiosConfig';

export const authApi = {
  login: async (codigo, password) => {
    try {
      console.log('🔐 authApi.login - Enviando petición...');

      const res = await api.post('/auth/login', { codigo, password });
      const response = res.data; // ⚠️ importante: axios devuelve {data, status...}, no directamente data

      console.log('📥 authApi.login - Respuesta:', response);

      if (!response.success) {
        throw { error: response.error || 'Error en el login' };
      }

      // ✅ Retornamos solo el usuario, no token
      return response.usuario || response.user || response.data;

    } catch (error) {
      console.error('❌ authApi.login error:', error);
      throw { error: error.response?.data?.error || error.message || 'Error de conexión' };
    }
  },

  getProfile: () => api.get('/auth/profile'),
  logout: () => api.post('/auth/logout'),
  register: (userData) => api.post('/auth/register', userData)
};
