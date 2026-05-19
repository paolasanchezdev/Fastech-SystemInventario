const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); 

// 🛡️ Importamos el limitador perimetral desde tu archivo de middlewares
// (Asegúrate de que la ruta hacia tu carpeta de middlewares coincida con tu estructura)
const { limpadorLogin } = require('../middlewares/authMiddleware');

// ==========================================================================
// 🔑 RUTAS DE AUTENTICACIÓN - OPERACIONES DEL CRUD DE USUARIOS
// ==========================================================================

router.post('/registrar', authController.registrar);

// 🛸 Inyectamos el escudo justo aquí, antes de que la petición toque al controlador
router.post('/login', limpadorLogin, authController.login); 

router.get('/usuarios', authController.obtenerUsuarios);
router.put('/usuarios/:id', authController.actualizarUsuario); // ⚡ Única ruta PUT para el CRUD completa
router.delete('/usuarios/:id', authController.eliminarUsuario);

// ==========================================================================
// 🛡️ RUTAS DE AUDITORÍA Y BITÁCORA DE ACCESOS
// ==========================================================================

router.get('/historial-accesos', authController.obtenerAccesos); 

module.exports = router;