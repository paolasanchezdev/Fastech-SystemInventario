const mysql = require('mysql2');
require('dotenv').config();

// Cambiamos a createPool y usamos /promise para que tus async/await funcionen perfectamente
const db = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 4000
}).promise(); // <-- ¡Esta es la magia que evitará el error de la terminal!

// Verificación rápida de la conexión
db.getConnection()
  .then((conn) => {
    console.log('🛢️ ¡Conexión establecida con éxito en MariaDB con Promesas!');
    conn.release();
  })
  .catch((err) => {
    console.error('❌ ERROR CRÍTICO AL CONECTAR A MARIADB:', err.message);
    console.error('Código de error:', err.code);
  });

module.exports = db;