import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; // Importación directa del plugin

export const descargarTicketPDF = (compra, articulos) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // 🎨 Paleta de colores Dark-Premium adaptada para impresión limpia
  const COLOR_PRIMARIO = [17, 24, 39];    // Gris ultra oscuro (#111827)
  const COLOR_ACCENTO = [56, 189, 248];   // Cian Neón (#38bdf8)
  const COLOR_TEXTO = [51, 65, 85];       // Gris pizarra (#334155)

  const marginX = 15;
  let currentY = 15;

  // ==========================================
  // ENCABEZADO (BANNER SUPERIOR)
  // ==========================================
  doc.setFillColor(...COLOR_PRIMARIO);
  doc.rect(0, 0, 210, 38, 'F'); 

  // Nombre de la marca
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...COLOR_ACCENTO);
  doc.text('FASTECH', marginX, 16);

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text('SOLUCIONES TECNOLÓGICAS Y COMPONENTES', marginX, 22);
  doc.text('San Salvador, El Salvador', marginX, 27);

  // Datos del Ticket a la derecha
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(`TICKET #FT-${compra.id}`, 195, 16, { align: 'right' });

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  const fechaFormateada = compra.fecha ? new Date(compra.fecha).toLocaleString('es-SV') : new Date().toLocaleString('es-SV');
  doc.text(`Emisión: ${fechaFormateada}`, 195, 24, { align: 'right' });
  doc.text('Estado: Liquidado / Entregado', 195, 29, { align: 'right' });

  currentY = 48;

  // ==========================================
  // DETALLES DEL RECEPTOR
  // ==========================================
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_PRIMARIO);
  doc.text('DETALLES DEL RECEPTOR', marginX, currentY);
  
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(marginX, currentY + 2, 195, currentY + 2);

  currentY += 8;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLOR_TEXTO);
  doc.text(`Cliente de Cuenta: ${compra.cliente || 'Usuario Autenticado'}`, marginX, currentY);
  doc.text(`Método de Pago: Transacción Electrónica Directa`, marginX, currentY + 5);

  currentY += 15;

  // ==========================================
  // TABLA DE ARTÍCULOS (USANDO EL PLUGIN DIRECTO)
  // ==========================================
  const columnas = [
    { header: 'ID', dataKey: 'id' },
    { header: 'COMPONENTE / PRODUCTO', dataKey: 'nombre' },
    { header: 'CANTIDAD', dataKey: 'cantidad' },
    { header: 'PRECIO U.', dataKey: 'precio' },
    { header: 'SUBTOTAL', dataKey: 'subtotal' }
  ];

  const filas = articulos.map((item, index) => {
    const precio = parseFloat(item.precio_unitario || item.precio || 0);
    const cantidad = parseInt(item.cantidad || 1);
    return {
      id: item.producto_id || index + 1,
      nombre: item.nombre_producto || item.nombre || 'Componente de Hardware',
      cantidad: `${cantidad} u.`,
      precio: `$${precio.toFixed(2)}`,
      subtotal: `$${(precio * cantidad).toFixed(2)}`
    };
  });

  // Forzamos la renderización usando la función directa de autoTable
  autoTable(doc, {
    startY: currentY,
    columns: columnas,
    body: filas,
    margin: { left: marginX, right: marginX },
    theme: 'striped',
    headStyles: {
      fillColor: COLOR_PRIMARIO,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left'
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      textColor: COLOR_TEXTO
    },
    columnStyles: {
      id: { width: 15 },
      cantidad: { halign: 'center', width: 25 },
      precio: { halign: 'right', width: 25 },
      subtotal: { halign: 'right', width: 25 }
    },
    didDrawPage: (data) => {
      currentY = data.cursor.y + 12;
    }
  });

  // ==========================================
  // RESUMEN DE TOTALES
  // ==========================================
  const totalFacturado = parseFloat(compra.total || 0).toFixed(2);
  
  doc.setFillColor(248, 250, 252);
  doc.rect(130, currentY, 65, 14, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(130, currentY, 65, 14, 'S');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLOR_TEXTO);
  doc.text('TOTAL NETO:', 134, currentY + 9);

  doc.setFontSize(12);
  doc.setTextColor(16, 185, 129); 
  doc.text(`$${totalFacturado}`, 191, currentY + 9, { align: 'right' });

  // Pie de página administrativo
  currentY += 28;
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Este documento sirve como comprobante digital de la compra realizada en el módulo local de Fastech.', 105, currentY, { align: 'center' });
  doc.text('Gracias por su confianza en nuestros servicios de hardware y desarrollo.', 105, currentY + 4, { align: 'center' });

  doc.save(`Factura_FT_${compra.id}.pdf`);
};