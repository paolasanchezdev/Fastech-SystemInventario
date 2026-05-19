const db = require('../config/db'); // Tu conexión a MariaDB basada en Promesas

exports.crearVenta = async (req, res) => {
  const { usuario_id, total, productos, cupon_id } = req.body;

  if (!usuario_id || !total || !productos || productos.length === 0) {
    return res.status(400).json({ error: 'Datos de la orden incompletos.' });
  }

  let conexion;

  try {
    conexion = await db.getConnection();
    await conexion.beginTransaction();

    console.log("📦 [NUEVA ORDEN] Iniciando validación de stock para productos:", productos);

    // 1. VALIDACIÓN PREVIA: Asegurar que hay existencias de CADA producto antes de tocar nada
    for (const p of productos) {
      const idDelProducto = p.id || p.producto_id;
      const cantidadSolicitada = parseInt(p.cantidad || 1, 10);

      if (!idDelProducto) {
        throw new Error("Estructura de producto inválida: Falta el ID en el objeto enviado por React.");
      }

      // Consultar las existencias reales en la tabla 'productos'
      const [rows] = await conexion.query("SELECT stock, nombre FROM productos WHERE id = ?", [idDelProducto]);
      
      if (rows.length === 0) {
        throw new Error(`El componente con ID #${idDelProducto} no existe en la base de datos.`);
      }

      const { stock, nombre } = rows[0];

      if (stock < cantidadSolicitada) {
        throw new Error(`Stock insuficiente para "${nombre}". Disponibles en MariaDB: ${stock}, Solicitados: ${cantidadSolicitada}`);
      }
    }

    // 2. INSERTAR CABECERA: Registrar los datos globales de la venta
    const queryVenta = "INSERT INTO ventas (usuario_id, total) VALUES (?, ?)";
    const [resultVenta] = await conexion.query(queryVenta, [usuario_id, total]);
    const ventaId = resultVenta.insertId;
    console.log(`📑 Ticket de cabecera registrado con éxito. ID de Venta generado: #FT-${ventaId}`);

    // 3. INSERTAR DETALLES: Guardar el desglose de lo vendido en 'detalle_ventas'
    const placeholders = productos.map(() => "(?, ?, ?, ?)").join(", ");
    const queryDetalle = `INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario) VALUES ${placeholders}`;
    
    const valoresDetalle = [];
    productos.forEach(p => {
      const idDelProducto = p.id || p.producto_id;
      valoresDetalle.push(ventaId, idDelProducto, p.cantidad, p.precio);
    });

    await conexion.query(queryDetalle, valoresDetalle);
    console.log(`📂 Artículos del carrito enlazados al Ticket #${ventaId}`);

    // 4. 🔥 ACTUAlIZACIÓN DIRECTA EN DB: Restar las cantidades del inventario global
    console.log("⚡ [INVENTARIO] Aplicando descuentos directos en las tablas de MariaDB...");
    for (const p of productos) {
      const idDelProducto = p.id || p.producto_id;
      const cantidadComprada = parseInt(p.cantidad || 1, 10);

      // Sentencia SQL encargada de realizar la resta matemática en el motor de la BD
      const queryRestarStock = "UPDATE productos SET stock = stock - ? WHERE id = ?";
      const [resultadoUpdate] = await conexion.query(queryRestarStock, [cantidadComprada, idDelProducto]);
      
      console.log(`📉 Stock reducido -> ID Artículo: ${idDelProducto} | Cantidad restada: ${cantidadComprada} | Filas afectadas: ${resultadoUpdate.affectedRows}`);
    }

    // 5. CONTROL DEL CUPÓN: Si se aplicó uno, marcarlo como quemado (usado = 1)
    if (cupon_id) {
      const queryActualizarCupon = "UPDATE cupones SET usado = 1 WHERE id = ? AND usuario_id = ?";
      await conexion.query(queryActualizarCupon, [cupon_id, usuario_id]);
      console.log(`🎟️ Cupón ID #${cupon_id} desactivado de forma segura.`);
    }

    // Si todas las sentencias se completaron con éxito, disparamos los cambios físicos
    await conexion.commit();
    console.log(`🚀 [TRANSACCIÓN EXITOSA] Todo guardado y restado en MariaDB para el Ticket #${ventaId}.`);
    
    res.status(201).json({ 
      mensaje: 'Orden procesada con éxito y stock actualizado en MariaDB.', 
      ventaId 
    });

  } catch (error) {
    console.error("❌ [ERROR CRÍTICO EN TRANSACCIÓN]:", error.message);
    
    // Si la base de datos llegó a abrirse, borramos cualquier rastro del intento fallido
    if (conexion) {
      await conexion.rollback();
      console.log("🔄 Rollback ejecutado de forma segura. La base de datos no sufrió modificaciones corruptas.");
    }
    
    // Respondemos a React con la causa real exacta del error
    res.status(500).json({ error: error.message || 'Error interno al procesar la venta en el servidor.' });
  } finally {
    if (conexion) {
      conexion.release(); // Devolvemos la conexión al pool
    }
  }
};

// --- MÉTODOS DE BÚSQUEDA OPTIMIZADOS CON LEFT JOIN CON DATA COMPLETA ---

exports.obtenerVentas = async (req, res) => {
  try {
    const query = `
      SELECT 
        v.id, 
        v.usuario_id, 
        v.total, 
        v.fecha, 
        u.nombre AS cliente 
      FROM ventas v
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      ORDER BY v.fecha DESC
    `;
    const [results] = await db.query(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.obtenerVentasPorUsuario = async (req, res) => {
  const { usuario_id } = req.params;
  try {
    const query = `
      SELECT 
        v.id, 
        v.usuario_id, 
        v.total, 
        v.fecha, 
        u.nombre AS cliente 
      FROM ventas v
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.usuario_id = ?
      ORDER BY v.fecha DESC
    `;
    const [results] = await db.query(query, [usuario_id]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.obtenerDetalleVenta = async (req, res) => {
  const { venta_id } = req.params;
  try {
    const query = "SELECT dv.id, dv.venta_id, dv.producto_id, dv.cantidad, dv.precio_unitario, p.nombre AS nombre, p.nombre AS nombre_producto FROM detalle_ventas dv LEFT JOIN productos p ON dv.producto_id = p.id WHERE dv.venta_id = ?";
    const [results] = await db.query(query, [venta_id]);
    
    console.log(`🔍 [DETALLE TICKET #${venta_id}] Enviando a React con nombres:`, results);
    res.json(results);
  } catch (err) {
    console.error("❌ Error en obtenerDetalleVenta:", err);
    res.status(500).json({ error: err.message });
  }
};