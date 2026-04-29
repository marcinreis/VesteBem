import { Router } from 'express'

import * as authController from '../controllers/auth.controller.js'
import { authAspect } from '../middlewares/authAspect.js'
import { validate } from '../middlewares/validationAspect.js'

const router = Router()

const registerSchema = {
  email: { type: 'email', required: true },
  senha: { type: 'senha', required: true },
  nome: { type: 'string', required: true, minLength: 2 },
  telefone: { type: 'string' },
  endereco: { type: 'string' },
  perfil: { type: 'enum', required: true, values: ['doador', 'beneficiario', 'ong', 'admin'] },
}

const loginSchema = {
  email: { type: 'email', required: true },
  senha: { type: 'string', required: true },
}

const recoverSchema = {
  email: { type: 'email', required: true },
}

router.post('/register', validate(registerSchema), authController.register)
router.post('/login', validate(loginSchema), authController.login)
router.post('/logout', authAspect, authController.logout)
router.post('/recover-password', validate(recoverSchema), authController.recoverPassword)

export default router
