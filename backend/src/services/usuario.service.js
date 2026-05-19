import { db, admin } from '../config/firebase.js'
import { HttpError } from '../middlewares/errorHandler.js'

const COLLECTION = 'usuarios'

const CAMPOS_EDITAVEIS = ['nome', 'telefone', 'endereco']

function pickEditaveis(dados) {
  const out = {}
  for (const campo of CAMPOS_EDITAVEIS) {
    if (dados[campo] !== undefined) out[campo] = dados[campo]
  }
  return out
}

export async function obter(uid) {
  const snap = await db.collection(COLLECTION).doc(uid).get()
  if (!snap.exists) throw new HttpError(404, 'NOT_FOUND', 'Usuario nao encontrado')
  return { uid, ...snap.data() }
}

export async function atualizar(uid, dados) {
  const ref = db.collection(COLLECTION).doc(uid)
  const snap = await ref.get()
  if (!snap.exists) throw new HttpError(404, 'NOT_FOUND', 'Usuario nao encontrado')

  const update = pickEditaveis(dados)
  if (Object.keys(update).length === 0) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Nenhum campo editavel informado')
  }
  update.atualizadoEm = admin.firestore.FieldValue.serverTimestamp()

  await ref.update(update)

  if (update.nome) {
    await admin.auth().updateUser(uid, { displayName: update.nome }).catch(() => {})
  }

  const atualizado = await ref.get()
  return { uid, ...atualizado.data() }
}
