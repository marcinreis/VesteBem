import { auth } from "./firebase";

const API_URL = import.meta.env.VITE_API_URL;

async function handle(res) {
  if (res.ok) return res.json();
  let payload;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }
  const message =
    payload?.error?.message || payload?.message || res.statusText || `Erro ${res.status}`;
  throw new Error(message);
}

// GET /catalogo e publico, mas mantemos token quando disponivel para futuros filtros.
export async function listarCatalogo(filtros = {}) {
  const params = new URLSearchParams();
  if (filtros.tipo) params.append("tipo", filtros.tipo);
  if (filtros.tamanho) params.append("tamanho", filtros.tamanho);
  if (filtros.cidade) params.append("cidade", filtros.cidade);

  const headers = { "Content-Type": "application/json" };
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    headers.Authorization = `Bearer ${token}`;
  }

  const qs = params.toString();
  const res = await fetch(`${API_URL}/catalogo${qs ? `?${qs}` : ""}`, {
    method: "GET",
    headers,
  });
  return handle(res);
}
