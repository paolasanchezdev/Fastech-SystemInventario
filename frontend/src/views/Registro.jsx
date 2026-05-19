import React, { useState } from 'react';
import Swal from 'sweetalert2';

export default function Registro({ cambiarVista, setUsuarioLogueado }) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  // Estado local simple para simular el efecto :hover en el botón de regresar
  const [isHovered, setIsHovered] = useState(false);

  const manejarRegistro = async (e) => {
    e.preventDefault();

    if (!nombre.trim() || !correo.trim() || !password.trim()) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Campos Incompletos', 
        text: 'Por favor, llena todos los campos para crear tu cuenta.',
        confirmButtonColor: '#0f172a'
      });
      return;
    }

    setCargando(true);

    try {
      const resRegistro = await fetch('/api/auth/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, password })
      });

      const dataRegistro = await resRegistro.json();

      if (!resRegistro.ok) {
        throw new Error(dataRegistro.error || 'No se pudo procesar el alta en el servidor.');
      }

      console.log("🚀 Registro exitoso. Disparando petición de login automática...");
      
      const resLogin = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password })
      });

      const dataLogin = await resLogin.json();

      if (!resLogin.ok) {
        throw new Error(dataLogin.error || 'Cuenta creada, pero falló el inicio de sesión automático.');
      }

      if (dataLogin && dataLogin.token && dataLogin.usuario) {
        localStorage.setItem('fastech_token', dataLogin.token);
        localStorage.setItem('fastech_user', JSON.stringify(dataLogin.usuario));
        
        sessionStorage.setItem('es_nuevo_usuario', 'true');

        try {
          await fetch('/api/auth/auditoria', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              usuario_id: dataLogin.usuario.id,
              nombre_usuario: dataLogin.usuario.nombre,
              ip_direccion: '127.0.0.1',
              dispositivo: navigator.userAgent.substring(0, 50)
            })
          });
        } catch (auditErr) {
          console.error("Error silencioso al guardar bitácora:", auditErr);
        }

        if (setUsuarioLogueado) {
          setUsuarioLogueado(dataLogin.usuario);
        }

        Swal.fire({
          icon: 'success',
          title: `¡Bienvenido, ${dataLogin.usuario.nombre}!`,
          text: 'Tu cuenta ha sido creada e ingresaste automáticamente.',
          timer: 2000,
          showConfirmButton: false
        });

        if (cambiarVista) {
          cambiarVista('tienda');
        }
      } else {
        throw new Error('Estructura de sesión incompleta en el login automático.');
      }

    } catch (err) {
      localStorage.removeItem('fastech_token');
      localStorage.removeItem('fastech_user');
      
      Swal.fire({ 
        icon: 'error', 
        title: 'Error de Auto-Login', 
        text: err.message,
        confirmButtonColor: '#0f172a'
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f172a' }}>
      <div style={{ backgroundColor: '#1e293b', padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', border: '1px solid #334155', position: 'relative' }}>
        
        {/* 🔄 BOTÓN AGREGADO: Regresar a la vista de Inicio con estilo integrado */}
        <button 
          type="button"
          onClick={() => cambiarVista && cambiarVista('inicio')}
          disabled={cargando}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            background: 'none',
            border: 'none',
            color: isHovered ? '#38bdf8' : '#94a3b8',
            fontSize: '14px',
            fontWeight: '500',
            cursor: cargando ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px',
            padding: '0',
            transition: 'color 0.2s ease, transform 0.2s ease',
            transform: isHovered ? 'translateX(-3px)' : 'none'
          }}
        >
          ← Volver al Inicio
        </button>

        <h2 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '24px', textAlign: 'center' }}>Crear Cuenta</h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', marginBottom: '24px' }}>Regístrate para gestionar tus pedidos y cupones</p>

        <form onSubmit={manejarRegistro} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '500' }}>Nombre Completo</label>
            <input type="text" placeholder="Tu nombre" value={nombre} onChange={e => setNombre(e.target.value)} disabled={cargando} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', fontSize: '14px', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '500' }}>Correo Electrónico</label>
            <input type="email" placeholder="correo@ejemplo.com" value={correo} onChange={e => setCorreo(e.target.value)} disabled={cargando} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', fontSize: '14px', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '500' }}>Contraseña</label>
            <input type="password" placeholder="Tu contraseña" value={password} onChange={e => setPassword(e.target.value)} disabled={cargando} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', fontSize: '14px', outline: 'none' }} />
          </div>

          <button type="submit" disabled={cargando} style={{ marginTop: '10px', padding: '12px', border: 'none', borderRadius: '8px', backgroundColor: '#38bdf8', color: '#0f172a', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
            {cargando ? 'Registrando e ingresando...' : 'Registrarme y Entrar Ya'}
          </button>
        </form>

        <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>
          ¿Ya tienes una cuenta?{' '}
          <span onClick={() => cambiarVista && cambiarVista('login')} style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: 'bold' }}>
            Inicia Sesión
          </span>
        </p>
      </div>
    </div>
  );
}