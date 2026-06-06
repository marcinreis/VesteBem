import * as pontoColetaService from '../services/pontoColeta.service.js'
import { buscarCoordenadas } from '../services/geocoding.service.js'

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

    if (!nome || !endereco) {
      return res.status(400).json({
        message: 'Campos obrigatórios: nome, endereco',
      })
    }

    let coordenadas = { lat, lng }
    let cidadeFinal = cidade

    // Se não veio lat/lng, busca pelo endereço
    if (lat == null || lng == null) {
      const coords = await buscarCoordenadas(endereco)
      if (!coords) {
        return res.status(400).json({
          message: 'Não foi possível encontrar as coordenadas do endereço.',
        })
      }
      coordenadas = coords
    }

    const ponto = await pontoColetaService.criar(
      {
        nome,
        endereco,
        cidade: cidadeFinal ?? '',
        lat: coordenadas.lat,
        lng: coordenadas.lng,
      },
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