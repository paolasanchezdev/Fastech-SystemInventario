# ⚡ Fastech Platform — Full-Stack Hardware E-Commerce & ERP Inventory System

Fastech es una plataforma Full-Stack desarrollada para la administración de inventario, ventas y gestión de usuarios dentro de un entorno de comercio electrónico orientado a hardware y tecnología.

El sistema implementa una arquitectura desacoplada basada en APIs RESTful, permitiendo la comunicación entre un frontend moderno desarrollado con React.js y un backend construido con Node.js, Express y MariaDB.

Además de la gestión comercial, la plataforma incorpora módulos administrativos, control de sesiones, carga segura de imágenes, generación de comprobantes PDF y monitoreo de actividad dentro del sistema.

---

# 🛠️ Stack Tecnológico

## 🖥️ Frontend

- **React.js** → Construcción de interfaces dinámicas mediante componentes reutilizables.
- **Vite** → Entorno de desarrollo rápido con Hot Module Replacement (HMR).
- **Tailwind CSS** → Diseño responsive y sistema de estilos utilitarios.
- **Context API** → Manejo global del estado de autenticación y carrito.
- **React Router DOM** → Navegación dinámica entre módulos y vistas.
- **Axios / Fetch API** → Comunicación asíncrona con la API REST.

---

## ⚙️ Backend

- **Node.js** → Entorno de ejecución del servidor.
- **Express.js** → Framework para construcción de APIs RESTful.
- **Multer** → Gestión y validación de carga de imágenes.
- **Middleware personalizado** → Protección de rutas y validaciones.
- **PDFKit** → Generación de comprobantes PDF dinámicos.

---

## 🗄️ Base de Datos

- **MariaDB Server**
- Motor transaccional **InnoDB**
- Relaciones mediante llaves foráneas (`FOREIGN KEY`)
- Consultas agregadas (`SUM`, `COUNT`, `GROUP BY`)
- Persistencia de ventas, usuarios y auditorías
- Gestión de stock en tiempo real

---

# 📸 Documentación Visual del Sistema

# 🛒 Módulo Comercial — Vista Cliente

---

## 1️⃣ Catálogo General de Productos

El catálogo muestra productos registrados dinámicamente desde la base de datos, permitiendo visualizar disponibilidad, precios e información detallada del hardware.

<p align="center">
  <img src="frontend/public/screenshots/01-store-catalog.png" width="900">
</p>

---

## 2️⃣ Sistema de Cupones y Descuentos

El sistema permite aplicar cupones de descuento directamente sobre el carrito mediante manejo global de estados con Context API.

<p align="center">
  <img src="frontend/public/screenshots/02-store-coupons-view.png" width="900">
</p>

---

## 3️⃣ Historial de Pedidos

Los usuarios autenticados pueden consultar todas sus compras realizadas anteriormente junto a sus comprobantes correspondientes.

<p align="center">
  <img src="frontend/public/screenshots/03-store-orders-history.png" width="900">
</p>

---

## 4️⃣ Facturación Electrónica PDF

Después de completar una compra, el sistema genera automáticamente un comprobante PDF con el detalle completo de la transacción.

<p align="center">
  <img src="frontend/public/screenshots/04-store-invoice-pdf.png" width="900">
</p>

---

# 📦 Panel Administrativo (ERP Dashboard)

---

## 5️⃣ Gestión de Inventario

El administrador puede agregar, editar y eliminar productos desde el panel administrativo.

Las imágenes son procesadas mediante Multer y almacenadas correctamente para su visualización dentro del sistema.

<p align="center">
  <img src="frontend/public/screenshots/05-admin-inventory.png" width="900">
</p>

---

## 6️⃣ Dashboard Financiero y Analítica

El dashboard administrativo muestra estadísticas generales del sistema, métricas financieras y visualización de ventas.

<p align="center">
  <img src="frontend/public/screenshots/06-admin-sales-dashboard.png" width="900">
</p>

---

## 7️⃣ Revisión de Facturas y Ventas

El administrador puede visualizar el detalle completo de cada venta mediante modales dinámicos dentro del dashboard.

<p align="center">
  <img src="frontend/public/screenshots/07-admin-invoice-modal.png" width="900">
</p>

---

## 8️⃣ Gestión de Usuarios

Módulo administrativo para control de usuarios registrados dentro de la plataforma.

<p align="center">
  <img src="frontend/public/screenshots/08-admin-users.png" width="900">
</p>

---

# 🔐 Seguridad y Auditoría

---

## 9️⃣ Registro de Actividad y Sesiones

El sistema registra información relacionada a accesos y actividad dentro de la plataforma para fines de monitoreo y control administrativo.

<p align="center">
  <img src="frontend/public/screenshots/09-admin-audit-sessions.png" width="900">
</p>

---

## 🔟 Sistema de Autenticación

La plataforma implementa autenticación de usuarios y protección de rutas privadas para el acceso al panel administrativo.

<p align="center">
  <img src="frontend/public/screenshots/10-auth-login.png" width="900">
</p>

---

# ⚡ Funcionalidades Implementadas

- Gestión completa de inventario
- Administración de usuarios
- Sistema de autenticación
- Generación de facturas PDF
- Dashboard administrativo
- Registro de ventas
- Gestión de pedidos
- Sistema de cupones
- Carga de imágenes
- Auditoría de actividad
- Diseño responsive
- Comunicación mediante API REST

---

# 🚀 Instalación del Proyecto

## 📋 Requisitos

- Node.js v18 o superior
- MariaDB Server
- npm

---

## 1️⃣ Configuración de Base de Datos

Crear una base de datos llamada:

```sql
fastech_db
```

Importar el archivo SQL del proyecto.

---

## 2️⃣ Backend

```bash
cd backend
npm install
npm run dev
```

Crear archivo `.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=fastech_db
PORT=5000
```

---

## 3️⃣ Frontend

```bash
cd frontend
npm install
npm run dev
```

Abrir en navegador:

```text
http://localhost:5173
```

---

# 👨‍💻 Autor

Desarrollado por Karla Paola Sánchez Rodríguez.

Proyecto académico orientado al desarrollo Full-Stack, gestión de inventario y desarrollo de software.