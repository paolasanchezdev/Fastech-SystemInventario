const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController'); 
const multer = require('multer');
const path = require('path');

// 📸 Configuración de almacenamiento directo en el Public de React (Inmune a IPs)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // ✅ SOLUCIÓN: Subimos 3 niveles para salir de routes/src/backend y saltar a frontend
        cb(null, path.join(__dirname, '../../../frontend/public/productos')); 
    },
    filename: (req, file, cb) => {
        // Mantiene tu lógica perfecta: Fecha actual + extensión original para evitar duplicados
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// ==========================================================================
// 🛒 ENDPOINTS DEL SISTEMA DE INVENTARIO Y TIENDA
// ==========================================================================

router.get('/', productoController.obtenerProductos);
router.post('/comprar', productoController.procesarCompra);
router.get('/estadisticas', productoController.obtenerEstadisticasVentas);
router.post('/agregar', upload.single('imagen'), productoController.crearProducto); 
router.put('/:id', upload.single('imagen'), productoController.actualizarProducto);

// 🗑️ CONEXIÓN DE AUDITORÍA Y BAJA DEL CRUD (ELIMINAR EN MARIADB)
// Escucha en: DELETE http://localhost:5000/api/productos/:id
router.delete('/:id', productoController.eliminarProducto);

module.exports = router;