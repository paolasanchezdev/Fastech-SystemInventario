import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../styles/VistaSesiones.css';

export default function VistaSesiones() {
  const [historialAccesos, setHistorialAccesos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarHistorialAccesos = () => {
    setCargando(true);
    // 🔥 CORREGIDO: Ruta relativa manteniendo el timestamp dinámico para romper la caché
    fetch(`/api/auth/historial-accesos?t=${Date.now()}`)
      .then(res => {
        if (!res.ok) throw new Error("No se pudo obtener el historial de seguridad");
        return res.json();
      })
      .then(data => {
        console.log("🔍 [AUDITORÍA] Logs actualizados recibidos:", data);
        setHistorialAccesos(data);
        setCargando(false);
      })
      .catch(err => {
        console.error("❌ Error cargando bitácora de accesos:", err);
        setCargando(false);
      });
  };

  // Se ejecuta automáticamente al montar el componente en pantalla
  useEffect(() => {
    cargarHistorialAccesos();
  }, []);

  const obtenerIconoNavegador = (dispositivo) => {
    const info = (dispositivo || '').toLowerCase();
    if (info.includes('chrome')) return <i className="fa-brands fa-chrome" style={{ color: '#ea4335' }}></i>;
    if (info.includes('firefox')) return <i className="fa-brands fa-firefox-browser" style={{ color: '#ff7139' }}></i>;
    if (info.includes('safari') && !info.includes('chrome')) return <i className="fa-brands fa-safari" style={{ color: '#38bdf8' }}></i>;
    return <i className="fa-solid fa-laptop-code" style={{ color: '#64748b' }}></i>;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }} 
      className="sessions-container"
    >
      {/* 🛡️ BANNER SUPERIOR */}
      <div className="sessions-banner">
        <div className="sessions-banner-icon">
          <i className="fa-solid fa-shield-halved"></i>
        </div>
        <div className="sessions-banner-text">
          <h4>Bitácora de Seguridad Avanzada</h4>
          <p>Monitoreo, auditoría de entornos y registro de Direcciones IP en tiempo real.</p>
        </div>
      </div>

      {/* 📊 PANEL CENTRAL: TABLA DE ACCESOS */}
      <div className="sessions-cyber-card">
        <div className="sessions-card-header">
          <h3>
            <i className="fa-solid fa-fingerprint" style={{ color: '#38bdf8' }}></i> 
            Registro de Conexiones Globales
          </h3>
          <button 
            onClick={cargarHistorialAccesos} 
            className="btn-sessions-refresh" 
            disabled={cargando}
          >
            <i className={`fa-solid fa-rotate ${cargando ? 'fa-spin' : ''}`}></i> 
            {cargando ? 'Sincronizando...' : 'Actualizar Historial'}
          </button>
        </div>

        <div className="sessions-table-wrapper">
          <table className="sessions-cyber-table">
            <thead>
              <tr>
                <th>ID Registro</th>
                <th>Operador / Código</th>
                <th>Dirección IP Pública</th>
                <th>Fecha e Historial de Entrada</th>
                <th>Entorno Detectado</th>
              </tr>
            </thead>
            <tbody>
              {historialAccesos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="sessions-empty-text">
                    {cargando ? 'Cargando datos de auditoría remota...' : 'No se encontraron registros de accesos.'}
                  </td>
                </tr>
              ) : (
                historialAccesos.map(acceso => (
                  <tr key={acceso.id} className="sessions-table-row">
                    <td>
                      <span style={{ color: '#22d3ee', fontWeight: '700', fontFamily: 'monospace' }}>
                        #{acceso.id}
                      </span>
                    </td>
                    <td>
                      <span className="session-operator-cell">{acceso.nombre_usuario}</span>
                      <span className="session-uid-subtext">UID: #{acceso.usuario_id}</span>
                    </td>
                    <td>
                      <span className="session-ip-badge">
                        <i className="fa-solid fa-network-wired" style={{ fontSize: '0.75rem' }}></i>
                        {acceso.ip_direccion || "127.0.0.1"}
                      </span>
                    </td>
                    <td style={{ color: '#94a3b8' }}>
                      {new Date(acceso.fecha_ingreso).toLocaleString()}
                    </td>
                    <td>
                      <span className="session-env-badge">
                        {obtenerIconoNavegador(acceso.dispositivo)}
                        <span style={{ marginLeft: '6px' }}>{acceso.dispositivo || 'Terminal Desconocida'}</span>
                      </span>
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