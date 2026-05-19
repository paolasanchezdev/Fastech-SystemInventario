import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

export default function VistaInventario() {
  const [productos, setProductos] = useState([]);
  const [idEditar, setIdEditar] = useState(null);
  
  // ⚙️ Estados del Formulario (Estructura original + Nueva Descripción)
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('Procesadores'); 
  const [precio, setPrecio] = useState('');
  const [imagen, setImagen] = useState(null); 
  const [stock, setStock] = useState('');
  const [stockMinimo, setStockMinimo] = useState('3'); 
  const [descripcion, setDescripcion] = useState(''); // 🆕 Estado para la ficha técnica

  // 🆕 Estados para la inyección dinámica de nuevas categorías
  const [otraCategoria, setOtraCategoria] = useState('');
  const [mostrarInputOtra, setMostrarInputOtra] = useState(false);

  // Lista base sugerida en el select tradicional
  const categoriasSugeridas = ["Procesadores", "Tarjetas de Video", "Almacenamiento", "Memorias RAM", "Periféricos"];

  const cargarProductos = () => {
    fetch('/api/productos')
      .then(res => res.json())
      .then(setProductos)
      .catch(err => console.error("Error cargando productos:", err));
  };

  useEffect(() => { 
    cargarProductos(); 
  }, []);

 const productosStockBajo = productos.filter(p => p.stock <= (p.stock_minimo || 3));

  const manejarGuardarProducto = async (e) => {
    e.preventDefault();
    
    const categoriaFinal = categoria === "OTRA" ? otraCategoria.trim() : categoria;

    if (!categoriaFinal) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Debes especificar una categoría válida.' });
      return;
    }
    
    const datosEnviar = new FormData();
    datosEnviar.append('nombre', nombre);
    datosEnviar.append('categoria', categoriaFinal); 
    datosEnviar.append('precio', parseFloat(precio));
    datosEnviar.append('stock', parseInt(stock));
    datosEnviar.append('stock_minimo', parseInt(stockMinimo));
    datosEnviar.append('descripcion', descripcion); // 🆕 Enviamos la descripción al backend
    
    if (imagen) {
      datosEnviar.append('imagen', imagen); 
    }

    const url = idEditar ? `/api/productos/${idEditar}` : '/api/productos/agregar';
    const metodo = idEditar ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: {
          'x-user-role': 'admin' 
        },
        body: datosEnviar 
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error en la operación en MySQL");
      }

      Swal.fire({ 
        icon: 'success', 
        title: idEditar ? '🛡️ Registro Actualizado' : '📦 Componente Sincronizado', 
        background: '#121826',
        color: '#f8fafc',
        confirmButtonColor: '#22d3ee',
        timer: 1500, 
        showConfirmButton: false 
      });
      limpiarFormulario();
      cargarProductos();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, background: '#121826', color: '#f8fafc' });
    }
  };

  const eliminarProducto = async (id) => {
    const res = await Swal.fire({ 
      title: '¿Eliminar de la Base de Datos?', 
      text: "Esta acción borrará de forma permanente el hardware seleccionado.",
      icon: 'warning', 
      background: '#121826',
      color: '#f8fafc',
      showCancelButton: true, 
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (res.isConfirmed) {
      try {
        const respuestaServer = await fetch(`/api/productos/${id}`, { 
          method: 'DELETE',
          headers: {
            'x-user-role': 'admin'
          }
        });

        if (!respuestaServer.ok) {
          const errorData = await respuestaServer.json();
          throw new Error(errorData.error || "No se pudo eliminar el producto.");
        }

        cargarProductos();
        Swal.fire({ icon: 'success', title: 'Eliminado con éxito', background: '#121826', color: '#f8fafc', timer: 1000, showConfirmButton: false });
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: err.message, background: '#121826', color: '#f8fafc' });
      }
    }
  };

  const limpiarFormulario = () => {
    setIdEditar(null); 
    setNombre(''); 
    setCategoria('Procesadores');
    setOtraCategoria('');
    setMostrarInputOtra(false);
    setPrecio(''); 
    setImagen(null); 
    setStock('');
    setStockMinimo('3');
    setDescripcion(''); // 🆕 Limpiar descripción
    const inputFoto = document.getElementById('foto-input-file');
    if (inputFoto) inputFoto.value = '';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="view-wrapper">
      
      <AnimatePresence>
        {productosStockBajo.length > 0 && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.95, opacity: 0 }} 
            className="neon-stock-alert"
          >
            <span className="alert-icon-pulse">⚠️</span>
            <div className="alert-message-content">
              <strong>Alerta de Stock Crítico:</strong> Tienes {productosStockBajo.length} artículos agotándose: 
              <span className="critical-names-list"> {productosStockBajo.map(p => p.nombre).join(', ')}</span>.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="inventario-grid-layout">
        
        <section className="cyber-panel form-card-area">
          <div className="panel-header-glow">
            <h3><span>{idEditar ? '⚡ Modificar Registro' : '🛸 Nuevo Componente'}</span></h3>
            <p className="panel-subtitle">Sincronización directa con MariaDB Server</p>
          </div>
          
          <form onSubmit={manejarGuardarProducto} className="cyber-form-grid">
            
            <div className="form-item span-full">
              <label>Nombre del Dispositivo</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Memoria RAM DDR5 Corsair Vengeance" required />
            </div>

            <div className="form-item span-full">
              <label>Categoría de Hardware</label>
              <select 
                value={categoria} 
                onChange={e => {
                  const val = e.target.value;
                  setCategoria(val);
                  setMostrarInputOtra(val === 'OTRA');
                }} 
              >
                {categoriasSugeridas.map(sug => (
                  <option key={sug} value={sug}>{sug}</option>
                ))}
                <option value="OTRA">➕ Registrar Nueva Categoría...</option>
              </select>
            </div>

            <AnimatePresence>
              {mostrarInputOtra && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="form-item span-full conditional-input-box"
                >
                  <label>Nombre de la Categoría Personalizada</label>
                  <input 
                    type="text" 
                    value={otraCategoria} 
                    onChange={e => setOtraCategoria(e.target.value)} 
                    placeholder="Ej. Refrigeración Líquida, Gabinetes..." 
                    required={mostrarInputOtra} 
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* 🆕 NUEVO CAMPO: Ficha técnica / Descripción técnica (Toma el ancho completo del formulario) */}
            <div className="form-item span-full">
              <label>Especificaciones / Ficha Técnica</label>
              <textarea 
                value={descripcion} 
                onChange={e => setDescripcion(e.target.value)} 
                placeholder="Ej. Socket: AM4&#10;Núcleos: 6 | Hilos: 12&#10;Frecuencia Base: 3.7 GHz&#10;TDP: 65W" 
                rows="4"
                style={{
                  width: '100%',
                  background: '#0b0f19',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  color: '#f8fafc',
                  padding: '10px',
                  fontFamily: 'monospace',
                  resize: 'vertical'
                }}
              />
            </div>

            <div className="form-item">
              <label>Precio Unitario ($)</label>
              <input type="number" step="0.01" value={precio} onChange={e => setPrecio(e.target.value)} placeholder="0.00" required />
            </div>

            <div className="form-item">
              <label>Existencias en Almacén</label>
              <input type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="0" required />
            </div>

            <div className="form-item">
              <label>Subir Imagen</label>
              <div className="file-input-wrapper">
                <input 
                  id="foto-input-file"
                  type="file" 
                  accept="image/*" 
                  onChange={e => setImagen(e.target.files[0])} 
                />
              </div>
            </div>

            <div className="form-item">
              <label>Límite Stock Mínimo</label>
              <input type="number" value={stockMinimo} onChange={e => setStockMinimo(e.target.value)} placeholder="3" />
            </div>

            <div className="form-actions-area span-full">
              <button type="submit" className="btn-cyber-submit">
                {idEditar ? '💾 Guardar Cambios' : '🚀 Sincronizar en MariaDB'}
              </button>
              {idEditar && (
                <button type="button" onClick={limpiarFormulario} className="btn-cyber-cancel">
                  Cancelar Operación
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="cyber-panel table-card-area">
          <div className="panel-header-glow">
            <h3><span>📊 Registros Activos en Inventario</span></h3>
            <p className="panel-subtitle">Total de componentes enlazados: {productos.length}</p>
          </div>
          
          <div className="cyber-table-scroll">
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Miniatura</th>
                  <th>Detalle Componente</th>
                  <th>Precio Ref.</th>
                  <th>Stock Físico</th>
                  <th style={{ textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(p => {
                  const esCritico = p.stock <= (p.stock_minimo || 3);
                  return (
                    <tr key={p.id} className={esCritico ? 'row-critical-alert' : ''}>
                      <td className="cell-id">#{p.id}</td>
                      
                      <td>
                        <div className="image-table-container">
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
                            <span className="fallback-table-icon">📷</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="product-meta-cell">
                          <span className="product-title-text">{p.nombre}</span>
                          <span className="product-badge-category">{p.categoria}</span>
                        </div>
                      </td>
                      
                      <td className="cell-price">${parseFloat(p.precio).toFixed(2)}</td>
                      
                      <td>
                        <span className={`cyber-pill ${esCritico ? 'pill-danger' : 'pill-normal'}`}>
                          {p.stock} unidades
                        </span>
                      </td>
                      
                      <td>
                        <div className="actions-table-flex">
                          <button onClick={() => { 
                            setIdEditar(p.id); 
                            setNombre(p.nombre); 
                            
                            if (!categoriasSugeridas.includes(p.categoria)) {
                              setCategoria('OTRA');
                              setOtraCategoria(p.categoria);
                              setMostrarInputOtra(true);
                            } else {
                              setCategoria(p.categoria);
                              setMostrarInputOtra(false);
                            }

                            setPrecio(p.precio); 
                            setImagen(null); 
                            setStock(p.stock); 
                            setStockMinimo(p.stock_minimo || '3');
                            setDescripcion(p.descripcion || ''); // 🆕 Sincroniza la descripción en los inputs al editar
                          }} className="btn-table-edit" title="Editar Componente">
                            ✏️
                          </button>
                          <button onClick={() => eliminarProducto(p.id)} className="btn-table-delete" title="Remover de Base de Datos">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </motion.div>
  );
}