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

export async function criarSolicitacao(dados) {
  const res = await fetch(`${API_URL}/solicitacoes`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(dados),
  });
  return handle(res);
}

export async function listarMinhasSolicitacoes() {
  const res = await fetch(`${API_URL}/solicitacoes/me`, {
    method: "GET",
    headers: await authHeaders(),
  });
  return handle(res);
}

// Vitrine de demandas: pedidos livres (sem peça vinculada) ainda pendentes.
export async function listarDemandas() {
  const res = await fetch(`${API_URL}/solicitacoes/demandas`, {
    method: "GET",
    headers: await authHeaders(),
  });
  return handle(res);
}

// Pedidos recebidos: solicitações feitas sobre as peças que eu doei.
export async function listarSolicitacoesRecebidas() {
  const res = await fetch(`${API_URL}/solicitacoes/recebidas`, {
    method: "GET",
    headers: await authHeaders(),
  });
  return handle(res);
}

export async function cancelarSolicitacao(id) {
  const res = await fetch(`${API_URL}/solicitacoes/${id}/cancelar`, {
    method: "PATCH",
    headers: await authHeaders(),
  });
  return handle(res);
}
