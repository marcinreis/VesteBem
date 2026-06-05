import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import { logAspect } from './middlewares/logAspect.js'
import { errorHandler } from './middlewares/errorHandler.js'

import authRoutes from './routes/auth.routes.js'
import doacaoRoutes from './routes/doacao.routes.js'
import catalogoRoutes from './routes/catalogo.routes.js'
import usuarioRoutes from './routes/usuario.routes.js'
import adminRoutes from './routes/admin.routes.js'
import solicitacaoRoutes from './routes/solicitacao.routes.js'
import pontoColetaRoutes from './routes/pontoColeta.routes.js'

const app = express()
const PORT = process.env.PORT || 3000

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
)
app.use(express.json())
app.use(logAspect)

app.get('/', (req, res) => {
  res.json({ message: 'VesteBem API running' })
})

app.use('/auth', authRoutes)
app.use('/doacoes', doacaoRoutes)
app.use('/catalogo', catalogoRoutes)
app.use('/usuarios', usuarioRoutes)
app.use('/admin', adminRoutes)
app.use('/solicitacoes', solicitacaoRoutes)
app.use('/pontos-coleta', pontoColetaRoutes)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
