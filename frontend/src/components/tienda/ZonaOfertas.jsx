import React from 'react';
import { motion } from 'framer-motion';

export default function ZonaOfertas() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="premium-data-view"
    >
      <h2 style={{ color: '#fff', margin: '0 0 8px 0' }}>Zona de Ofertas</h2>
      <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>
        Próximamente verás los componentes con los descuentos más agresivos del mercado.
      </p>
    </motion.div>
  );
}