"use client";

import { useState, FormEvent } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err,  setErr]  = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Comprueba que la env var esté llegando
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
  console.log("API_URL:", API_URL);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/token/`,
        { username: user, password: pass },
        { timeout: 5000 }
      );

      // response.data puede venir undefined si algo falla en el servidor
      const token = response.data?.access;
      if (!token) {
        throw new Error("No se recibió un token válido del servidor");
      }

      localStorage.setItem("token", token);
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error(error);

      // Si es un error de Axios, intenta extraer el detalle,
      // si no, muestra el mensaje genérico
      if (axios.isAxiosError(error)) {
        const detail =
          error.response?.data?.detail ??
          error.response?.data ??
          error.message;
        setErr(String(detail));
      } else if (error instanceof Error) {
        setErr(error.message);
      } else {
        setErr("Error desconocido");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-purple-600 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-white rounded-lg shadow-lg p-8"
      >
        <h1 className="text-3xl font-bold mb-6 text-center">
          Iniciar sesión
        </h1>

        {err && <p className="text-red-500 mb-4">{err}</p>}

        <label className="block mb-2">Usuario</label>
        <input
          type="text"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <label className="block mb-2">Contraseña</label>
        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90"
          } text-white py-2 rounded transition`}
        >
          {loading ? "Ingresando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
