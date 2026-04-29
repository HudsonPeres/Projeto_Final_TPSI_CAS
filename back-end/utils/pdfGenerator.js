import PDFDocument from "pdfkit";
import QRCode from "qrcode";

const generateBookingPDF = async (booking, place) => {
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("Viva Portugal", { align: "center" });
    doc.moveDown();
    doc.fontSize(16).text("Confirmação de Reserva", { align: "center" });
    doc.moveDown();

    doc
      .strokeColor("#cccccc")
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();
    doc.moveDown();

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(`Nº da reserva: ${booking.bookingCode}`);
    doc.moveDown();

    doc.fontSize(14).font("Helvetica-Bold").text("Detalhes da experiência");
    doc.fontSize(12).font("Helvetica").text(`Título: ${place.title}`);
    doc.text(`Endereço: ${place.address}`);
    doc.text(
      `Check-in: ${new Date(booking.checkin).toLocaleDateString("pt-PT")}`,
    );
    doc.text(
      `Check-out: ${new Date(booking.checkout).toLocaleDateString("pt-PT")}`,
    );
    doc.text(`Participantes: ${booking.guests}`);
    doc.text(`Preço total: €${booking.total}`);
    doc.moveDown();

    // QR Code
    const qrBuffer = await QRCode.toBuffer(booking.bookingCode);
    doc.image(qrBuffer, { fit: [100, 100], align: "center" });
    doc.moveDown();

    doc
      .fontSize(10)
      .font("Helvetica-Oblique")
      .text(
        "Guarde este comprovativo. Apresente o QR code no momento do check-in.\n" +
          "Qualquer dúvida, contacte o anfitrião através do chat da plataforma.",
        { align: "center" },
      );

    doc.end();
  });
};

export default generateBookingPDF;
