import { auth, db, admin } from '../config/firebase.js'
import { HttpError } from '../middlewares/errorHandler.js'

const FIREBASE_REST = 'https://identitytoolkit.googleapis.com/v1'
const PERFIS_VALIDOS = ['doador', 'beneficiario', 'ong', 'admin']

function getApiKey() {
  const key = process.env.FIREBASE_WEB_API_KEY
  if (!key) {
    throw new HttpError(
      500,
      'CONFIG_ERROR',
      'FIREBASE_WEB_API_KEY nao configurada no .env',
    )
  }
  return key
}

async function callFirebaseRest(path, body) {
  const res = await fetch(`${FIREBASE_REST}${path}?key=${getApiKey()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) {
    const message = data?.error?.message ?? 'Erro Firebase'
    throw new HttpError(res.status === 400 ? 401 : res.status, 'FIREBASE_AUTH_ERROR', message)
  }
  return data
}

export async function register({ email, senha, nome, telefone, endereco, perfil }) {
  if (!PERFIS_VALIDOS.includes(perfil)) {
    throw new HttpError(400, 'VALIDATION_ERROR', `perfil deve ser um de: ${PERFIS_VALIDOS.join(', ')}`)
  }

  let user
  try {
    user = await auth.createUser({ email, password: senha, displayName: nome })
  } catch (err) {
    if (err.code === 'auth/email-already-exists') {
      throw new HttpError(409, 'EMAIL_IN_USE', 'Email ja cadastrado')
    }
    if (err.code === 'auth/invalid-email') {
      throw new HttpError(400, 'VALIDATION_ERROR', 'Email invalido')
    }
    throw err
  }

  try {
    await db.collection('usuarios').doc(user.uid).set({
      nome,
      email,
      telefone: telefone ?? null,
      endereco: endereco ?? null,
      perfil,
      criadoEm: admin.firestore.FieldValue.serverTimestamp(),
    })
  } catch (err) {
    // Rollback: se falhar gravar perfil, remove a conta do Auth pra nao deixar orfa.
    await auth.deleteUser(user.uid).catch(() => {})
    throw err
  }

  return { uid: user.uid, email: user.email, perfil }
}

export async function login({ email, senha }) {
  const data = await callFirebaseRest('/accounts:signInWithPassword', {
    email,
    password: senha,
    returnSecureToken: true,
  })
  return {
    uid: data.localId,
    email: data.email,
    idToken: data.idToken,
    refreshToken: data.refreshToken,
    expiresIn: data.expiresIn,
  }
}

export async function logout(uid) {
  await auth.revokeRefreshTokens(uid)
}

export async function recoverPassword(email) {
  await callFirebaseRest('/accounts:sendOobCode', {
    requestType: 'PASSWORD_RESET',
    email,
  })
}
