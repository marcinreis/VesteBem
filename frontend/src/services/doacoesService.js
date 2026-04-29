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
  const message = payload?.error?.message || payload?.message || res.statusText || `Erro ${res.status}`;
  throw new Error(message);
}

export async function criarDoacao(dados) {
  const res = await fetch(`${API_URL}/doacoes`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(dados),
  });
  return handle(res);
}

export async function listarMinhasDoacoes() {
  const res = await fetch(`${API_URL}/doacoes/me`, {
    method: "GET",
    headers: await authHeaders(),
  });
  return handle(res);
}

export async function editarDoacao(id, dados) {
  const res = await fetch(`${API_URL}/doacoes/${id}`, {
    method: "PUT",
    headers: await authHeaders(),
    body: JSON.stringify(dados),
  });
  return handle(res);
}

export async function confirmarEntrega(id) {
  const res = await fetch(`${API_URL}/doacoes/${id}/entregar`, {
    method: "PATCH",
    headers: await authHeaders(),
  });
  return handle(res);
}

export async function cancelarDoacao(id) {
  const res = await fetch(`${API_URL}/doacoes/${id}/cancelar`, {
    method: "PATCH",
    headers: await authHeaders(),
  });
  return handle(res);
}
