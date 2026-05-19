const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');

router.post('/', ventaController.crearVenta);
router.get('/', ventaController.obtenerVentas);
router.get('/usuario/:usuario_id', ventaController.obtenerVentasPorUsuario);
router.get('/detalle/:venta_id', ventaController.obtenerDetalleVenta);

module.exports = router;