import { Router } from 'express'

import * as pontoColetaController from '../controllers/pontoColeta.controller.js'
import { authAspect } from '../middlewares/authAspect.js'
import { adminAspect } from '../middlewares/adminAspect.js'

const router = Router()

// Qualquer usuário logado lista
router.get('/', authAspect, pontoColetaController.listar)

// Só admin cria e remove
router.post('/', authAspect, adminAspect, pontoColetaController.criar)
router.delete('/:id', authAspect, adminAspect, pontoColetaController.remover)

export default router