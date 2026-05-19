import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 
import Swal from 'sweetalert2';

// Importación de componentes estructurales
import StoreNavbar from '../components/tienda/StoreNavbar';
import StoreSidebar from '../components/tienda/StoreSidebar';
import StoreCart from '../components/tienda/StoreCart';

// Importación de las nuevas vistas separadas
import MisPedidos from '../components/tienda/MisPedidos';
import ZonaOfertas from '../components/tienda/ZonaOfertas';

import '../styles/Tienda.css';

export default function Tienda({ cambiarVista, usuarioLogueado, setUsuarioLogueado, cerrarSesionGlobal }) {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [seccionActiva, setSeccionActiva] = useState('tienda'); 
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [misCompras, setMisCompras] = useState([]);
  const [bannerActual, setBannerActual] = useState(0);

  // 🎫 Control de cupones y descuentos en tiempo real
  const [codigoIngresado, setCodigoIngresado] = useState('');
  const [cuponActivo, setCuponActivo] = useState(null);

  // 🖼️ CONFIGURACIÓN DE TU LISTA DE BANNERS CON IMÁGENES REALES
  const listaBanners = [
    { id: 1, imagen: "/banner1.jpg" },
    { id: 2, imagen: "/banner2.jpg" },
    { id: 3, imagen: "/banner3.jpg" }
  ];

  // Cambio automático de banners cada 6 segundos
  useEffect(() => {
    const intervalo = setInterval(() => {
      setBannerActual((prev) => (prev + 1) % listaBanners.length);
    }, 6000);
    return () => clearInterval(intervalo);
  }, [listaBanners.length]);

  const usuarioId = usuarioLogueado?.id;

  // Mapeador de íconos para categorías dinámicas
  const obtenerIconoCategoria = (nombreCategoria) => {
    const cat = (nombreCategoria || '').toLowerCase().trim();
    switch (cat) {
      case 'todos': return <i className="fa-solid fa-border-all" style={{ marginRight: '8px' }}></i>;
      case 'procesadores': return <i className="fa-solid fa-microchip" style={{ marginRight: '8px', color: '#38bdf8' }}></i>;
      case 'tarjetas de video':
      case 'tarjeta de video': return <i className="fa-solid fa-memory" style={{ marginRight: '8px', color: '#a855f7' }}></i>;
      case 'almacenamiento': return <i className="fa-solid fa-hard-drive" style={{ marginRight: '8px', color: '#22c55e' }}></i>;
      case 'memorias ram':
      case 'ram': return <i className="fa-solid fa-server" style={{ marginRight: '8px', color: '#eab308' }}></i>;
      case 'mouse':
      case 'mouses': return <i className="fa-solid fa-computer-mouse" style={{ marginRight: '8px', color: '#ec4899' }}></i>;
      case 'teclados': return <i className="fa-solid fa-keyboard" style={{ marginRight: '8px', color: '#6366f1' }}></i>;
      case 'audifonos':
      case 'audio': return <i className="fa-solid fa-headphones" style={{ marginRight: '8px', color: '#f97316' }}></i>;
      case 'laptops':
      case 'laptop': return <i className="fa-solid fa-laptop" style={{ marginRight: '8px', color: '#06b6d4' }}></i>;
      default: return <i className="fa-solid fa-box-open" style={{ marginRight: '8px', color: '#94a3b8' }}></i>;
    }
  };

  const cargarCatalogo = useCallback(() => {
    fetch('/api/productos')
      .then(res => res.json())
      .then(data => setProductos(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error catálogo:", err));
  }, []);

  const cargarMisCompras = useCallback(async () => {
    if (!usuarioId) return;
    try {
      const res = await fetch(`/api/ventas/usuario/${usuarioId}`);
      if (res.ok) {
        const data = await res.json();
        setMisCompras(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn("Aviso de Red - Sincronizando historial:", err.message);
    }
  }, [usuarioId]);

  useEffect(() => { cargarCatalogo(); }, [cargarCatalogo]);
  useEffect(() => { if (usuarioId) cargarMisCompras(); }, [usuarioId, cargarMisCompras]);

  const agregarAlCarrito = (producto) => {
    if (!usuarioLogueado) {
      Swal.fire({ 
        icon: 'info', 
        title: 'Acceso Restringido', 
        text: 'Por favor, inicia sesión para comprar.',
        showCancelButton: true,
        confirmButtonText: 'Iniciar Sesión',
        confirmButtonColor: '#38bdf8',
      }).then((result) => { if (result.isConfirmed) cambiarVista('login'); });
      return;
    }
    const existe = carrito.find(item => item.id === producto.id);
    if (existe && existe.cantidad >= producto.stock) {
      Swal.fire({
        icon: 'warning',
        title: 'Límite de Stock',
        text: 'Has alcanzado el límite máximo de unidades disponibles para este hardware.',
        confirmButtonColor: '#475569'
      });
      return;
    }
    
    setCarrito(existe 
      ? carrito.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item)
      : [...carrito, { ...producto, cantidad: 1 }]
    );
  };

  const eliminarDelCarrito = (id) => {
    const existe = carrito.find(item => item.id === id);
    if (!existe) return;
    setCarrito(existe.cantidad === 1 
      ? carrito.filter(item => item.id !== id)
      : carrito.map(item => item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item)
    );
  };

  // Lógica local para procesar cupones de descuento rápidos
  const aplicarCupon = () => {
    const codigo = codigoIngresado.trim().toUpperCase();
    if (!codigo) return;

    if (codigo === 'FASTNEW15') {
      setCuponActivo(codigo);
      Swal.fire({ icon: 'success', title: 'Cupón Activado', text: 'Se ha aplicado un 15% de descuento a tu orden.', confirmButtonColor: '#38bdf8' });
    } else {
      Swal.fire({ icon: 'error', title: 'Código Inválido', text: 'El código promocional ingresado no existe.', confirmButtonColor: '#475569' });
    }
  };

  // 🏷️ FICHA TÉCNICA DARK PREMIUM REESTRUCTURADA
  const mostrarDetallesProducto = (p) => {
    const imagenUrl = p.imagen 
      ? (p.imagen.startsWith('http') ? p.imagen : `/productos/${p.imagen}`)
      : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="%23475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';

    const stockTexto = p.stock > 0 ? '✔ Disponible' : '❌ Agotado';
    const stockColor = p.stock > 0 ? '#4ade80' : '#ef4444';

    const descripcionLimpia = p.descripcion && p.descripcion.toString().toLowerCase().trim() !== 'null' && p.descripcion.toString().trim() !== ''
      ? p.descripcion.toString().trim()
      : 'Especificaciones técnicas detalladas no registradas en la base de datos de la sucursal.';

    let detalleHTML = `
      <div style="background: #111827; padding: 4px; text-align: left; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="background: #ffffff; border-radius: 6px; padding: 16px; text-align: center; margin-bottom: 14px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">
            <img src="${imagenUrl}" alt="${p.nombre}" style="max-height: 140px; object-fit: contain; max-width: 100%;" />
          </div>

          <h4 style="margin: 0 0 10px 0; font-size: 1.25rem; font-weight: 700; color: #22d3ee; line-height: 1.3;">
            ${p.nombre}
          </h4>

          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.8rem; color: #9ca3af; border-top: 1px solid #1f2937; padding-top: 12px; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>🔲</span> <span><b>Categoría / Segmento:</b> <span style="color: #a5b4fc; font-weight: 600;">${p.categoria || 'Hardware'}</span></span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>🆔</span> <span><b>Código SKU Local:</b> <span style="font-family: monospace; color: #94a3b8;">FASTECH-PROD-${p.id}</span></span>
            </div>
          </div>

          <div style="background: #0b0f19; padding: 14px; border-radius: 6px; border-left: 4px solid #22d3ee; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3); margin-top: 12px;">
            <div style="font-size: 0.7rem; font-family: monospace; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 6px; letter-spacing: 0.5px;">
              💾 ESPECIFICACIONES Y HOJA TÉCNICA
            </div>
            <p style="font-size: 0.82rem; line-height: 1.5; color: #cbd5e1; white-space: pre-wrap; font-family: monospace; margin: 0;">${descripcionLimpia}</p>
          </div>
        </div>

        <div style="margin-top: 18px; border-top: 1px solid #1f2937; padding-top: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #9ca3af;">
            <div>
              <span style="display: block; font-size: 0.65rem; text-transform: uppercase; color: #64748b; font-weight: bold;">Precio Unitario:</span>
              <b style="font-size: 1.4rem; color: #4ade80; font-family: monospace;">$${parseFloat(p.precio || 0).toFixed(2)}</b>
            </div>
            <div style="text-align: right;">
              <span style="display: block; font-size: 0.65rem; text-transform: uppercase; color: #64748b; font-weight: bold;">Almacén Fastech:</span>
              <b style="font-size: 1.05rem; color: ${stockColor};">${stockTexto} (${p.stock} un.)</b>
            </div>
          </div>
        </div>
      </div>
    `;

    Swal.fire({
      html: detalleHTML,
      background: '#111827',
      backdrop: 'rgba(3, 7, 18, 0.85) blur(6px)',
      showCancelButton: true,
      confirmButtonText: '🛒 Añadir al Carrito',
      cancelButtonText: 'Volver al Catálogo',
      confirmButtonColor: '#22d3ee', 
      cancelButtonColor: '#374151', 
      width: '440px',
      didOpen: () => {
        const popup = Swal.getPopup();
        if (popup) {
          popup.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.6)';
          popup.style.border = '1px solid #1f2937';
          popup.style.borderRadius = '10px';
          popup.style.padding = '20px';
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        if (p.stock === 0) {
          Swal.fire({ 
            icon: 'error', 
            title: 'Sin Existencias', 
            text: 'Este componente de hardware está temporalmente agotado.', 
            background: '#111827', 
            color: '#f8fafc',
            confirmButtonColor: '#374151'
          });
        } else {
          agregarAlCarrito(p);
        }
      }
    });
  };

  const totalBruto = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const totalArticulos = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  // Recalcular descuento según el cupón activo
  const descuentoEfectuado = cuponActivo === 'FASTNEW15' ? totalBruto * 0.15 : 0;
  const totalCuenta = totalBruto - descuentoEfectuado;

  const manejarCompraReal = async () => {
    try {
      const res = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuarioLogueado.id, total: totalCuenta, productos: carrito })
      });
      if (res.ok) {
        Swal.fire({ icon: 'success', title: '¡Pedido Confirmado! 🎉' });
        setCarrito([]); setCuponActivo(null); setCodigoIngresado('');
        cargarCatalogo(); cargarMisCompras();
      }
    } catch (err) { Swal.fire({ icon: 'error', title: 'Error', text: err.message }); }
  };

  const categoriasUnicas = Array.isArray(productos) 
    ? [...new Set(productos.map(p => p.categoria))].filter(Boolean)
    : [];

  const productosFiltrados = Array.isArray(productos)
    ? productos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()) && (categoriaSeleccionada === 'Todos' || p.categoria === categoriaSeleccionada))
    : [];

  return (
    <div className="store-app-container">
      <StoreNavbar busqueda={busqueda} setBusqueda={setBusqueda} usuarioLogueado={usuarioLogueado} cambiarVista={cambiarVista} cerrarSesionGlobal={cerrarSesionGlobal} />

      <div className="store-main-layout">
        <StoreSidebar seccionActiva={seccionActiva} setSeccionActiva={setSeccionActiva} cantidadCupones={cuponActivo ? 0 : 1} />

        <main className="store-center-panel">
          <AnimatePresence mode="wait">
            
            {/* SECCIÓN 1: CATÁLOGO DE LA TIENDA */}
            {seccionActiva === 'tienda' && (
              <motion.div key="tienda" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Carrusel del Hero */}
                <div className="premium-slider-container">
                  <AnimatePresence mode="wait">
                    <motion.div key={bannerActual} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="banner-slide">
                      <img 
                        src={listaBanners[bannerActual].imagen} 
                        alt="Banner Promocional" 
                        className="banner-background-img"
                        onError={(e) => { 
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 24 24" fill="none" stroke="%23475569" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
                        }}
                      />
                    </motion.div>
                  </AnimatePresence>
                  <div className="slider-dots">
                    {listaBanners.map((_, index) => (
                      <span key={index} className={`slider-dot ${bannerActual === index ? 'dot-active' : ''}`} onClick={() => setBannerActual(index)} />
                    ))}
                  </div>
                </div>

                {/* Filtro de Categorías */}
                <div className="category-filter-bar">
                  <button onClick={() => setCategoriaSeleccionada('Todos')} className={`btn-filter-premium ${categoriaSeleccionada === 'Todos' ? 'active' : ''}`}>
                    {obtenerIconoCategoria('Todos')} Todos
                  </button>
                  {categoriasUnicas.map(cat => (
                    <button key={cat} onClick={() => setCategoriaSeleccionada(cat)} className={`btn-filter-premium ${categoriaSeleccionada === cat ? 'active' : ''}`}>
                      {obtenerIconoCategoria(cat)} {cat}
                    </button>
                  ))}
                </div>

                {/* Grilla de Componentes */}
                <div className="modern-products-grid">
                  {productosFiltrados.map(p => {
                    const enCarrito = carrito.find(item => item.id === p.id);
                    const stockDisp = enCarrito ? p.stock - enCarrito.cantidad : p.stock;
                    
                    let claseBadge = "stock-badge badge-in-stock";
                    let textoBadge = "En Stock";
                    
                    if (p.stock === 0) { 
                      claseBadge = "stock-badge badge-no-stock"; 
                      textoBadge = "Agotado"; 
                    } else if (p.stock <= 5) { 
                      claseBadge = "stock-badge badge-low-stock"; 
                      textoBadge = `¡Pocas! (${p.stock})`; 
                    }

                    return (
                      <div 
                        key={p.id} 
                        className="premium-product-card" 
                        onClick={() => mostrarDetallesProducto(p)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="card-image-wrapper">
                          <span className={claseBadge}>{textoBadge}</span>
                          {p.imagen ? (
                            <img 
                              src={p.imagen.startsWith('http') ? p.imagen : `/productos/${p.imagen}`} 
                              alt={p.nombre} 
                              onError={(e) => { 
                                e.target.onerror = null; 
                                e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="%23475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
                              }}
                            />
                          ) : (
                            <div style={{ padding: '20px', color: '#fff', textAlign: 'center' }}>Sin imagen</div>
                          )}
                        </div>
                        
                        <div className="card-info-body">
                          <span className="category-tag-premium" style={{ display: 'inline-flex', alignItems: 'center' }}>
                            {obtenerIconoCategoria(p.categoria)} {p.categoria || 'Hardware'}
                          </span>
                          <h3 className="product-title-premium">{p.nombre}</h3>
                          
                          <div className="price-row-premium" onClick={(e) => e.stopPropagation()}>
                            <div className="price-container-stack">
                              <span className="price-value">${parseFloat(p.precio || 0).toFixed(2)}</span>
                              <span className="stock-counter-text">Disp: {stockDisp} un.</span>
                            </div>
                            <button disabled={stockDisp === 0} onClick={() => agregarAlCarrito(p)} className="btn-add-premium">+</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* SECCIÓN 2: COMPONENTE DE ZONA DE OFERTAS MODULAR */}
            {seccionActiva === 'ofertas' && <ZonaOfertas />}

            {/* 🔥 SECCIÓN 2.5: VISTA DE MIS CUPONES (ARREGLA LA PANTALLA EN NEGRO) */}
            {seccionActiva === 'cupones' && (
              <motion.div key="cupones" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="premium-data-view" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h2 style={{ color: '#fff', margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                    <i className="fa-solid fa-ticket" style={{ marginRight: '10px', color: '#38bdf8' }}></i>
                    Mis Cupones Disponibles
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px' }}>
                    Gestiona y reclama tus códigos de descuento exclusivos para armar tu setup.
                  </p>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #090d14 0%, #0e131f 100%)', border: '1px dashed rgba(56, 189, 248, 0.3)', borderRadius: '12px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-card)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', left: '-10px', top: 'calc(50% - 10px)', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--bg-app-base)' }}></div>
                  <div style={{ position: 'absolute', right: '-10px', top: 'calc(50% - 10px)', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--bg-app-base)' }}></div>

                  <div style={{ paddingLeft: '15px' }}>
                    <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Cupón de Bienvenida
                    </span>
                    <h3 style={{ color: '#fff', margin: '8px 0 4px 0', fontSize: '18px', fontWeight: '600' }}>15% de Descuento Global</h3>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '13px' }}>Válido para cualquier componente de hardware o periférico.</p>
                  </div>

                  <div style={{ textAlign: 'right', paddingRight: '15px' }}>
                    <div style={{ background: '#06090f', border: '1px dashed rgba(255, 255, 255, 0.1)', padding: '8px 16px', borderRadius: '6px', color: '#38bdf8', fontFamily: 'monospace', fontSize: '16px', fontWeight: '700', letterSpacing: '1px' }}>
                      FASTNEW15
                    </div>
                    <small style={{ color: '#10b981', display: 'block', marginTop: '6px', fontSize: '11px', fontWeight: '500' }}>
                      <i className="fa-solid fa-circle-check" style={{ marginRight: '4px' }}></i> Listo para usar
                    </small>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SECCIÓN 3: CONFIGURADOR DE PC */}
            {seccionActiva === 'build' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="premium-data-view">
                <h2 style={{color:'#fff', margin: 0}}>Configura tu PC</h2>
                <p style={{color: 'var(--text-secondary)', marginTop: '4px'}}>Módulo de ensamble personalizado en desarrollo.</p>
              </motion.div>
            )}

            {/* SECCIÓN 4: COMPONENTE DE MIS PEDIDOS MODULAR */}
            {seccionActiva === 'compras' && (
              <MisPedidos misCompras={misCompras} setSeccionActiva={setSeccionActiva} />
            )}

          </AnimatePresence>
        </main>

        {/* 🛒 Control del Carrito Acoplado de forma Completa */}
        <StoreCart 
          carrito={carrito} 
          eliminarDelCarrito={eliminarDelCarrito} 
          manejarCompraReal={manejarCompraReal} 
          totalCuenta={totalCuenta} 
          totalBruto={totalBruto} 
          montoDescuento={descuentoEfectuado} 
          cuponActivo={cuponActivo} 
          setCuponActivo={setCuponActivo} 
          totalArticulos={totalArticulos} 
          codigoIngresado={codigoIngresado} 
          setCodigoIngresado={setCodigoIngresado} 
          aplicarCupon={aplicarCupon} 
        />
      </div>
    </div>
  );
}