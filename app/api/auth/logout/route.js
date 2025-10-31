// eliminar la cookie de sesión
import { NextResponse } from "next/server";
export async function POST() {
  const response = NextResponse.json({ message: "Logout exitoso" });
  response.cookies.set("token", "", { httpOnly: true, maxAge: 0 });
  return response;
}