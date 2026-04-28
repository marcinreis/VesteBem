import * as doacaoService from '../services/doacao.service.js'

export async function criar(req, res, next) {
  try {
    const doacao = await doacaoService.criar(req.user.uid, req.body)
    res.status(201).json(doacao)
  } catch (err) {
    next(err)
  }
}

export async function listarMinhas(req, res, next) {
  try {
    const doacoes = await doacaoService.listarDoUsuario(req.user.uid)
    res.status(200).json(doacoes)
  } catch (err) {
    next(err)
  }
}

export async function editar(req, res, next) {
  try {
    const doacao = await doacaoService.editar(req.params.id, req.user.uid, req.body)
    res.status(200).json(doacao)
  } catch (err) {
    next(err)
  }
}

export async function confirmarEntrega(req, res, next) {
  try {
    const doacao = await doacaoService.confirmarEntrega(req.params.id, req.user.uid)
    res.status(200).json(doacao)
  } catch (err) {
    next(err)
  }
}

export async function cancelar(req, res, next) {
  try {
    const doacao = await doacaoService.cancelar(req.params.id, req.user.uid)
    res.status(200).json(doacao)
  } catch (err) {
    next(err)
  }
}
