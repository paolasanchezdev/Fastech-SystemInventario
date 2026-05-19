import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 📦 Importación de tus subcomponentes intactos
import VistaInventario from '../components/VistaInventario';
import VistaUsuarios from '../components/VistaUsuarios';
import VistaVentas from '../components/VistaVentas';
import VistaSesiones from '../components/VistaSesiones';

// 🎨 Tu hoja de estilos unificada
import '../styles/Dashboard.css'; 

export default function Dashboard({ cambiarVista, usuarioLogueado, setUsuarioLogueado, cerrarSesionGlobal }) {
  const [seccionActiva, setSeccionActiva] = useState('inventario');
  // 🔥 Estado para controlar si el sidebar flotante está abierto en móviles
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const manejarLogoutAdmin = () => {
    setSidebarOpen(false); // Cierra el menú al salir
    if (cerrarSesionGlobal) {
      cerrarSesionGlobal(); 
    } else {
      localStorage.clear();
      sessionStorage.clear();
      setUsuarioLogueado(null);
      cambiarVista('inicio');
    }
  };

  const cambiarSeccionMovil = (id) => {
    setSeccionActiva(id);
    setSidebarOpen(false); // 🔥 Cierra automáticamente el sidebar al tocar una opción en el celular
  };

  // Mapeo dinámico para renderizar el menú lateral limpio
  const menuItems = [
    { id: 'inventario', nombre: 'Inventario', icono: '📋' },
    { id: 'ventas', nombre: 'Historial Ventas', icono: '📊' },
    { id: 'usuarios', nombre: 'Gestión Usuarios', icono: '👥' },
    { id: 'sesiones', nombre: 'Auditoría Sesiones', icono: '🛡️' },
  ];

  return (
    <div className="admin-dashboard-layout">
      
      {/* 🧬 SIDEBAR LATERAL CYBER-TECH (CON CLASE DINÁMICA .open) */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-brand-section">
          <div className="brand-logo-glow">⚡</div>
          <h2>Fastech <span className="brand-admin-badge">ADMIN</span></h2>
        </div>

        <div className="admin-user-tag">
          <div className="admin-avatar-pulse">
            {usuarioLogueado?.nombre?.charAt(0).toUpperCase() || 'P'}
          </div>
          <div className="admin-user-meta">
            <p className="admin-meta-name">{usuarioLogueado?.nombre || 'Paola Admin'}</p>
            <p className="admin-meta-role">Root Developer</p>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => cambiarSeccionMovil(item.id)}
              className={`sidebar-nav-item ${seccionActiva === item.id ? 'active' : ''}`}
            >
              <span className="nav-item-icon">{item.icono}</span>
              <span className="nav-item-text">{item.nombre}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button 
            onClick={() => { setSidebarOpen(false); cambiarVista('tienda'); }} 
            className="btn-sidebar-store"
          >
            🏪 Tienda General
          </button>
          <button onClick={manejarLogoutAdmin} className="btn-sidebar-logout" title="Cerrar Sesión">
            ❌ Salir del Sistema
          </button>
        </div>
      </aside>

      {/* 🖥️ CUERPO DE TRABAJO PRINCIPAL CON CONTENEDOR FLUIDO */}
      <div className="admin-workspace-scroll-container">
        <main className="admin-main-workspace">
          
          <header className="workspace-header">
            {/* 🔥 BOTÓN HAMBURGUESA PARA MÓVILES */}
            <button 
              className="mobile-menu-trigger" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle navigation"
            >
              {sidebarOpen ? '✕ Cerrar' : '☰ Menú'}
            </button>

            <div className="header-title-block">
              <h1>Control Operativo</h1>
              <p className="text-muted">Terminal de administración centralizada y monitoreo de MariaDB</p>
            </div>
            <div className="system-status-pill">
              <span className="status-dot-active"></span>
              NodeJS API : Online
            </div>
          </header>

          <div className="workspace-view-container">
            <AnimatePresence mode="wait">
              <motion.div 
                key={seccionActiva} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }} 
                transition={{ duration: 0.15 }}
                className="workspace-motion-wrapper"
              >
                {seccionActiva === 'inventario' && <VistaInventario usuarioLogueado={usuarioLogueado} />}
                {seccionActiva === 'usuarios' && <VistaUsuarios usuarioLogueado={usuarioLogueado} />}
                {seccionActiva === 'ventas' && <VistaVentas usuarioLogueado={usuarioLogueado} />}
                {seccionActiva === 'sesiones' && <VistaSesiones usuarioLogueado={usuarioLogueado} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

    </div>
  );
}