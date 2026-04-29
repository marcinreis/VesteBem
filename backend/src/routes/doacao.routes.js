import { Router } from 'express'

import * as doacaoController from '../controllers/doacao.controller.js'
import { authAspect } from '../middlewares/authAspect.js'
import { validate } from '../middlewares/validationAspect.js'

const router = Router()

const criarSchema = {
  tipoPeca: { type: 'string', required: true, minLength: 2 },
  tamanho: { type: 'string', required: true },
  conservacao: { type: 'string', required: true },
  cidade: { type: 'string', required: true, minLength: 2 },
  descricao: { type: 'string' },
  fotoUrl: { type: 'string' },
}

const editarSchema = {
  tipoPeca: { type: 'string', minLength: 2 },
  tamanho: { type: 'string' },
  conservacao: { type: 'string' },
  descricao: { type: 'string' },
  fotoUrl: { type: 'string' },
  cidade: { type: 'string' },
}

router.use(authAspect)

router.post('/', validate(criarSchema), doacaoController.criar)
router.get('/me', doacaoController.listarMinhas)
router.put('/:id', validate(editarSchema), doacaoController.editar)
router.patch('/:id/entregar', doacaoController.confirmarEntrega)
router.patch('/:id/cancelar', doacaoController.cancelar)

export default router
