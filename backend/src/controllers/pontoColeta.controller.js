import * as pontoColetaService from '../services/pontoColeta.service.js'

export async function listar(req, res, next) {
  try {
    const pontos = await pontoColetaService.listar()
    res.status(200).json(pontos)
  } catch (err) {
    next(err)
  }
}

export async function criar(req, res, next) {
  try {
    const { nome, endereco, cidade, lat, lng } = req.body

    if (!nome || !endereco || !cidade || lat == null || lng == null) {
      return res.status(400).json({
        message: 'Campos obrigatórios: nome, endereco, cidade, lat, lng',
      })
    }

    const ponto = await pontoColetaService.criar(
      { nome, endereco, cidade, lat, lng },
      req.user.uid
    )
    res.status(201).json(ponto)
  } catch (err) {
    next(err)
  }
}

export async function remover(req, res, next) {
  try {
    await pontoColetaService.remover(req.params.id)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
}