import React, { useState } from 'react';
import Inicio from './views/Inicio';
import Login from './views/Login';
import Registro from './views/Registro';
import Tienda from './views/Tienda';
import Dashboard from './views/Dashboard';

export default function App() {
  
  // 🛡️ INICIALIZACIÓN SÍNCRONA: Bloquea el estado inicial hasta leer el almacenamiento.
  // Evita el salto intermedio a la vista 'inicio' al dar F5.
  const [usuarioLogueado, setUsuarioLogueado] = useState(() => {
    try {
      const user = localStorage.getItem('fastech_user');
      if (user && user !== "undefined" && user !== "null") {
        return JSON.parse(user);
      }
    } catch (e) {
      console.error("Error leyendo usuario en arranque síncrono:", e);
    }
    return null;
  });

  const [vista, setVista] = useState(() => {
    try {
      const token = localStorage.getItem('fastech_token');
      const user = localStorage.getItem('fastech_user');
      if (token && user && user !== "undefined" && user !== "null") {
        const usuarioObj = JSON.parse(user);
        return usuarioObj.rol === 'admin' ? 'dashboard' : 'tienda';
      }
    } catch (e) {}
    return 'inicio';
  });

  const cambiarVista = (nuevaVista) => {
    setVista(nuevaVista);
  };

  const cerrarSesionGlobal = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUsuarioLogueado(null);
    setVista('inicio');
  };

  return (
    <div className="app-main-wrapper">
      {vista === 'inicio' && <Inicio cambiarVista={cambiarVista} usuarioLogueado={usuarioLogueado} />}
      {vista === 'login' && <Login cambiarVista={cambiarVista} setUsuarioLogueado={setUsuarioLogueado} />}
      {vista === 'registro' && <Registro cambiarVista={cambiarVista} setUsuarioLogueado={setUsuarioLogueado} />}
      {vista === 'tienda' && <Tienda cambiarVista={cambiarVista} usuarioLogueado={usuarioLogueado} setUsuarioLogueado={setUsuarioLogueado} cerrarSesionGlobal={cerrarSesionGlobal} />}
      {vista === 'dashboard' && <Dashboard cambiarVista={cambiarVista} usuarioLogueado={usuarioLogueado} setUsuarioLogueado={setUsuarioLogueado} cerrarSesionGlobal={cerrarSesionGlobal} />}
    </div>
  );
}