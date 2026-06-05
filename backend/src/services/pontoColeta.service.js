import { db } from '../config/firebase.js'
import { HttpError } from '../middlewares/errorHandler.js'

const COLLECTION = 'pontosDeColeta'

export async function listar() {
  const snap = await db.collection(COLLECTION).orderBy('criadoEm', 'desc').get()
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function criar(dados, uid) {
  const ref = await db.collection(COLLECTION).add({
    ...dados,
    criadoEm: new Date(),
    criadoPor: uid,
  })
  const snap = await ref.get()
  return { id: ref.id, ...snap.data() }
}

export async function remover(id) {
  const ref = db.collection(COLLECTION).doc(id)
  const snap = await ref.get()
  if (!snap.exists) throw new HttpError(404, 'NOT_FOUND', 'Ponto não encontrado')
  await ref.delete()
}