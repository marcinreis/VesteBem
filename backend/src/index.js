import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import { logAspect } from './middlewares/logAspect.js'
import { errorHandler } from './middlewares/errorHandler.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use(logAspect)

app.get('/', (req, res) => {
  res.json({ message: 'VesteBem API running' })
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
