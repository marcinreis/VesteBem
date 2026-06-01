import { HttpError } from './errorHandler.js'

export function adminAspect(req, res, next) {
  if (req.user?.perfil !== 'admin') {
    return next(new HttpError(403, 'FORBIDDEN', 'Acesso restrito a administradores'))
  }
  next()
}
