import { db } from '../config/firebase.js'
import { STATUS } from './doacao.service.js'

const COLLECTION = 'doacoes'

function omitUsuarioId({ usuarioId: _omit, ...resto }) {
  return resto
}

export async function listar({ tipo, tamanho, cidade } = {}) {
  let query = db.collection(COLLECTION).where('status', '==', STATUS.DISPONIVEL)

  if (tipo) query = query.where('tipoPeca', '==', tipo)
  if (tamanho) query = query.where('tamanho', '==', tamanho)
  if (cidade) query = query.where('cidade', '==', cidade)

  const snap = await query.get()
  return snap.docs.map((d) => ({ id: d.id, ...omitUsuarioId(d.data()) }))
}
