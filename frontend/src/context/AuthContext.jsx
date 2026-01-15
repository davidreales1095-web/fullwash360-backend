import { createContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para normalizar usuario (rol → role)
  const normalizeUser = (userData) => {
    if (!userData) return null;
    const normalized = { ...userData };
    if (normalized.rol && !normalized.role) normalized.role = normalized.rol;
    return normalized;
  };

  // Verificar autenticación al cargar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(normalizeUser(JSON.parse(storedUser)));
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (codigo, password) => {
    try {
      console.log('🔐 AuthContext.login - Iniciando login...');
      const apiUser = await authApi.login(codigo, password);

      if (!apiUser) {
        return { success: false, message: 'Usuario no encontrado' };
      }

      const normalizedUser = normalizeUser(apiUser);

      // Guardar solo usuario
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      setUser(normalizedUser);

      return { success: true, user: normalizedUser };
    } catch (error) {
      console.error('❌ AuthContext.login error:', error);
      return { success: false, message: error.error || error.message || 'Error de autenticación' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authApi.register(userData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, message: error.message || 'Error de registro' };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (userData) => {
    const updatedUser = normalizeUser({ ...user, ...userData });
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
