import React, { useState } from 'react';
import '../styles/Login.css';

export default function Login({ cambiarVista, setUsuarioLogueado }) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    if (!correo.trim() || !password.trim()) {
      setError('Por favor, llena todos los campos.');
      setCargando(false);
      return;
    }

    try {
      console.log("Disparando petición de login mediante la ruta del proxy USB...");
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password })
      });

      const textoRespuesta = await res.text();
      console.log("Respuesta cruda del servidor:", textoRespuesta);

      let data;
      try {
        data = JSON.parse(textoRespuesta);
      } catch (jsonErr) {
        throw new Error(`El servidor no mandó un JSON válido. Mandó esto: ${textoRespuesta.substring(0, 50)}`);
      }

      if (!res.ok) {
        throw new Error(data.error || 'Credenciales incorrectas o error en el servidor.');
      }

      if (data && data.token && data.usuario) {
        localStorage.setItem('fastech_token', data.token);
        localStorage.setItem('fastech_user', JSON.stringify(data.usuario));

        if (setUsuarioLogueado) {
          setUsuarioLogueado(data.usuario);
        }
        
        if (data.usuario.rol === 'admin') {
          cambiarVista('dashboard');
        } else {
          cambiarVista('tienda');
        }
      } else {
        throw new Error('Estructura de datos incompleta recibida del backend.');
      }

    } catch (err) {
      console.error("Error capturado en el flujo de Login:", err);
      setError(err.message || 'Error de conexión con el servidor.');
    } finally {
      console.log("Liberando estado de carga.");
      setCargando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        
        {/* 🔄 BOTÓN AGREGADO: Regresar a inicio de forma segura */}
        <button 
          type="button" 
          className="btn-back-home" 
          onClick={() => cambiarVista('inicio')}
          disabled={cargando}
        >
          ← Volver a Inicio
        </button>

        <h2>Fastech Platform</h2>
        <p className="login-subtitle">Inicia sesión para continuar</p>

        {error && (
          <div className="login-error" style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '13px', border: '1px solid #fca5a5' }}>
            {error}
          </div>
        )}

        <form onSubmit={manejarLogin}>
          <div className="input-group">
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              placeholder="paola@fastech.com" 
              value={correo} 
              onChange={e => setCorreo(e.target.value)} 
              disabled={cargando}
            />
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              disabled={cargando}
            />
          </div>

          <button type="submit" className="btn-login" disabled={cargando}>
            {cargando ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>

        <p className="login-footer">
          ¿No tienes cuenta? <span onClick={() => cambiarVista('registro')} style={{color: '#007bff', cursor: 'pointer', fontWeight: 'bold'}}>Regístrate aquí</span>
        </p>
      </div>
    </div>
  );
}