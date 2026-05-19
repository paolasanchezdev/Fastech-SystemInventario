import React from 'react';

export default function StoreNavbar({ busqueda, setBusqueda, usuarioLogueado, cambiarVista }) {
  return (
    <nav className="store-navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', backgroundColor: '#0f172a', color: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <div className="nav-logo" style={{ fontSize: '22px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <i className="fa-solid fa-bolt-lightning" style={{ color: '#38bdf8' }}></i> Fastech <span style={{ fontSize: '12px', background: '#38bdf8', color: '#0f172a', padding: '2px 6px', borderRadius: '4px' }}>Pro</span>
      </div>

      <div className="nav-center-search" style={{ flex: '0 1 500px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '15px', color: '#94a3b8' }}></i>
          <input 
            type="text" 
            placeholder="Buscar hardware, periféricos, componentes..." 
            value={busqueda} 
            onChange={e => setBusqueda(e.target.value)} 
            style={{ width: '100%', padding: '10px 15px 10px 45px', borderRadius: '25px', border: 'none', backgroundColor: '#1e293b', color: '#fff', outline: 'none' }}
          />
        </div>
      </div>

      <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {usuarioLogueado?.rol === 'admin' && (
          <button onClick={() => cambiarVista('dashboard')} style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="fa-solid fa-chart-line"></i> Dashboard
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#38bdf8', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {usuarioLogueado?.nombre?.charAt(0)}
          </div>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' }}>
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </div>
    </nav>
  );
}