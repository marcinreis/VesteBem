import { Router } from 'express'

import * as solicitacaoController from '../controllers/solicitacao.controller.js'
import { authAspect } from '../middlewares/authAspect.js'
import { validate } from '../middlewares/validationAspect.js'

const router = Router()

const criarSchema = {
  tipoPeca: { type: 'string', required: true, minLength: 2 },
  tamanho: { type: 'string', required: true },
  quantidade: { type: 'number', required: true },
  // Opcional: vincula a solicitacao a uma peca especifica do catalogo.
  doacaoId: { type: 'string', required: false },
}

router.use(authAspect)

router.post('/', validate(criarSchema), solicitacaoController.criar)
router.get('/me', solicitacaoController.listarMinhas)
router.get('/recebidas', solicitacaoController.listarRecebidas)
router.patch('/:id/cancelar', solicitacaoController.cancelar)

export default router
