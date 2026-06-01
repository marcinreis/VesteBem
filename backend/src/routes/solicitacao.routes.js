import { Router } from 'express'

import * as solicitacaoController from '../controllers/solicitacao.controller.js'
import { authAspect } from '../middlewares/authAspect.js'
import { validate } from '../middlewares/validationAspect.js'

const router = Router()

const criarSchema = {
  tipoPeca: { type: 'string', required: true, minLength: 2 },
  tamanho: { type: 'string', required: true },
  quantidade: { type: 'number', required: true },
}

router.use(authAspect)

router.post('/', validate(criarSchema), solicitacaoController.criar)
router.get('/me', solicitacaoController.listarMinhas)
router.patch('/:id/cancelar', solicitacaoController.cancelar)

export default router
