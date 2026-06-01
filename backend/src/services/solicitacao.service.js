import { db, admin } from '../config/firebase.js'
import { HttpError } from '../middlewares/errorHandler.js'

const COLLECTION = 'solicitacoes'

export const STATUS = Object.freeze({
  PENDENTE: 'Pendente',
  ATENDIDA: 'Atendida',
  CANCELADA: 'Cancelada',
})

// RGN04: solicitacao so pode ser feita por usuarios cadastrados (usuario ou ong).
// Aceita tambem perfis legados (doador/beneficiario) para nao quebrar usuarios antigos.
const PERFIS_PERMITIDOS = ['usuario', 'ong', 'doador', 'beneficiario']

export async function criar(usuario, dados) {
  if (!PERFIS_PERMITIDOS.includes(usuario?.perfil)) {
    throw new HttpError(
      403,
      'FORBIDDEN',
      'Apenas usuarios cadastrados (pessoa fisica ou ONG) podem solicitar roupas',
    )
  }

  const quantidade = Number(dados.quantidade)
  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'quantidade deve ser um inteiro maior que zero')
  }

  const novo = {
    usuarioId: usuario.uid,
    tipoPeca: dados.tipoPeca,
    tamanho: dados.tamanho,
    quantidade,
    status: STATUS.PENDENTE,
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

export async function cancelar(id, uid) {
  const ref = db.collection(COLLECTION).doc(id)
  const snap = await ref.get()
  if (!snap.exists) throw new HttpError(404, 'NOT_FOUND', 'Solicitacao nao encontrada')

  const data = snap.data()
  if (data.usuarioId !== uid) {
    throw new HttpError(403, 'FORBIDDEN', 'Voce nao e o dono dessa solicitacao')
  }
  if (data.status !== STATUS.PENDENTE) {
    throw new HttpError(
      409,
      'STATUS_INVALIDO',
      `So e possivel cancelar solicitacoes com status '${STATUS.PENDENTE}' (atual: '${data.status}')`,
    )
  }

  await ref.update({
    status: STATUS.CANCELADA,
    atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
  })
  const atualizado = await ref.get()
  return { id, ...atualizado.data() }
}
