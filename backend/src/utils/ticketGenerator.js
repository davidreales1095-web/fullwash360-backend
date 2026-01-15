const PDFDocument = require('pdfkit');
const QRCode = require('qr-image');

const generarTicket = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [80 * 2.83, 150], // 80mm ancho, alto variable
        margins: { top: 10, bottom: 10, left: 8, right: 8 }
      });
      
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer.toString('base64'));
      });
      doc.on('error', reject);
      
      // ========== ENCABEZADO ==========
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#2c3e50')
         .text('FULLWASH 360', { align: 'center' })
         .moveDown(0.3);
      
      doc.fontSize(8)
         .font('Helvetica')
         .fillColor('#7f8c8d')
         .text('Sistema de Gestión de Lavadero', { align: 'center' })
         .moveDown(0.5);
      
      // Línea separadora
      doc.strokeColor('#3498db')
         .lineWidth(1)
         .moveTo(10, doc.y)
         .lineTo(70 * 2.83, doc.y)
         .stroke()
         .moveDown(0.5);
      
      // ========== INFORMACIÓN DE LA ORDEN ==========
      doc.fontSize(9)
         .font('Helvetica-Bold')
         .fillColor('#2c3e50')
         .text(`ORDEN: ${data.numeroOrden}`, { align: 'center' })
         .moveDown(0.3);
      
      doc.fontSize(7)
         .font('Helvetica')
         .fillColor('#34495e')
         .text(`Fecha: ${data.fecha.toLocaleString('es-ES')}`)
         .moveDown(0.2);
      
      // ========== DATOS DEL VEHÍCULO ==========
      doc.font('Helvetica-Bold')
         .text('VEHÍCULO:')
         .font('Helvetica')
         .text(`Tipo: ${data.tipoVehiculo.toUpperCase()}`)
         .text(`Placa: ${data.placa}`)
         .moveDown(0.3);
      
      // ========== CONTADOR DE LAVADOS ==========
      doc.font('Helvetica-Bold')
         .fillColor('#e74c3c')
         .text('CONTADOR DE LAVADOS:', { continued: true })
         .font('Helvetica')
         .fillColor('#2c3e50')
         .text(` ${data.contador}`);
      
      // Barra de progreso visual
      const [actual, total] = data.contador.split(' de ').map(Number);
      const porcentaje = (actual / total) * 100;
      const barWidth = 50 * 2.83;
      const barHeight = 5;
      const barX = (80 * 2.83 - barWidth) / 2;
      
      // Fondo de la barra
      doc.rect(barX, doc.y + 3, barWidth, barHeight)
         .fillColor('#ecf0f1')
         .fill();
      
      // Progreso
      const progressWidth = (porcentaje / 100) * barWidth;
      doc.rect(barX, doc.y + 3, progressWidth, barHeight)
         .fillColor(porcentaje === 100 ? '#2ecc71' : '#3498db')
         .fill();
      
      doc.moveDown(1);
      
      // ========== COLABORADOR ==========
      doc.fontSize(7)
         .font('Helvetica')
         .fillColor('#7f8c8d')
         .text(`Atendido por: ${data.colaborador}`)
         .text(`Código: ${data.codigoColaborador}`)
         .moveDown(0.3);
      
      // ========== MENSAJE ESPECIAL ==========
      if (data.mensajeEspecial) {
        doc.moveDown(0.2);
        doc.fontSize(8)
           .font('Helvetica-Bold')
           .fillColor('#e74c3c')
           .text(data.mensajeEspecial, { align: 'center' })
           .moveDown(0.3);
      }
      
      // ========== QR CODE ==========
      if (data.numeroOrden) {
        try {
          const qrData = JSON.stringify({
            orden: data.numeroOrden,
            placa: data.placa,
            fecha: data.fecha.toISOString()
          });
          
          const qrPng = QRCode.imageSync(qrData, { type: 'png', size: 4 });
          doc.image(qrPng, (80 * 2.83 - 40) / 2, doc.y, { width: 40 });
          doc.moveDown(5);
        } catch (qrError) {
          console.log('QR no generado:', qrError.message);
        }
      }
      
      // ========== PIE DE PÁGINA ==========
      doc.moveDown(0.5);
      doc.fontSize(6)
         .font('Helvetica-Oblique')
         .fillColor('#95a5a6')
         .text('¡Gracias por su preferencia!', { align: 'center' })
         .text('Vuelva pronto :)', { align: 'center' });
      
      doc.end();
      
    } catch (error) {
      reject(error);
    }
  });
};

const generarTicketHTML = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 10px; }
        .ticket { width: 80mm; border: 1px dashed #ccc; padding: 10px; }
        .header { text-align: center; font-weight: bold; font-size: 14px; }
        .info { font-size: 10px; margin: 5px 0; }
        .highlight { color: #e74c3c; font-weight: bold; }
        .footer { text-align: center; font-size: 8px; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="ticket">
        <div class="header">FULLWASH 360</div>
        <div style="text-align: center; font-size: 8px;">Sistema de Gestión</div>
        <hr>
        <div class="info"><strong>ORDEN:</strong> ${data.numeroOrden}</div>
        <div class="info"><strong>Fecha:</strong> ${data.fecha.toLocaleString()}</div>
        <div class="info"><strong>Vehículo:</strong> ${data.tipoVehiculo} - ${data.placa}</div>
        <div class="info"><strong>Colaborador:</strong> ${data.colaborador} (${data.codigoColaborador})</div>
        <div class="info highlight">Lavado: ${data.contador}</div>
        ${data.mensajeEspecial ? `<div class="info highlight">${data.mensajeEspecial}</div>` : ''}
        <hr>
        <div class="footer">¡Gracias por su preferencia!<br>Vuelva pronto :)</div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { generarTicket, generarTicketHTML };