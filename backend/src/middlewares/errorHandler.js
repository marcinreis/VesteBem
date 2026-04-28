export class HttpError extends Error {
  constructor(status, code, message) {
    super(message)
    this.status = status
    this.code = code
  }
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err)

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message },
    })
  }

  console.error('[unhandled]', err)
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' },
  })
}
