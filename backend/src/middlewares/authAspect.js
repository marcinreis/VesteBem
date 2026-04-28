import { auth, db } from '../config/firebase.js'
import { HttpError } from './errorHandler.js'

export async function authAspect(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const [scheme, token] = header.split(' ')

    if (scheme !== 'Bearer' || !token) {
      throw new HttpError(401, 'UNAUTHORIZED', 'Token ausente ou mal formatado')
    }

    // O segundo argumento (true) verifica se o token foi revogado (logout).
    const decoded = await auth.verifyIdToken(token, true)

    const snap = await db.collection('usuarios').doc(decoded.uid).get()
    const perfilDoc = snap.exists ? snap.data() : null

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      perfil: perfilDoc?.perfil ?? null,
      dados: perfilDoc,
    }

    next()
  } catch (err) {
    if (err instanceof HttpError) return next(err)
    if (err.code === 'auth/id-token-revoked')
      return next(new HttpError(401, 'TOKEN_REVOKED', 'Token revogado, faca login novamente'))
    if (err.code === 'auth/id-token-expired')
      return next(new HttpError(401, 'TOKEN_EXPIRED', 'Token expirado'))
    return next(new HttpError(401, 'INVALID_TOKEN', 'Token invalido'))
  }
}
