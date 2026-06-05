import { auth } from "./firebase";

const API_URL = import.meta.env.VITE_API_URL;

function waitForAuth() {
  return new Promise((resolve, reject) => {
    if (auth.currentUser) return resolve(auth.currentUser);
    const unsub = auth.onAuthStateChanged((user) => {
      unsub();
      if (user) resolve(user);
      else reject(new Error("Usuário não autenticado"));
    });
  });
}

async function authHeaders() {
  const user = await waitForAuth();
  const token = await user.getIdToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function handle(res) {
  if (res.ok) return res.status === 204 ? null : res.json();
  let payload;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }
  const message =
    payload?.error?.message ||
    payload?.message ||
    res.statusText ||
    `Erro ${res.status}`;
  throw new Error(message);
}

export async function listarPontosColeta() {
  const res = await fetch(`${API_URL}/pontos-coleta`, {
    method: "GET",
    headers: await authHeaders(),
  });
  return handle(res);
}
