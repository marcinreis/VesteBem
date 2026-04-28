import { db, admin } from '../config/firebase.js'
import { HttpError } from '../middlewares/errorHandler.js'

const COLLECTION = 'doacoes'

export const STATUS = Object.freeze({
  DISPONIVEL: 'Disponível',
  ENTREGUE: 'Entregue',
  CANCELADA: 'Cancelada',
})

const CAMPOS_EDITAVEIS = ['tipoPeca', 'tamanho', 'conservacao', 'descricao', 'fotoUrl', 'cidade']

function pickEditaveis(dados) {
  const out = {}
  for (const campo of CAMPOS_EDITAVEIS) {
    if (dados[campo] !== undefined) out[campo] = dados[campo]
  }
  return out
}

async function getDoacaoOrThrow(id) {
  const ref = db.collection(COLLECTION).doc(id)
  const snap = await ref.get()
  if (!snap.exists) throw new HttpError(404, 'NOT_FOUND', 'Doacao nao encontrada')
  return { ref, snap, data: snap.data() }
}

function assertDono(doacao, uid) {
  if (doacao.usuarioId !== uid) {
    throw new HttpError(403, 'FORBIDDEN', 'Voce nao e o dono dessa doacao')
  }
}

export async function criar(usuarioId, dados) {
  const novo = {
    usuarioId,
    tipoPeca: dados.tipoPeca,
    tamanho: dados.tamanho,
    conservacao: dados.conservacao,
    descricao: dados.descricao ?? null,
    fotoUrl: dados.fotoUrl ?? null,
    cidade: dados.cidade ?? null,
    status: STATUS.DISPONIVEL,
    criadoEm: admin.firestore.FieldValue.serverTimestamp(),
    atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
  }
  const ref = await db.collection(COLLECTION).add(novo)
  return { id: ref.id, ...novo, criadoEm: null, atualizadoEm: null }
}

export async function listarDoUsuario(uid) {
  const snap = await db.collection(COLLECTION).where('usuarioId', '==', uid).get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function editar(id, uid, dados) {
  const { ref, data } = await getDoacaoOrThrow(id)
  assertDono(data, uid)

  if (data.status !== STATUS.DISPONIVEL) {
    throw new HttpError(
      409,
      'STATUS_INVALIDO',
      `So e possivel editar doacoes com status '${STATUS.DISPONIVEL}' (atual: '${data.status}')`,
    )
  }

  const update = {
    ...pickEditaveis(dados),
    atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
  }
  await ref.update(update)
  const atualizado = await ref.get()
  return { id, ...atualizado.data() }
}

export async function confirmarEntrega(id, uid) {
  const { ref, data } = await getDoacaoOrThrow(id)
  assertDono(data, uid)

  if (data.status === STATUS.ENTREGUE) {
    return { id, ...data }
  }
  if (data.status === STATUS.CANCELADA) {
    throw new HttpError(409, 'STATUS_INVALIDO', 'Doacao cancelada nao pode ser entregue')
  }

  await ref.update({
    status: STATUS.ENTREGUE,
    atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
  })
  const atualizado = await ref.get()
  return { id, ...atualizado.data() }
}

export async function cancelar(id, uid) {
  const { ref, data } = await getDoacaoOrThrow(id)
  assertDono(data, uid)

  if (data.status !== STATUS.DISPONIVEL) {
    throw new HttpError(
      409,
      'STATUS_INVALIDO',
      `So e possivel cancelar doacoes com status '${STATUS.DISPONIVEL}' (atual: '${data.status}')`,
    )
  }

  await ref.update({
    status: STATUS.CANCELADA,
    atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
  })
  const atualizado = await ref.get()
  return { id, ...atualizado.data() }
}
