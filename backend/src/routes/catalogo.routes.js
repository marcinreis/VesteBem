import { Router } from 'express'

import * as catalogoController from '../controllers/catalogo.controller.js'

const router = Router()

router.get('/', catalogoController.listar)

export default router
