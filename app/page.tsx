"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Compra {
  _id: string;
  nombre: string;
  precio: number;
  createdAt: string;
}

export default function Home() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [compras, setCompras] = useState<Compra[]>([]);
  const [error, setError] = useState("");
  const [editando, setEditando] = useState<string | null>(null); // id de la compra en edición
  const [editNombre, setEditNombre] = useState("");
  const [editPrecio, setEditPrecio] = useState("");

  // Cargar compras del backend
  async function cargar() {
    const res = await fetch("/api/compras");
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    const data = await res.json();
    setCompras(data);
  }

  // Guardar nueva compra
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

  // Borrar compra
  async function borrarCompra(id: string) {
    if (!confirm("¿Seguro que quieres eliminar esta compra?")) return;
    const res = await fetch(`/api/compras?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      cargar();
    } else {
      alert("Error al borrar la compra");
    }
  }

  // Entrar en modo edición
  function empezarEdicion(c: Compra) {
    setEditando(c._id);
    setEditNombre(c.nombre);
    setEditPrecio(c.precio.toString());
  }

  // Guardar cambios en compra editada
  async function guardarEdicion() {
    if (!editNombre || !editPrecio) {
      setError("Rellena nombre y precio");
      return;
    }

    const res = await fetch("/api/compras", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editando,
        nombre: editNombre,
        precio: parseFloat(editPrecio),
      }),
    });

    if (res.ok) {
      setEditando(null);
      setEditNombre("");
      setEditPrecio("");
      setError("");
      cargar();
    } else {
      alert("Error guardando los cambios");
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  useEffect(() => {
    cargar();
  }, []);

  const total = compras.reduce((sum, c) => sum + (c.precio || 0), 0);

  return (
    <div className="p-8 max-w-lg mx-auto space-y-4">
      {/* Botones de navegación */}
      <div className="flex gap-2 justify-end">
        <a href="/login" className="bg-green-600 text-white px-3 py-1 rounded">
          Login
        </a>
        <a href="/register" className="bg-green-600 text-white px-3 py-1 rounded">
          Register
        </a>
        <button
          onClick={logout}
          className="bg-red-600 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
        <a href="/perfil" className="bg-blue-600 text-white px-3 py-1 rounded">
          Perfil
        </a>
      </div>

      <h1 className="text-2xl font-bold">🌿 Recuento de gastos del huerto</h1>

      {/* Formulario de nueva compra */}
      <div className="flex gap-2">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && guardar()} 
          placeholder="Nombre del producto"
          className="border p-2 flex-1 rounded"
        />
        <input
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && guardar()}
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

      {/* Lista de compras */}
      <ul className="space-y-2">
        {compras.map((c) => (
          <li
            key={c._id}
            className="flex justify-between items-center border-b py-1"
          >
            {editando === c._id ? (
              <div className="flex flex-1 gap-2">
                <input
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && guardarEdicion()}
                  className="border p-1 flex-1 rounded"
                />
                <input
                  value={editPrecio}
                  onChange={(e) => setEditPrecio(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && guardarEdicion()}
                  type="number"
                  className="border p-1 w-20 rounded"
                />
                <button
                  onClick={guardarEdicion}
                  className="bg-blue-500 text-white px-2 rounded"
                >
                  ✅
                </button>
                <button
                  onClick={() => setEditando(null)}
                  className="bg-gray-400 text-white px-2 rounded"
                >
                  ❌
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 flex justify-between">
                  <span>{c.nombre}</span>
                  <span>{c.precio.toFixed(2)} €</span>
                  <span className="text-gray-500 text-sm">
    {new Date(c.createdAt).toLocaleDateString()}
  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => empezarEdicion(c)}
                    className="bg-blue-500 text-white px-2 rounded"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => borrarCompra(c._id)}
                    className="bg-red-500 text-white px-2 rounded"
                  >
                    🗑️
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      <p className="text-lg font-semibold">Total: {total.toFixed(2)} €</p>
    </div>
  );
}
