import React from 'react';
import { motion } from 'framer-motion';
import '../styles/Inicio.css';

export default function Inicio({ cambiarVista }) {
  
  const beneficios = [
    {
      id: 1,
      titulo: "Envíos Prioritarios",
      desc: "Despacho inmediato a nivel nacional con empaque antiestático especializado para componentes delicados.",
      icono: "fa-solid fa-bolt-lightning"
    },
    {
      id: 2,
      titulo: "Garantía de Hardware",
      desc: "Respaldo total de fábrica y soporte técnico especializado para el ensamblaje de tus componentes.",
      icono: "fa-solid fa-shield-halved"
    },
    {
      id: 3,
      titulo: "Componentes Certificados",
      desc: "Acceso exclusivo a lotes de tarjetas de video, procesadores y periféricos con stock 100% real.",
      icono: "fa-solid fa-gem"
    }
  ];

  return (
    <div className="landing-light-wrapper">
      
      {/* SECCIÓN HERO PRINCIPAL */}
      <section className="premium-hero">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hero-container"
        >
          <h1 className="hero-main-title">
            El hardware que buscas. <br />
            <span className="text-gradient">El rendimiento que necesitas.</span>
          </h1>
          
          <p className="hero-lead-text">
            Únete a Fastech Pro y obtén acceso instantáneo a nuestro centro de aprovisionamiento de componentes de alta gama. Crea tu cuenta operativa para explorar disponibilidad y gestionar tus pedidos de manera inmediata.
          </p>

          {/* ACCIÓN PRINCIPAL DIRECTA AL REGISTRO */}
          <div className="hero-cta-group">
            <button 
              onClick={() => cambiarVista('registro')} 
              className="btn-cta-primary"
            >
              Registrarse para Comprar <i className="fa-solid fa-arrow-right"></i>
            </button>
            <button 
              onClick={() => cambiarVista('login')} 
              className="btn-cta-secondary"
            >
              Ya tengo cuenta (Ingresar)
            </button>
          </div>
        </motion.div>
      </section>

      {/* SECCIÓN DE BENEFICIOS */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="section-subtitle">¿Por qué armar tu setup con nosotros?</h2>
          
          <div className="features-grid">
            {beneficios.map((item) => (
              <div key={item.id} className="feature-clean-card">
                <div className="feature-icon-box">
                  <i className={item.icono}></i>
                </div>
                <h3>{item.titulo}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>&copy; 2026 Fastech Pro Inventory. Todos los derechos reservados.</p>
      </footer>

    </div>
  );
}