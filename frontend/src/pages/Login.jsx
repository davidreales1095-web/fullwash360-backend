import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!codigo || !password) {
      setErrorMessage('Por favor ingresa código y contraseña');
      return;
    }

    setLoading(true);
    
    try {
      const result = await login(codigo.trim().toUpperCase(), password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrorMessage(result.message || 'Credenciales incorrectas');
      }
      
    } catch (error) {
      // Manejo de errores simplificado
      if (error.error) {
        setErrorMessage(error.error);
      } else if (error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Error de conexión con el servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: '#e0f2fe',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '15px'
          }}>
            <span style={{ fontSize: '24px' }}>🚗</span>
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#0c4a6e',
            marginBottom: '5px'
          }}>
            FullWash 360
          </h1>
          <p style={{ color: '#64748b' }}>
            Sistema de Gestión
          </p>
        </div>

        {errorMessage && (
          <div style={{
            background: '#fee2e2',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            border: '1px solid #fecaca',
            textAlign: 'center'
          }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
              Código de Usuario
            </label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                background: loading ? '#f3f4f6' : 'white'
              }}
              placeholder="Ingresa tu código"
              required
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                background: loading ? '#f3f4f6' : 'white'
              }}
              placeholder="••••••••"
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            style={{
              background: loading ? '#93c5fd' : '#0ea5e9',
              color: 'white',
              padding: '14px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '10px',
              opacity: loading ? 0.8 : 1,
              transition: 'all 0.3s ease'
            }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid white', 
                  borderTopColor: 'transparent', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite' 
                }}></div>
                Iniciando sesión...
              </span>
            ) : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Información del sistema */}
        <div style={{ 
          marginTop: '30px', 
          paddingTop: '20px', 
          borderTop: '1px solid #e5e7eb', 
          textAlign: 'center' 
        }}>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Sistema de gestión para lavadero de vehículos
          </p>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '5px' }}>
            © {new Date().getFullYear()} FullWash 360
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        input:focus {
          outline: none;
          border-color: #0ea5e9;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
        }
      `}</style>
    </div>
  );
};

export default Login;