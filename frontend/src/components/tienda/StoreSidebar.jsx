import React from 'react';

export default function StoreSidebar({ seccionActiva, setSeccionActiva, cantidadCupones = 0 }) {
  return (
    <aside style={{ width: '260px', backgroundColor: '#1e293b', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: '8px', height: 'fit-content', border: '1px solid #334155' }}>
      <h4 style={{ color: '#94a3b8', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', marginBottom: '15px', paddingLeft: '10px', fontWeight: '700' }}>Navegación</h4>
      
      {/* Catálogo General */}
      <button 
        onClick={() => setSeccionActiva('tienda')} 
        style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 15px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', textAlign: 'left', backgroundColor: seccionActiva === 'tienda' ? 'rgba(56, 189, 248, 0.15)' : 'transparent', color: seccionActiva === 'tienda' ? '#38bdf8' : '#94a3b8', transition: 'all 0.2s' }}
      >
        <i className="fa-solid fa-shop" style={{ fontSize: '16px' }}></i> Catálogo General
      </button>

      {/* Zona de Ofertas */}
      <button 
        onClick={() => setSeccionActiva('ofertas')} 
        style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 15px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', textAlign: 'left', backgroundColor: seccionActiva === 'ofertas' ? 'rgba(244, 63, 94, 0.15)' : 'transparent', color: seccionActiva === 'ofertas' ? '#f43f5e' : '#94a3b8', transition: 'all 0.2s' }}
      >
        <i className="fa-solid fa-fire" style={{ fontSize: '16px' }}></i> Zona de Ofertas
      </button>

      {/* Configura tu PC */}
      <button 
        onClick={() => setSeccionActiva('build')} 
        style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 15px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', textAlign: 'left', backgroundColor: seccionActiva === 'build' ? 'rgba(16, 185, 129, 0.15)' : 'transparent', color: seccionActiva === 'build' ? '#10b981' : '#94a3b8', transition: 'all 0.2s' }}
      >
        <i className="fa-solid fa-screwdriver-wrench" style={{ fontSize: '16px' }}></i> Configura tu PC
      </button>

      {/* NUEVO: Mis Cupones Disponibles */}
      <button 
        onClick={() => setSeccionActiva('cupones')} 
        style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 15px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', textAlign: 'left', backgroundColor: seccionActiva === 'cupones' ? 'rgba(234, 179, 8, 0.15)' : 'transparent', color: seccionActiva === 'cupones' ? '#eab308' : '#94a3b8', transition: 'all 0.2s' }}
      >
        <i className="fa-solid fa-ticket" style={{ fontSize: '16px' }}></i> Mis Cupones
        {cantidadCupones > 0 && (
          <span style={{ marginLeft: 'auto', backgroundColor: '#38bdf8', color: '#0f172a', fontSize: '11px', padding: '2px 7px', borderRadius: '99px', fontWeight: '800', boxShadow: '0 2px 8px rgba(56, 189, 248, 0.4)' }}>
            {cantidadCupones}
          </span>
        )}
      </button>

      {/* Mis Pedidos */}
      <button 
        onClick={() => setSeccionActiva('compras')} 
        style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 15px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', textAlign: 'left', backgroundColor: seccionActiva === 'compras' ? 'rgba(168, 85, 247, 0.15)' : 'transparent', color: seccionActiva === 'compras' ? '#a855f7' : '#94a3b8', transition: 'all 0.2s' }}
      >
        <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: '16px' }}></i> Mis Pedidos
      </button>
    </aside>
  );
}