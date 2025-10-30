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
