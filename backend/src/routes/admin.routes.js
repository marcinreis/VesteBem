import { Router } from 'express'

import * as adminController from '../controllers/admin.controller.js'
import { authAspect } from '../middlewares/authAspect.js'
import { adminAspect } from '../middlewares/adminAspect.js'

const router = Router()

router.use(authAspect, adminAspect)

router.get('/relatorio', adminController.relatorioImpacto)

export default router
