const rateLimit = require('express-rate-limit');

// ==========================================================================
// 🛡️ 1. ESCUDO CONTRA FUERZA BRUTA (BLOQUEO POR INTENTOS FALLIDOS)
// ==========================================================================
exports.limpadorLogin = rateLimit({
    windowMs: 15 * 60 * 1000, // Ventana de tiempo: 15 minutos
    max: 5, // Número máximo de intentos permitidos por dirección IP antes del bloqueo
    
    // Respuesta cyberpunk que frena al atacante de inmediato
    handler: (req, res) => {
        console.log(`🚨 [BLOQUEO SEGURIDAD] IP detectada abusando del Login: ${req.ip}`);
        return res.status(429).json({
            error: 'Demasiados intentos de inicio de sesión. Tu IP ha sido bloqueada temporalmente por 15 minutos debido a sospecha de fuerza bruta.'
        });
    },
    
    standardHeaders: true, // Envía información detallada del límite en los headers HTTP
    legacyHeaders: false,  // Desactiva los headers obsoletos (X-RateLimit-*)
});

// ==========================================================================
// 🔑 2. VERIFICACIÓN DE ROL ADMINISTRATIVO (TU ESTRUCTURA ORIGINAL)
// ==========================================================================
exports.verificarAdmin = (req, res, next) => {
    // Lee el header personalizado enviado por tu frontend en React
    const rolUsuario = req.headers['x-user-role']; 

    if (rolUsuario === 'admin') {
        next(); // ¡Permiso concedido! Continúa a la ruta (guardar, editar o eliminar)
    } else {
        console.log(`🚫 [ACCESO DENEGADO] Intento de intrusión detectado sin rol 'admin'.`);
        return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
    }
};