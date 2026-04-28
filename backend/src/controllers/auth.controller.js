import * as authService from '../services/auth.service.js'

export async function register(req, res, next) {
  try {
    const result = await authService.register(req.body)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

export async function login(req, res, next) {
  try {
    const result = await authService.login(req.body)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

export async function logout(req, res, next) {
  try {
    await authService.logout(req.user.uid)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

export async function recoverPassword(req, res, next) {
  try {
    await authService.recoverPassword(req.body.email)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
