import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

// Importación de tus estilos integrados
import '../styles/VistaUsuarios.css'; 

export default function VistaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  
  // Estados para capturar el formulario
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('cliente');

  // Control del Estado CRUD para actualización (Edit Mode)
  const [editando, setEditando] = useState(false);
  const [usuarioIdSeleccionado, setUsuarioIdSeleccionado] = useState(null);

  // 1. READ: Obtener todos los usuarios de MariaDB
  const obtenerUsuarios = async () => {
    try {
      // 🔥 CORREGIDO: Ruta relativa limpia para comunicación por USB
      const res = await fetch('/api/auth/usuarios');
      if (!res.ok) throw new Error('No se pudo mapear la base de datos de operadores.');
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      console.error("❌ Error al listar usuarios:", err);
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  // Limpiar campos e interactividad del formulario
  const resetearFormulario = () => {
    setNombre('');
    setCorreo('');
    setPassword('');
    setRol('cliente');
    setEditando(false);
    setUsuarioIdSeleccionado(null);
  };

  // 2. CREATE / UPDATE: Manejador único de envío de formulario
  const guardarUsuario = async (e) => {
    e.preventDefault();

    if (!nombre || !correo || (!editando && !password)) {
      return Swal.fire({
        icon: 'warning',
        title: 'Campos Requeridos',
        text: 'Por favor, rellena los parámetros obligatorios del perfil.',
        background: '#111625',
        color: '#f8fafc',
        confirmButtonColor: '#2563eb'
      });
    }

    try {
      // 🔥 CORREGIDO: Rutas relativas dinámicas sin URLs en duro
      const url = editando 
        ? `/api/auth/usuarios/${usuarioIdSeleccionado}`
        : '/api/auth/registrar';

      const metodo = editando ? 'PUT' : 'POST';
      
      // En edición la contraseña es opcional (solo si se quiere cambiar)
      const payload = { nombre, correo, rol };
      if (password) payload.password = password;

      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ocurrió un error operativo en el servidor.');

      Swal.fire({
        icon: 'success',
        title: editando ? '¡Registro Actualizado!' : '¡Operador Registrado!',
        text: data.mensaje || 'Cambios sincronizados en MariaDB.',
        background: '#111625',
        color: '#f8fafc',
        confirmButtonColor: '#10b981'
      });

      resetearFormulario();
      obtenerUsuarios();

    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Fallo de Sincronización',
        text: err.message,
        background: '#111625',
        color: '#f8fafc',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  // Activador de Modo Edición: Carga la fila elegida en la tarjeta vertical
  const activarEdicion = (usuario) => {
    setEditando(true);
    setUsuarioIdSeleccionado(usuario.id);
    setNombre(usuario.nombre);
    setCorreo(usuario.correo);
    setRol(usuario.rol);
    setPassword(''); // Dejar vacío para indicar que se mantiene si no se escribe una nueva
  };

  // 4. DELETE: Purgar registro permanentemente
  const eliminarUsuario = async (id) => {
    const resultado = await Swal.fire({
      title: '¿Revocar Accesos?',
      text: "Esta acción purgará de forma permanente al usuario del sistema local.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#243249',
      confirmButtonText: 'Sí, purgar registro',
      cancelButtonText: 'Abortar',
      background: '#111625',
      color: '#f8fafc'
    });

    if (resultado.isConfirmed) {
      try {
        // 🔥 CORREGIDO: Petición de purga con ruta relativa
        const res = await fetch(`/api/auth/usuarios/${id}`, {
          method: 'DELETE'
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'No se pudo completar la purga.');

        Swal.fire({
          title: 'Registro Purgado',
          text: 'El usuario ha sido removido de la tabla operativa.',
          icon: 'success',
          background: '#111625',
          color: '#f8fafc',
          confirmButtonColor: '#10b981'
        });
        
        if(usuarioIdSeleccionado === id) resetearFormulario();
        obtenerUsuarios();
      } catch (err) {
        Swal.fire({
          title: 'Error de Comunicación',
          text: err.message,
          icon: 'error',
          background: '#111625',
          color: '#f8fafc',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }} 
      className="users-crud-container"
    >
      {/* 🛠️ COLUMNA 1: FORMULARIO VERTICAL DE CREDENCIALES (CREAR O EDITAR) */}
      <div className="users-cyber-card">
        <div className="users-card-header">
          <h3>
            <span>👤</span> {editando ? 'Modificar Operador' : 'Registrar Usuario'}
          </h3>
          <p className="users-card-subtitle">
            {editando ? `Editando credenciales del ID #${usuarioIdSeleccionado}` : 'Asignación de nuevos perfiles de acceso'}
          </p>
        </div>

        <form onSubmit={guardarUsuario} className="users-vertical-form">
          <div className="users-form-group">
            <label>NOMBRE COMPLETO</label>
            <input 
              type="text" 
              value={nombre} 
              onChange={e => setNombre(e.target.value)} 
              placeholder="Ej. Paola Sánchez" 
              className="users-input-field"
            />
          </div>

          <div className="users-form-group">
            <label>CORREO ELECTRÓNICO</label>
            <input 
              type="email" 
              value={correo} 
              onChange={e => setCorreo(e.target.value)} 
              placeholder="correo@fastech.com" 
              className="users-input-field"
            />
          </div>

          <div className="users-form-group">
            <label>
              {editando ? 'NUEVA CONTRASEÑA (OPCIONAL)' : 'CONTRASEÑA DE SEGURIDAD'}
            </label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder={editando ? "Dejar en blanco para conservar" : "••••••••"} 
              className="users-input-field"
            />
          </div>

          <div className="users-form-group">
            <label>ROL DEL SISTEMA</label>
            <select 
              value={rol} 
              onChange={e => setRol(e.target.value)} 
              className="users-input-field"
              style={{ cursor: 'pointer' }}
            >
              <option value="cliente">Cliente (Módulo Local)</option>
              <option value="admin">Administrador (Root)</option>
            </select>
          </div>

          <button 
            type="submit" 
            className={`btn-users-submit ${editando ? 'btn-update' : 'btn-create'}`}
          >
            {editando ? '⚡ Actualizar Operador' : '💾 Guardar Usuario'}
          </button>

          {editando && (
            <button type="button" onClick={resetearFormulario} className="btn-users-cancel">
              Cancelar Edición
            </button>
          )}
        </form>
      </div>

      {/* 📋 COLUMNA 2: TABLA CENTRAL DE USUARIOS ACTIVOS */}
      <div className="users-cyber-card">
        <div className="users-card-header">
          <h3><span>📋</span> Control de Usuarios Activos</h3>
          <p className="users-card-subtitle">Monitoreo de identidades autorizadas y depuración en caliente</p>
        </div>

        <div className="users-table-wrapper">
          <table className="users-cyber-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre Completo</th>
                <th>Correo Electrónico</th>
                <th style={{ textAlign: 'center' }}>Rol Asignado</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan="5" className="users-empty-text">
                    No se detectan registros de usuarios activos en MariaDB.
                  </td>
                </tr>
              ) : (
                usuarios.map(u => (
                  <tr key={u.id} className="users-table-row">
                    <td><b>#{u.id}</b></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>👤</span>
                        <span style={{ fontWeight: '500' }}>{u.nombre}</span>
                      </div>
                    </td>
                    <td style={{ color: '#94a3b8' }}>{u.correo}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`role-badge ${u.rol}`}>
                        {u.rol}
                      </span>
                    </td>
                    <td className="users-actions-cell">
                      <button 
                        onClick={() => activarEdicion(u)} 
                        className="btn-action-icon edit"
                        title="Editar Credenciales"
                      >
                        ✏️ Editar
                      </button>
                      <button 
                        onClick={() => eliminarUsuario(u.id)} 
                        className="btn-action-icon delete"
                        title="Eliminar Operador"
                      >
                        ❌ Purgar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}