import { HttpError } from './errorHandler.js'

export function ongOuAdminAspect(req, res, next) {
  const perfil = req.user?.perfil
  if (perfil !== 'ong' && perfil !== 'admin') {
    return next(new HttpError(403, 'FORBIDDEN', 'Acesso restrito a ONGs e administradores'))
  }
  next()
}