const db = require('../config/db');

// ==========================================================================
// 1. OBTENER PRODUCTOS (Inyecta alertas de stock e imágenes de respaldo)
// ==========================================================================
exports.obtenerProductos = async (req, res) => {
    try {
        // Al usar SELECT * se jala automáticamente la nueva columna 'descripcion'
        const [productos] = await db.query('SELECT * FROM productos ORDER BY id DESC');
        
        const productosProcesados = productos.map(p => ({
            ...p,
            imagen: p.imagen || 'default.jpg', 
            alerta_stock: p.stock <= (p.stock_minimo || 3)
        }));
        
        res.json(productosProcesados);
    } catch (err) {
        console.error("Error al obtener productos:", err);
        res.status(500).json({ error: 'Error al obtener los productos de la base de datos.' });
    }
};

// ==========================================================================
// 2. PROCESAR COMPRA (Descuenta Stock Real de forma segura con transacciones)
// ==========================================================================
exports.procesarCompra = async (req, res) => {
    const { usuario_id, carrito, total } = req.body;

    if (!carrito || carrito.length === 0) {
        return res.status(400).json({ error: 'El carrito de compras está vacío.' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [nuevaVenta] = await connection.query(
            'INSERT INTO ventas (usuario_id, total) VALUES (?, ?)',
            [usuario_id, total]
        );
        const ventaId = nuevaVenta.insertId;

        for (const item of carrito) {
            const [prodData] = await connection.query('SELECT stock FROM productos WHERE id = ?', [item.id]);
            
            if (prodData.length === 0) {
                throw new Error(`El componente con ID #${item.id} ya no existe.`);
            }

            const stockActual = prodData[0].stock;
            if (stockActual < item.cantidad) {
                throw new Error(`Stock insuficiente para "${item.nombre}". Disponibles: ${stockActual}`);
            }

            await connection.query(
                'UPDATE productos SET stock = stock - ? WHERE id = ?',
                [item.cantidad, item.id]
            );

            await connection.query(
                'INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
                [ventaId, item.id, item.cantidad, item.precio]
            );
        }

        await connection.commit();
        res.status(201).json({ mensaje: 'Compra registrada con éxito. Inventario actualizado.', ventaId });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error("Transacción abortada debido a un fallo:", err.message);
        res.status(400).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
};

// ==========================================================================
// 3. ESTADÍSTICAS PARA LAS GRÁFICAS DEL DASHBOARD
// ==========================================================================
exports.obtenerEstadisticasVentas = async (req, res) => {
    try {
        const [graficaVentas] = await db.query(
            `SELECT DATE_FORMAT(fecha_venta, '%d/%m') as fecha, SUM(total) as ganancias 
             FROM ventas GROUP BY fecha ORDER BY fecha_venta ASC LIMIT 7`
        );
        res.json(graficaVentas);
    } catch (err) {
        console.error("Error al compilar estadísticas:", err);
        res.status(500).json({ error: 'No se pudieron procesar las métricas de venta.' });
    }
};

// ==========================================================================
// 4. CREAR NUEVO PRODUCTO (Corregido y sincronizado con MariaDB)
// ==========================================================================
exports.crearProducto = async (req, res) => {
    // 🆕 Extraemos 'descripcion' del cuerpo del formulario enviado
    const { nombre, categoria, precio, stock, stock_minimo, descripcion } = req.body;

    if (!nombre || !categoria || !precio || !stock) {
        return res.status(400).json({ error: 'Los campos Nombre, Categoría, Precio y Stock son obligatorios.' });
    }

    try {
        let urlImagen = 'default.jpg';
        if (req.file) {
            urlImagen = req.file.filename;
        } else if (req.body.imagen) {
            urlImagen = req.body.imagen;
        }

        const minimo = stock_minimo ? parseInt(stock_minimo) : 3;

        console.log("👉 [MARIADB] Intentando insertar producto nuevo:", { nombre, categoria, precio, urlImagen, stock, minimo, descripcion });

        // 🆕 Agregamos 'descripcion' tanto a las columnas del INSERT como al arreglo de valores
        const [resultado] = await db.query(
            'INSERT INTO productos (nombre, categoria, precio, imagen, stock, stock_minimo, descripcion) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nombre, categoria, parseFloat(precio), urlImagen, parseInt(stock), minimo, descripcion || null]
        );

        res.status(201).json({
            mensaje: 'Producto agregado exitosamente con su foto.',
            id: resultado.insertId
        });
    } catch (err) {
        console.error("Error crítico al crear producto en MariaDB:", err);
        res.status(500).json({ error: 'Error interno al guardar el producto en la base de datos.' });
    }
};

// ==========================================================================
// 5. ACTUALIZAR PRODUCTO EXISTENTE (Versión Corregida al 100%)
// ==========================================================================
exports.actualizarProducto = async (req, res) => {
    const { id } = req.params;
    const { nombre, categoria, precio, stock, stock_minimo, descripcion } = req.body;

    try {
        // 1. Buscamos primero la imagen que ya tiene el producto en la base de datos
        const [productoActual] = await db.query('SELECT imagen FROM productos WHERE id = ?', [id]);
        if (productoActual.length === 0) {
            return res.status(404).json({ error: 'El producto no existe en la base de datos.' });
        }

        // 2. Si viene una foto nueva de Multer la usamos, si no, mantenemos la que ya existía
        let urlImagen = productoActual[0].imagen;
        if (req.file) {
            urlImagen = req.file.filename; 
        }

        const minimo = stock_minimo ? parseInt(stock_minimo) : 3;

        console.log(`🔄 [MARIADB] Actualizando ID #${id}. Descripción a guardar:`, descripcion);

        // 3. Ejecutamos un único QUERY unificado donde TODOS los campos se actualizan en orden perfecto
        await db.query(
            'UPDATE productos SET nombre = ?, categoria = ?, precio = ?, imagen = ?, stock = ?, stock_minimo = ?, descripcion = ? WHERE id = ?',
            [nombre, categoria, parseFloat(precio), urlImagen, parseInt(stock), minimo, descripcion || null, id]
        );

        res.json({ mensaje: 'Producto actualizado con éxito.' });
    } catch (err) {
        console.error("Error al actualizar producto:", err);
        res.status(500).json({ error: 'Error interno al actualizar el producto.' });
    }
};

// ==========================================================================
// 6. ELIMINAR HARDWARE PERMANENTEMENTE (BAJA DEL CRUD)
// ==========================================================================
exports.eliminarProducto = async (req, res) => {
    const { id } = req.params;

    try {
        const [existe] = await db.query('SELECT id FROM productos WHERE id = ?', [id]);
        if (existe.length === 0) {
            return res.status(404).json({ error: 'El componente de hardware seleccionado no existe en la base de datos.' });
        }

        await db.query('DELETE FROM productos WHERE id = ?', [id]);
        
        console.log(`🗑️ [MARIADB] Artículo con ID #${id} removido con éxito por el Admin.`);
        res.json({ mensaje: 'Componente eliminado correctamente del inventario.' });
    } catch (err) {
        console.error("Error al eliminar producto de MariaDB:", err);
        res.status(500).json({ error: 'No se pudo eliminar el artículo debido a un conflicto con registros relacionados.' });
    }
};