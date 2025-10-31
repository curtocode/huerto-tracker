import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Compra from "@/models/Compra";

const uri = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || "supersecreto";

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

export async function GET(req) {
  await connect();
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const compras = await Compra.find({ userId: user.id }).sort({ createdAt: -1 });
  return NextResponse.json(compras);
}

export async function POST(req) {
  await connect();
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const data = await req.json();
  const compra = new Compra({ ...data, userId: user.id });
  await compra.save();
  return NextResponse.json(compra);
}
export async function DELETE(req) {
  await connect();
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID no proporcionado" }, { status: 400 });
  await Compra.deleteOne({ _id: id, userId: user.id });
  return NextResponse.json({ message: "Compra eliminada" });
}
export async function PUT(req) {
  await connect();
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const data = await req.json();
  const { id, ...updateData } = data;
  if (!id) return NextResponse.json({ error: "ID no proporcionado" }, { status: 400 });
  const compra = await Compra.findOneAndUpdate(
    { _id: id, userId: user.id },
    updateData,
    { new: true }
  );
  return NextResponse.json(compra);
}
