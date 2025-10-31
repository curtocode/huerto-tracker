"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ✅ Tipado de cada compra
interface Compra {
  _id: string;
  nombre: string;
  precio: number;
}

export default function Home() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [compras, setCompras] = useState<Compra[]>([]);
  const [error, setError] = useState("");

  // 🔹 Cargar compras del backend
  async function cargar() {
    const res = await fetch("/api/compras");
    if (res.status === 401) {
      router.push("/login");
      return;
    }

    const data = await res.json();
    setCompras(data);
  }

  // 🔹 Guardar una nueva compra
  async function guardar() {
    if (!nombre || !precio) {
      setError("Rellena nombre y precio");
      return;
    }

    const res = await fetch("/api/compras", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, precio: parseFloat(precio) }),
    });

    if (res.ok) {
      setNombre("");
      setPrecio("");
      setError("");
      cargar();
    } else {
      setError("Error guardando la compra");
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  // 🔹 Calcular total
  const total = compras.reduce((sum, c) => sum + (c.precio || 0), 0);

  return (
    <div className="p-8 max-w-lg mx-auto space-y-4">
      <div className="login-button">
        <a
          href="/login"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Login
        </a>
      </div>
      <div className="register-button">
        <a
          href="/register"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Register
        </a>
      </div>
      <h1 className="text-2xl font-bold">🌿 Recuento del Huerto</h1>

      <div className="flex gap-2">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del producto"
          className="border p-2 flex-1 rounded"
        />
        <input
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          placeholder="Precio"
          type="number"
          className="border p-2 w-24 rounded"
        />
        <button
          onClick={guardar}
          className="bg-green-600 text-white px-4 rounded"
        >
          💾
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <ul>
        {compras.map((c) => (
          <li key={c._id} className="flex justify-between border-b py-1">
            <span>{c.nombre}</span>
            <span>{c.precio.toFixed(2)} €</span>
          </li>
        ))}
      </ul>

      <p className="text-lg font-semibold">Total: {total.toFixed(2)} €</p>
    </div>
  );
}
