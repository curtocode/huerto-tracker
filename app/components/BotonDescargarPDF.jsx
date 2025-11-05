"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BotonDescargarPDF() {
  const [logueado, setLogueado] = useState(null); // null = verificando
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  // ✅ Verificar autenticación en el backend
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/check-auth", { cache: "no-store" });
        const data = await res.json();
        setLogueado(data.authenticated);
      } catch (err) {
        console.error("Error verificando autenticación:", err);
        setLogueado(false);
      }
    }

    checkAuth();
  }, []);

  // ✅ Redirigir al login si no está autenticado
  useEffect(() => {
    if (logueado === false) {
      router.push("/login");
    }
  }, [logueado, router]);

  if (logueado === null) return null; // aún verificando

  // ✅ Simplemente llama al backend (descarga se maneja allí)
  const handleDescargarPDF = async () => {
    try {
      setCargando(true);
      // El navegador abrirá el PDF directamente o lo descargará
      window.location.href = "/api/export-pdf";
    } catch (err) {
      console.error("Error llamando al backend:", err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <button
      onClick={handleDescargarPDF}
      disabled={cargando}
      className={`px-4 py-2 rounded-lg text-white font-semibold transition ${
        cargando ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      {cargando ? "Generando..." : "Descargar historial de compras"}
    </button>
  );
}
