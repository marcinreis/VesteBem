import * as catalogoService from '../services/catalogo.service.js'

export async function listar(req, res, next) {
  try {
    const { tipo, tamanho, cidade } = req.query
    const doacoes = await catalogoService.listar({ tipo, tamanho, cidade })
    res.status(200).json(doacoes)
  } catch (err) {
    next(err)
  }
}
