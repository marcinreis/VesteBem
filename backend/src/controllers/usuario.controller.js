import * as usuarioService from '../services/usuario.service.js'

export async function obterMeuPerfil(req, res, next) {
  try {
    const result = await usuarioService.obter(req.user.uid)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

export async function atualizarMeuPerfil(req, res, next) {
  try {
    const result = await usuarioService.atualizar(req.user.uid, req.body)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}
