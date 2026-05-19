import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
// Componentes de Recharts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Swal from 'sweetalert2';
import '../styles/VistaVentas.css'; 

export default function VistaVentas() {
  const [ventasGlobales, setVentasGlobales] = useState([]);
  const [topProductos, setTopProductos] = useState([]);
  const [cargandoTop, setCargandoTop] = useState(true);

  // 🎨 Paleta de colores para los gráficos
  const COLORES_TOP = ['#60a5fa', '#a78bfa', '#22d3ee', '#818cf8', '#f472b6'];

  // Mapeador de íconos para los artículos del ticket
  const obtenerIconoCategoria = (nombreCategoria) => {
    const cat = (nombreCategoria || '').toLowerCase().trim();
    switch (cat) {
      case 'procesadores': return '🔲';
      case 'tarjetas de video':
      case 'tarjeta de video': return '⚡';
      case 'almacenamiento': return '💾';
      case 'memorias ram':
      case 'ram': return '📟';
      case 'mouse':
      case 'mouses': return '🖱️';
      case 'teclados': return '⌨️';
      case 'audifonos':
      case 'audio': return '🎧';
      case 'laptops':
      case 'laptop': return '💻';
      default: return '📦';
    }
  };

  // 🔄 REPARADO: calcularTopProductos envuelto para ser usado de forma segura
  const calcularTopProductos = useCallback(async (ventas) => {
    try {
      setCargandoTop(true);
      const conteoProductos = {};

      const promesas = ventas.map(v => 
        fetch(`/api/ventas/detalle/${v.id}`)
          .then(res => res.ok ? res.json() : [])
          .catch(() => [])
      );

      const todosLosDetalles = await Promise.all(promesas);

      todosLosDetalles.forEach(articulosTicket => {
        const lista = Array.isArray(articulosTicket) ? articulosTicket : (articulosTicket.items || [articulosTicket]);
        
        lista.forEach(item => {
          const nombre = item.nombre_producto || item.nombre || `ID: #${item.producto_id}`;
          const cantidad = parseInt(item.cantidad || 1, 10);

          if (conteoProductos[nombre]) {
            conteoProductos[nombre] += cantidad;
          } else {
            conteoProductos[nombre] = cantidad;
          }
        });
      });

      const arregloOrdenado = Object.keys(conteoProductos).map(nombre => ({
        nombre: nombre.length > 14 ? nombre.substring(0, 12) + '...' : nombre, 
        Unidades: conteoProductos[nombre]
      }))
      .sort((a, b) => b.Unidades - a.Unidades)
      .slice(0, 5);

      setTopProductos(arregloOrdenado);
      setCargandoTop(false);
    } catch (error) {
      console.error("Error procesando top de componentes:", error);
      setCargandoTop(false);
    }
  }, []);

  // 🔄 REPARADO: Función principal envuelta en useCallback para estabilizar dependencias de React
  const cargarVentasGlobales = useCallback(() => {
    fetch('/api/ventas')
      .then(res => res.ok ? res.json() : [])
      .then(async (data) => {
        if (Array.isArray(data)) {
          const ventasProcesadas = data.map(v => {
            const nombreExtraido = v.cliente || v.nombre_directo || v.nombre;
            let clienteFinal = nombreExtraido || `Usuario #${v.usuario_id || '?'}`;
            return { ...v, cliente: clienteFinal };
          });
          setVentasGlobales(ventasProcesadas);
          await calcularTopProductos(ventasProcesadas);
        }
      })
      .catch(err => console.error("Error cargando ventas:", err));
  }, [calcularTopProductos]);

  // 📑 MODAL DE TICKET CLÁSICO Y EXCLUSIVO (CENTRADO Y SIN FICHA TÉCNICA)
  const verDetallesTicket = async (ticketId, cliente) => {
    try {
      Swal.fire({
        title: 'Cargando información',
        html: '<span style="color: #94a3b8; font-family: system-ui, sans-serif; font-size: 0.95rem;">Por favor, espere un momento...</span>',
        background: '#1e293b', 
        backdrop: 'rgba(15, 23, 42, 0.75)', 
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
      });

      const res = await fetch(`/api/ventas/detalle/${ticketId}`);
      if (!res.ok) throw new Error("Error en la conexión.");
      const items = await res.json();
      const listaItems = Array.isArray(items) ? items : [];

      if (listaItems.length === 0) {
        Swal.fire({ 
          icon: 'info', 
          title: 'Registro Vacío', 
          text: 'No se encontraron artículos en este ticket.', 
          background: '#1e293b', 
          color: '#fff', 
          confirmButtonColor: '#3b82f6' 
        });
        return;
      }

      // Cálculos dinámicos de los montos totales del ticket
      const totalTicket = listaItems.reduce((acc, item) => {
        const c = parseInt(item.cantidad || 1, 10);
        const p = parseFloat(item.precio_unitario || item.precio || 0);
        return acc + (c * p);
      }, 0);

      const fechaActual = new Date().toLocaleDateString('es-SV', { day: '2-digit', month: 'long', year: 'numeric' });

      // 🛠️ RENDERIZADO ÚNICO DEL TICKET CENTRAL (BLANCO MATE ELEGANTE)
      let modalHTML = `
        <div style="background: #ffffff; padding: 24px 20px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: left; font-family: system-ui, -apple-system, sans-serif; width: 100%; box-sizing: border-box;">
          
          <div style="text-align: center; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 1.6rem; font-weight: 800; color: #0f172a;">
              <span style="color: #3b82f6;">⚡</span> Fastech
            </div>
            <h3 style="margin: 2px 0 0 0; font-size: 1.15rem; font-weight: 800; color: #1e293b; letter-spacing: 1px; font-family: monospace;">FACTURA DIGITAL</h3>
            <p style="margin: 2px 0 0 0; font-size: 0.7rem; color: #64748b; font-weight: bold;">:: HARDWARE & CYBER-STORE ::</p>
          </div>

          <div style="border-top: 1px dashed #cbd5e1; margin: 12px 0;"></div>

          <div style="display: grid; grid-template-columns: 1.1fr 1fr 0.9fr; gap: 6px; font-size: 0.75rem; color: #334155; text-align: center; background: #f8fafc; padding: 8px 4px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 16px;">
            <div style="border-right: 1px solid #e2e8f0;">
              <span style="color: #64748b; display: block; font-size: 0.65rem; font-weight: bold; text-transform: uppercase; margin-bottom: 2px;">📅 Fecha</span>
              <b style="font-size: 0.72rem; line-height: 1.1; display: block;">${fechaActual}</b>
            </div>
            <div style="border-right: 1px solid #e2e8f0; padding: 0 2px;">
              <span style="color: #64748b; display: block; font-size: 0.65rem; font-weight: bold; text-transform: uppercase; margin-bottom: 2px;">👤 Cliente</span>
              <b style="display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${cliente}</b>
            </div>
            <div>
              <span style="color: #64748b; display: block; font-size: 0.65rem; font-weight: bold; text-transform: uppercase; margin-bottom: 2px;">🛡️ Estatus</span>
              <b style="color: #10b981;">LIQUIDADO</b>
            </div>
          </div>

          <h2 style="font-family: monospace; font-size: 1.35rem; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">ORDEN #99${ticketId}</h2>

          <div style="display: flex; font-size: 0.75rem; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; text-transform: uppercase;">
            <div style="flex: 2;">Item</div>
            <div style="flex: 0.5; text-align: center;">Cant.</div>
            <div style="flex: 0.9; text-align: right;">P. Unit.</div>
            <div style="flex: 1; text-align: right;">Total</div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px; max-height: 180px; overflow-y: auto; padding-right: 2px;">
      `;

      listaItems.forEach(item => {
        const name = item.nombre_producto || item.nombre || "Componente Hardware";
        const qty = parseInt(item.cantidad || 1, 10);
        const price = parseFloat(item.precio_unitario || item.precio || 0);
        const sub = qty * price;
        const iconoArticulo = obtenerIconoCategoria(item.categoria);

        modalHTML += `
          <div style="display: flex; align-items: center; color: #1e293b; font-size: 0.8rem;">
            <div style="flex: 2; font-weight: 600; display: flex; align-items: center; gap: 6px; overflow: hidden;">
              <span style="font-size: 0.95rem; flex-shrink: 0;">${iconoArticulo}</span>
              <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${name}</span>
            </div>
            <div style="flex: 0.5; text-align: center; font-weight: bold; color: #475569;">x${qty}</div>
            <div style="flex: 0.9; text-align: right; color: #64748b; font-family: monospace;">$${price.toFixed(2)}</div>
            <div style="flex: 1; text-align: right; font-weight: bold; color: #0f172a; font-family: monospace;">$${sub.toFixed(2)}</div>
          </div>
        `;
      });

      modalHTML += `
          </div>

          <div style="border-top: 1px dashed #cbd5e1; margin: 12px 0;"></div>

          <div style="display: flex; justify-content: space-between; align-items: center; background: #22c55e; color: #ffffff; padding: 10px 14px; border-radius: 6px; font-weight: bold; margin-bottom: 12px;">
            <span style="font-size: 0.8rem; letter-spacing: 0.5px;">TOTAL NETO:</span>
            <span style="font-size: 1.3rem; font-family: monospace;">$${totalTicket.toFixed(2)}</span>
          </div>

          <div style="text-align: center; font-size: 0.65rem; color: #64748b; font-weight: bold; letter-spacing: 0.3px;">
            ::: GRACIAS POR TU COMPRA SISTÉMICA :::
          </div>
        </div>
      `;

      Swal.fire({
        html: modalHTML,
        background: '#1e293b', 
        backdrop: 'rgba(15, 23, 42, 0.8) blur(8px)', 
        showConfirmButton: true,
        confirmButtonText: '✓ FINALIZAR REVISIÓN',
        confirmButtonColor: '#475569', 
        width: '460px',
        didOpen: () => {
          const popup = Swal.getPopup();
          if (popup) {
            popup.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.5)';
            popup.style.border = '1px solid #334155';
            popup.style.borderRadius = '12px';
            popup.style.padding = '20px';
          }
        }
      });

    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error de Lectura', text: 'No se pudieron procesar los detalles del ticket.', background: '#1e293b', color: '#fff', confirmButtonColor: '#475569' });
    }
  };

  // 🔥 EFECTO SIZADO CORRECTAMENTE
  useEffect(() => {
    cargarVentasGlobales();
  }, [cargarVentasGlobales]);

  const obtenerDatosIngresos = () => {
    const mapaFechas = {};
    [...ventasGlobales].reverse().forEach(v => {
      if (!v.fecha) return;
      const fechaCorta = new Date(v.fecha).toLocaleDateString('es-SV', { day: '2-digit', month: '2-digit' });
      mapaFechas[fechaCorta] = (mapaFechas[fechaCorta] || 0) + parseFloat(v.total || 0);
    });

    return Object.keys(mapaFechas).map(fecha => ({
      fecha: fecha,
      Monto: parseFloat(mapaFechas[fecha].toFixed(2))
    }));
  };

  const datosIngresos = obtenerDatosIngresos();
  const ingresosTotales = ventasGlobales.reduce((acc, v) => acc + parseFloat(v.total || 0), 0);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="sales-analytics-container">
      
      {/* 📊 SECCIÓN DE INDICADORES CLAVE */}
      <div className="analytics-stats-row">
        <div className="analytics-stat-card card-glow-green">
          <div className="stat-icon-wrapper icon-green">💵</div>
          <div className="stat-meta-data">
            <span className="stat-label">Ingresos Brutos Globales</span> 
            <h4 className="stat-value text-green">${ingresosTotales.toFixed(2)}</h4>
          </div>
        </div>
        <div className="analytics-stat-card card-glow-blue">
          <div className="stat-icon-wrapper icon-blue">📦</div>
          <div className="stat-meta-data">
            <span className="stat-label">Órdenes Despachadas</span> 
            <h4 className="stat-value text-blue">{ventasGlobales.length} Transacciones</h4>
          </div>
        </div>
      </div>

      {/* 📊 SECCIÓN DOBLE DE RECHARTS */}
      <div className="sales-charts-grid">
        
        {/* GRÁFICO 1: JORNADAS */}
        <div className="sales-table-panel">
          <div className="sales-panel-header">
            <h3><span className="panel-header-icon">📊</span> Ingresos por Jornada</h3>
            <p className="panel-subtitle">Totales liquidados en caja agrupados por fecha</p>
          </div>
          {datosIngresos.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>Sin registros de facturación.</p>
          ) : (
            <div className="chart-wrapper-cyber">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosIngresos} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="fecha" stroke="#94a3b8" style={{ fontSize: '10px' }} />
                  <YAxis stroke="#94a3b8" style={{ fontSize: '10px' }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.01)' }}
                    contentStyle={{ background: '#1e293b', borderColor: '#334155', color: '#fff', fontSize: '12px', borderRadius: '6px' }}
                    formatter={(value) => [`$${value}`, 'Ingreso']}
                  />
                  <Bar dataKey="Monto" fill="#60a5fa" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* GRÁFICO 2: TOP 5 */}
        <div className="sales-table-panel">
          <div className="sales-panel-header">
            <h3><span className="panel-header-icon">🔥</span> Top 5 Componentes</h3>
            <p className="panel-subtitle">Demanda real de hardware basada en unidades</p>
          </div>
          {cargandoTop ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>Analizando registros de inventario...</p>
          ) : topProductos.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>No hay suficientes productos en el historial.</p>
          ) : (
            <div className="chart-wrapper-cyber">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductos} layout="vertical" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#94a3b8" style={{ fontSize: '10px' }} allowDecimals={false} />
                  <YAxis dataKey="nombre" type="category" stroke="#94a3b8" style={{ fontSize: '10px' }} width={95} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.01)' }}
                    contentStyle={{ background: '#1e293b', borderColor: '#334155', color: '#fff', fontSize: '12px', borderRadius: '6px' }}
                    formatter={(value) => [`${value} uds.`, 'Vendidos']}
                  />
                  <Bar dataKey="Unidades" radius={[0, 4, 4, 0]} maxBarSize={20}>
                    {topProductos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORES_TOP[index % COLORES_TOP.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>
       
      {/* 📋 TABLA CENTRAL DE TRANSACCIONES */}
      <div className="sales-table-panel">
        <div className="sales-panel-header">
          <h3><span className="panel-header-icon">📑</span> Auditoría de Transacciones</h3>
          <p className="panel-subtitle">Registro histórico de tickets generados por el módulo de facturación local</p>
        </div>
        <div className="sales-table-responsive">
          <table className="sales-custom-table">
            <thead>
              <tr>
                <th>No. Ticket</th>
                <th>Cliente Comprador</th>
                <th>Fecha Operación</th>
                <th>Total Liquidado</th>
                <th style={{ textAlign: 'center' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {ventasGlobales.map(v => (
                <tr key={v.id} className="sales-table-row">
                  <td className="ticket-id-cell"><b>#{v.id}</b></td>
                  <td className="client-cell">
                    <div className="client-badge-wrapper">
                      <span className="client-avatar-mini">👤</span>
                      <span className="client-name-text">{v.cliente}</span>
                    </div>
                  </td>
                  <td className="date-cell">{v.fecha ? new Date(v.fecha).toLocaleString('es-SV') : 'N/A'}</td>
                  <td className="total-cell"><b>${parseFloat(v.total || 0).toFixed(2)}</b></td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      onClick={() => verDetallesTicket(v.id, v.cliente)}
                      style={{
                        background: '#334155',
                        border: 'none',
                        color: '#f8fafc',
                        borderRadius: '6px',
                        padding: '6px 14px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        fontFamily: 'system-ui, sans-serif',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => { e.target.style.background = '#475569'; }}
                      onMouseLeave={(e) => { e.target.style.background = '#334155'; }}
                    >
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}