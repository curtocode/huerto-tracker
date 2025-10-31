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

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ error: "Usuario ya existe" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const newUser = new User({ email, password: hashed });
  await newUser.save();

  // 🔹 Genera token para dejar al usuario logueado tras registrarse
  const token = jwt.sign({ id: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: "7d" });
  const response = NextResponse.json({ message: "Usuario creado y logueado" });
  response.cookies.set("token", token, { httpOnly: true });
  return response;
}
