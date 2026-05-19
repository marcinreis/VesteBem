import { Router } from 'express'

import * as usuarioController from '../controllers/usuario.controller.js'
import { authAspect } from '../middlewares/authAspect.js'
import { validate } from '../middlewares/validationAspect.js'

const router = Router()

const atualizarSchema = {
  nome: { type: 'string', minLength: 2, maxLength: 120 },
  telefone: { type: 'string', maxLength: 30 },
  endereco: { type: 'string', maxLength: 200 },
}

router.use(authAspect)

router.get('/me', usuarioController.obterMeuPerfil)
router.patch('/me', validate(atualizarSchema), usuarioController.atualizarMeuPerfil)

export default router
