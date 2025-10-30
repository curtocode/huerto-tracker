import { NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/models/User";

const uri = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || "supersecreto";

async function connect() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
}

export async function POST(req) {
  await connect();
  const { email, password } = await req.json();

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 400 });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 400 });
  }

  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

  const response = NextResponse.json({ message: "Login exitoso" });
  response.cookies.set("token", token, { httpOnly: true });
  return response;
}
