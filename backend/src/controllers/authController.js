const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ==========================================================================
// 1. REGISTRO DE USUARIOS GLOBAL (CREAR OPERADOR)
// ==========================================================================
exports.registrar = async (req, res) => {
    const { nombre, correo, password, rol } = req.body;

    if (!nombre || !correo || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    try {
        const [existe] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
        if (existe.length > 0) {
            return res.status(400).json({ error: 'El correo ya está registrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(password, salt);
        const rolUsuario = rol || 'cliente';

        const [resultado] = await db.query(
            'INSERT INTO usuarios (nombre, correo, password, rol) VALUES (?, ?, ?, ?)',
            [nombre, correo, passwordEncriptada, rolUsuario]
        );

        res.status(201).json({
            mensaje: 'Usuario registrado con éxito.',
            success: true,
            id: resultado.insertId,
            usuario: {
                id: resultado.insertId,
                nombre: nombre,
                correo: correo,
                rol: rolUsuario
            }
        });
    } catch (err) {
        console.error("Error al registrar:", err);
        res.status(500).json({ error: 'Error al registrar al usuario.' });
    }
};

// ==========================================================================
// 2. LOGIN DE USUARIOS (CON DIAGNÓSTICO DE AUDITORÍA)
// ==========================================================================
exports.login = async (req, res) => {
    const { correo, password } = req.body;

    console.log("-----------------------------------------");
    console.log(`📡 [LOGIN] Petición recibida para el correo: ${correo}`);

    if (!correo || !password) {
        return res.status(400).json({ error: 'Correo y contraseña obligatorios.' });
    }

    try {
        const [usuarios] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
        
        if (usuarios.length === 0) {
            console.log("🚨 [LOGIN] Usuario no encontrado en la base de datos.");
            return res.status(401).json({ error: 'Credenciales incorrectas.' });
        }

        const usuario = usuarios[0];
        const passwordCorrecta = await bcrypt.compare(password, usuario.password);
        if (!passwordCorrecta) {
            console.log("🚨 [LOGIN] Contraseña incorrecta.");
            return res.status(401).json({ error: 'Credenciales incorrectas.' });
        }

        console.log(`✅ [LOGIN] Credenciales válidas para: ${usuario.nombre}. Intentando auditoría...`);

        // 🛡️ EXTRACCIÓN AUTOMÁTICA DE DATOS DE RED Y ENTORNO
        let ip_direccion = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        
        if (ip_direccion.includes('::ffff:')) {
            ip_direccion = ip_direccion.split('::ffff:')[1];
        } else if (ip_direccion === '::1') {
            ip_direccion = '127.0.0.1';
        }

        let dispositivoRaw = req.headers['user-agent'] || 'Terminal Desconocida';
        let dispositivo = dispositivoRaw;
        if (dispositivoRaw.includes('Chrome') && dispositivoRaw.includes('Linux')) {
            dispositivo = 'Google Chrome (Linux/Ubuntu)';
        } else if (dispositivoRaw.includes('Chrome') && dispositivoRaw.includes('Windows')) {
            dispositivo = 'Google Chrome (Windows)';
        } else if (dispositivoRaw.includes('Firefox')) {
            dispositivo = 'Mozilla Firefox';
        } else if (dispositivo.length > 100) {
            dispositivo = dispositivoRaw.substring(0, 100) + '...';
        }

        // Ejecutar inserción monitorizada en MariaDB
        try {
            console.log(`🔨 [MARIADB] Ejecutando INSERT en historial_accesos para UID: ${usuario.id}...`);
            
            const [resAudit] = await db.query(
                'INSERT INTO historial_accesos (usuario_id, nombre_usuario, ip_direccion, dispositivo) VALUES (?, ?, ?, ?)',
                [usuario.id, usuario.nombre, ip_direccion, dispositivo]
            );
            
            console.log(`✅ [MARIADB] ¡Inserción exitosa! ID del log generado: #${resAudit.insertId}`);
        } catch (auditErr) {
            console.error("❌ [MARIADB ERROR] La consulta falló por completo:", auditErr);
        }

        // Generación estándar del token de sesión seguro (JWT)
        const secreto = process.env.JWT_SECRET || 'fastech_secret_key_2026';
        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol },
            secreto,
            { expiresIn: '2h' }
        );

        console.log("➡️ [LOGIN] Enviando respuesta exitosa al frontend con Token.");
        console.log("-----------------------------------------");

        res.json({
            mensaje: 'Inicio de sesión exitoso.',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol
            }
        });

    } catch (err) {
        console.error("💥 [ERROR CRÍTICO EN LOGIN]:", err);
        res.status(500).json({ error: 'Error al iniciar sesión.' });
    }
};

// ==========================================================================
// 3. OBTENER LISTA DE USUARIOS (READ DEL CRUD)
// ==========================================================================
exports.obtenerUsuarios = async (req, res) => {
    try {
        const [usuarios] = await db.query('SELECT id, nombre, correo, rol FROM usuarios ORDER BY id DESC');
        res.json(usuarios);
    } catch (err) {
        console.error("Error al obtener usuarios:", err);
        res.status(500).json({ error: 'Error al obtener usuarios.' });
    }
};

// ==========================================================================
// 4. ACTUALIZAR OPERADOR COMPLETO (UPDATE DEL CRUD)
// ==========================================================================
exports.actualizarUsuario = async (req, res) => {
    const { id } = req.params;
    const { nombre, correo, rol, password } = req.body;

    if (!nombre || !correo || !rol) {
        return res.status(400).json({ error: 'Nombre, correo y rol son campos requeridos.' });
    }

    try {
        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            const passwordEncriptada = await bcrypt.hash(password, salt);
            
            await db.query(
                'UPDATE usuarios SET nombre = ?, correo = ?, rol = ?, password = ? WHERE id = ?',
                [nombre, correo, rol, passwordEncriptada, id]
            );
        } else {
            await db.query(
                'UPDATE usuarios SET nombre = ?, correo = ?, rol = ? WHERE id = ?',
                [nombre, correo, rol, id]
            );
        }

        res.json({ mensaje: '¡Operador sincronizado y actualizado con éxito!' });
    } catch (err) {
        console.error("Error al actualizar usuario:", err);
        res.status(500).json({ error: 'Fallo operativo al actualizar los parámetros en MariaDB.' });
    }
};

// ==========================================================================
// 5. ELIMINAR USUARIO DE LA BASE DE DATOS (DELETE DEL CRUD)
// ==========================================================================
exports.eliminarUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
        res.json({ mensaje: 'Usuario eliminado correctamente.' });
    } catch (err) {
        console.error("Error al eliminar usuario:", err);
        res.status(500).json({ error: 'No se pudo eliminar al usuario.' });
    }
};

// ==========================================================================
// 6. CONTROLADORES DE AUDITORÍA Y REGISTRO DE TRÁFICO
// ==========================================================================
exports.registrarAcceso = async (req, res) => {
    const { usuario_id, nombre_usuario, ip_direccion, dispositivo } = req.body;
    try {
        await db.query(
            'INSERT INTO historial_accesos (usuario_id, nombre_usuario, ip_direccion, dispositivo) VALUES (?, ?, ?, ?)',
            [usuario_id, nombre_usuario, ip_direccion || 'Desconocido', dispositivo || 'Desconocido']
        );
        res.json({ mensaje: 'Acceso registrado correctamente.' });
    } catch (err) {
        console.error("Error al registrar acceso:", err);
        res.status(500).json({ error: 'No se pudo guardar la auditoría.' });
    }
};

exports.obtenerAccesos = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM historial_accesos ORDER BY fecha_ingreso DESC LIMIT 50');
        res.json(rows);
    } catch (err) {
        console.error("Error al obtener bitácora de accesos:", err);
        res.status(500).json({ error: 'No se pudo obtener el historial de seguridad.' });
    }
};