const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Tu conexión a MariaDB

// GET: Obtener cupones activos de un usuario que no hayan expirado
router.get('/usuario/:usuarioId', (req, res) => {
  const { usuarioId } = req.params;

  // Filtrado directo en MariaDB: No usados y con fecha mayor a este instante
  const query = `
    SELECT id, codigo, descuento, usado, descripcion, fecha_expiracion 
    FROM cupones 
    WHERE usuario_id = ? AND usado = 0 AND fecha_expiracion > NOW()
  `;

  db.query(query, [usuarioId], (err, results) => {
    if (err) {
      console.error("Error al obtener cupones:", err);
      return res.status(500).json({ error: "Error interno del servidor al consultar cupones." });
    }
    res.json(results);
  });
});

module.exports = router;