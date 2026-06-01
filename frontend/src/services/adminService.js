import { auth } from "./firebase";

const API_URL = import.meta.env.VITE_API_URL;

async function authHeaders() {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");
  const token = await user.getIdToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

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

export async function obterRelatorioImpacto() {
  const res = await fetch(`${API_URL}/admin/relatorio`, {
    method: "GET",
    headers: await authHeaders(),
  });
  return handle(res);
}
