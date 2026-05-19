import React from 'react';

export default function StoreCart({ 
  carrito, 
  eliminarDelCarrito, 
  manejarCompraReal, 
  totalCuenta, 
  totalBruto,
  montoDescuento,
  cuponActivo,
  setCuponActivo,
  totalArticulos, 
  codigoIngresado,
  setCodigoIngresado,
  aplicarCupon 
}) {
  return (
    <aside style={{ width: '320px', backgroundColor: '#090d14', borderRadius: '16px', padding: '24px', boxShadow: '0 12px 40px -12px rgba(0, 0, 0, 0.9)', display: 'flex', flexDirection: 'column', height: 'fit-content', border: '1px solid rgba(255, 255, 255, 0.03)', boxSizing: 'border-box' }}>
      
      {/* ENCABEZADO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.03)', paddingBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#fff', fontWeight: '700', letterSpacing: '-0.25px' }}>Resumen de Compra</h3>
        <span style={{ backgroundColor: '#38bdf8', color: '#030508', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>{totalArticulos}</span>
      </div>

      {/* CUERPO / LISTA DE COMPONENTES */}
      <div style={{ flexGrow: 1, overflowY: 'auto', maxHeight: '400px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {carrito.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>
            <i className="fa-solid fa-basket-shopping" style={{ fontSize: '32px', marginBottom: '10px', color: '#475569' }}></i>
            <p style={{ fontSize: '13px', margin: 0 }}>El carrito está esperando hardware.</p>
          </div>
        ) : (
          carrito.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#06090f', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
              <div style={{ flexGrow: 1, marginRight: '10px', minWidth: '0' }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#f1f5f9', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.nombre}</h4>
                <small style={{ color: '#38bdf8', fontWeight: '500' }}>{item.cantidad} x ${parseFloat(item.precio).toFixed(2)}</small>
              </div>
              <button onClick={() => eliminarDelCarrito(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px', transition: 'color 0.2s' }}>
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </div>
          ))
        )}
      </div>

      {/* SECCIÓN INTERACTIVA DE CUPONES */}
      {carrito.length > 0 && (
        <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.03)', paddingTop: '15px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>¿Tienes un código de descuento?</label>
          
          {/* 🔥 CONTENEDOR FLEX FIX: ALINEACIÓN PERFECTA EN UNA SOLA LÍNEA */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', width: '100%', boxSizing: 'border-box', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Ej: FASTNEW15" 
              value={codigoIngresado} 
              onChange={(e) => setCodigoIngresado(e.target.value)}
              style={{ 
                flex: '1', 
                minWidth: '0', /* Previene que el input empuje al botón hacia afuera */
                backgroundColor: '#06090f', 
                border: '1px solid rgba(255, 255, 255, 0.03)', 
                color: '#fff', 
                padding: '10px 12px', 
                borderRadius: '6px', 
                fontSize: '13px', 
                outline: 'none',
                fontFamily: 'monospace',
                boxSizing: 'border-box'
              }}
            />
            <button 
              onClick={() => { aplicarCupon(); }}
              style={{ 
                backgroundColor: '#38bdf8', 
                color: '#030508', 
                border: 'none', 
                padding: '10px 16px', 
                borderRadius: '6px', 
                fontWeight: '700', 
                fontSize: '13px', 
                cursor: 'pointer',
                whiteSpace: 'nowrap', /* Evita saltos de línea molestos */
                flexShrink: '0', /* Prohíbe que el botón se aplaste */
                boxSizing: 'border-box'
              }}
            >
              Aplicar
            </button>
          </div>
          
          {/* Badge de Cupón Activo corregido (cuponActivo almacena directamente un String) */}
          {cuponActivo && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>
                <i className="fa-solid fa-ticket" style={{ marginRight: '6px' }}></i> Activo: <b style={{ fontFamily: 'monospace' }}>{cuponActivo}</b>
              </span>
              <button onClick={() => setCuponActivo(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                Quitar
              </button>
            </div>
          )}

          {/* DESGLOSE DE PRECIOS Y TOTALES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px', borderTop: '1px solid rgba(255, 255, 255, 0.03)', paddingTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8' }}>
              <span>Subtotal bruto:</span>
              <span style={{ fontFamily: 'monospace' }}>${parseFloat(totalBruto).toFixed(2)}</span>
            </div>
            
            {montoDescuento > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#10b981', fontWeight: '500' }}>
                <span>Descuento (15%):</span>
                <span style={{ fontFamily: 'monospace' }}>-${parseFloat(montoDescuento).toFixed(2)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>
              <span>Total Neto:</span>
              <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>${parseFloat(totalCuenta).toFixed(2)}</span>
            </div>
          </div>

          <button onClick={manejarCompraReal} style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '12px', backgroundColor: '#10b981', color: '#fff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)', transition: 'background 0.2s' }}>
            Procesar Orden <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      )}
    </aside>
  );
}