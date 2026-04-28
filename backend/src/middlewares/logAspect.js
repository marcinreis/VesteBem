export function logAspect(req, res, next) {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    const uid = req.user?.uid ?? '-'
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms uid=${uid}`,
    )
  })
  next()
}
