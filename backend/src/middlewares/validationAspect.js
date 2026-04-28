import { HttpError } from './errorHandler.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// RGN01: senha com no minimo 8 caracteres, contendo letra, numero e simbolo.
const SENHA_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

function validateField(name, value, rule) {
  const errors = []
  const isEmpty = value === undefined || value === null || value === ''

  if (rule.required && isEmpty) {
    errors.push(`${name} e obrigatorio`)
    return errors
  }
  if (isEmpty) return errors

  switch (rule.type) {
    case 'string':
      if (typeof value !== 'string') errors.push(`${name} deve ser string`)
      break
    case 'number':
      if (typeof value !== 'number' || Number.isNaN(value))
        errors.push(`${name} deve ser numero`)
      break
    case 'email':
      if (typeof value !== 'string' || !EMAIL_REGEX.test(value))
        errors.push(`${name} deve ser um email valido`)
      break
    case 'senha':
      if (typeof value !== 'string' || !SENHA_REGEX.test(value))
        errors.push(
          `${name} deve ter no minimo 8 caracteres, com letras, numeros e simbolos`,
        )
      break
    case 'enum':
      if (!rule.values?.includes(value))
        errors.push(`${name} deve ser um de: ${rule.values?.join(', ')}`)
      break
    case 'object':
      if (typeof value !== 'object' || Array.isArray(value))
        errors.push(`${name} deve ser objeto`)
      break
    default:
      // sem checagem de tipo — apenas existencia
      break
  }

  if (rule.minLength != null && typeof value === 'string' && value.length < rule.minLength)
    errors.push(`${name} deve ter no minimo ${rule.minLength} caracteres`)

  if (rule.maxLength != null && typeof value === 'string' && value.length > rule.maxLength)
    errors.push(`${name} deve ter no maximo ${rule.maxLength} caracteres`)

  return errors
}

export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const data = req[source] ?? {}
    const errors = []

    for (const [field, rule] of Object.entries(schema)) {
      errors.push(...validateField(field, data[field], rule))
    }

    if (errors.length > 0) {
      return next(new HttpError(400, 'VALIDATION_ERROR', errors.join('; ')))
    }
    next()
  }
}
