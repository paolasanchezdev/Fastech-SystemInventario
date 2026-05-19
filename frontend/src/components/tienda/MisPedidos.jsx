import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { descargarTicketPDF } from '../../services/reporteInvoice'; 
import '../../styles/MisPedidos.css';

function CeldaDetalleProductos({ ventaId, onCargarArticulos }) {
  const [articulos, setArticulos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // 🔥 CORREGIDO: Ruta relativa para jalar los artículos del ticket por el cable USB
    fetch(`/api/ventas/detalle/${ventaId}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        const lista = Array.isArray(data) ? data : (data.items || [data]);
        setArticulos(lista);
        if (onCargarArticulos) onCargarArticulos(lista); 
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, [ventaId, onCargarArticulos]); // Inclusión de dependencia corregida para ESLint

  if (cargando) return <span className="product-item-muted">Sincronizando componentes...</span>;
  if (articulos.length === 0) return <span className="product-item-muted">Sin artículos</span>;
  
  return (
    <div className="order-products-list-vertical">
      {articulos.map((item, index) => (
        <div key={index} className="order-product-nested-row">
          <span className="product-item-name">
            {item.nombre_producto || item.nombre || `Componente ID: #${item.producto_id}`}
          </span>
          <span className="product-item-qty">x{item.cantidad || 1}</span>
        </div>
      ))}
    </div>
  );
}

export default function MisPedidos({ misCompras, setSeccionActiva }) {
  const [articulosPorVenta, setArticulosPorVenta] = useState({});

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }} 
      className="orders-section-container"
    >
      <div className="orders-dashboard-header">
        <div>
          <h2 className="orders-main-title">Historial de Pedidos</h2>
          <p className="orders-subtitle-text">Revisa el estado y descarga tus comprobantes de compra.</p>
        </div>
        <div className="total-spent-card">
          <span className="spent-label">Inversión Total en Cuenta</span>
          <span className="spent-value">
            ${misCompras.reduce((acc, compra) => acc + parseFloat(compra.total || 0), 0).toFixed(2)}
          </span>
        </div>
      </div>

      {misCompras.length === 0 ? (
        <div className="empty-orders-state">
          <i className="fa-solid fa-box-open empty-orders-icon"></i>
          <h3>No tienes pedidos registrados</h3>
          <button onClick={() => setSeccionActiva('tienda')} className="btn-filter-premium active" style={{ marginTop: '16px' }}>Ir al Catálogo</button>
        </div>
      ) : (
        <div className="orders-table-wrapper">
          <table className="orders-table-core">
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Fecha</th>
                <th>Productos / Detalle</th>
                <th>Estado</th>
                <th>Total</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {misCompras.map((compra) => (
                <tr key={compra.id} className="order-row-item">
                  <td className="order-id-cell">#FT-{compra.id}</td>
                  <td className="order-date-cell">
                    {compra.fecha ? new Date(compra.fecha).toLocaleDateString('es-SV') : 'Reciente'}
                  </td>
                  <td className="order-details-cell">
                    <CeldaDetalleProductos 
                      ventaId={compra.id} 
                      onCargarArticulos={(lista) => {
                        setArticulosPorVenta(prev => ({ ...prev, [compra.id]: lista }));
                      }}
                    />
                  </td>
                  <td>
                    <span className="order-status-badge status-completed">
                      Entregado
                    </span>
                  </td>
                  <td className="order-total-cell">
                    ${parseFloat(compra.total || 0).toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => {
                        const listaArticulos = articulosPorVenta[compra.id] || [];
                        descargarTicketPDF(compra, listaArticulos);
                      }}
                      style={{
                        background: 'rgba(56, 189, 248, 0.1)',
                        border: '1px solid rgba(56, 189, 248, 0.2)',
                        color: '#38bdf8',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#38bdf8';
                        e.target.style.color = '#000';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(56, 189, 248, 0.1)';
                        e.target.style.color = '#38bdf8';
                      }}
                    >
                      📥 PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}