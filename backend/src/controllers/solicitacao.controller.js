import * as solicitacaoService from '../services/solicitacao.service.js'

export async function criar(req, res, next) {
  try {
    const sol = await solicitacaoService.criar(req.user, req.body)
    res.status(201).json(sol)
  } catch (err) {
    next(err)
  }
}

export async function listarMinhas(req, res, next) {
  try {
    const sols = await solicitacaoService.listarDoUsuario(req.user.uid)
    res.status(200).json(sols)
  } catch (err) {
    next(err)
  }
}

export async function listarDemandas(req, res, next) {
  try {
    const demandas = await solicitacaoService.listarDemandas()
    res.status(200).json(demandas)
  } catch (err) {
    next(err)
  }
}

export async function listarRecebidas(req, res, next) {
  try {
    const sols = await solicitacaoService.listarRecebidas(req.user.uid)
    res.status(200).json(sols)
  } catch (err) {
    next(err)
  }
}

export async function cancelar(req, res, next) {
  try {
    const sol = await solicitacaoService.cancelar(req.params.id, req.user.uid)
    res.status(200).json(sol)
  } catch (err) {
    next(err)
  }
}
