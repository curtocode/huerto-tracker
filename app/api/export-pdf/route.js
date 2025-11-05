import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import PDFDocument from "pdfkit/js/pdfkit.standalone.js"; // ✅ Usa versión standalone
import fs from "fs";
import path from "path";
import Compra from "@/models/Compra"; // Tu modelo

const uri = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

async function connect() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
}

function getUserFromToken(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function generatePDF(compras, user) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    // ✅ Crear documento PDF (usa versión standalone para evitar Helvetica.afm)
    const doc = new PDFDocument({ margin: 40 });

    // ✅ Ruta de fuente personalizada
    const fontPath = path.join(process.cwd(), "public", "fonts", "Roboto-Regular.ttf");
    if (fs.existsSync(fontPath)) {
      doc.registerFont("Roboto", fs.readFileSync(fontPath));
      doc.font("Roboto");
    } else {
      console.warn("⚠️ No se encontró la fuente Roboto-Regular.ttf en /public/fonts");
    }

    // ✅ Captura del PDF en memoria
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // -------------------
    // Encabezado
    // -------------------
    doc.fontSize(20).text("Historial de Compras", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`email: ${user.email}`, { align: "center" });
    doc.moveDown(2);

    // -------------------
    // Tabla de compras
    // -------------------
    doc.fontSize(12).text("Detalles de las compras:", { underline: true });
    doc.moveDown();
    doc.text("Producto".padEnd(30) + "Precio (€)");
    doc.moveDown(0.5);

    let total = 0;
    compras.forEach((c) => {
      total += c.precio;
      doc.text(`${(c.nombre || "Sin nombre").padEnd(30)} ${c.precio.toFixed(2)}`);
    });

    doc.moveDown(2);
    doc.fontSize(14).text(`Total: ${total.toFixed(2)} €`, { align: "right" });

    // -------------------
    // Finalizar documento
    // -------------------
    doc.end();
  });
}

export async function GET(req) {
  try {
    await connect();

    const user = getUserFromToken(req);
    if (!user)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    // ✅ Buscar compras del usuario autenticado
    const compras = await Compra.find({ userId: user.id });
    if (!compras.length)
      return NextResponse.json(
        { error: "No hay compras registradas" },
        { status: 404 }
      );

    // ✅ Generar PDF
    const pdfBuffer = await generatePDF(compras, user);

    // ✅ Devolver respuesta con archivo
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=compras-${user.email}.pdf`,
      },
    });
  } catch (error) {
    console.error("Error generando PDF:", error);
    return NextResponse.json({ error: "Error generando PDF" }, { status: 500 });
  }
}
