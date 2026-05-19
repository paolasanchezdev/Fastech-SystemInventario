const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware globales obligatorios
app.use(cors());
app.use(express.json());

// 🔌 IMPORTACIÓN DE RUTAS BLINDADAS (Rutas absolutas para Linux)
const authRoutes = require(path.join(__dirname, 'routes', 'authRoutes'));
const productoRoutes = require(path.join(__dirname, 'routes', 'productoRoutes'));
const ventaRoutes = require(path.join(__dirname, 'routes', 'ventaRoutes')); 
const cuponesRoutes = require(path.join(__dirname, 'routes', 'cuponesRoutes'));

// 🛣️ ENLAZAR RUTAS A LA API
app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/ventas', ventaRoutes); 
app.use('/api/cupones', cuponesRoutes);

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo perfectamente en el puerto ${PORT}`);
});