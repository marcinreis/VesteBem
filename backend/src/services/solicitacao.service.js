import { db, admin } from '../config/firebase.js'
import { HttpError } from '../middlewares/errorHandler.js'
import { STATUS as DOACAO_STATUS } from './doacao.service.js'

const COLLECTION = 'solicitacoes'
const DOACOES_COLLECTION = 'doacoes'
const USUARIOS_COLLECTION = 'usuarios'

export const STATUS = Object.freeze({
  PENDENTE: 'Pendente',
  ATENDIDA: 'Atendida',
  CANCELADA: 'Cancelada',
})

// RGN04: solicitacao so pode ser feita por usuarios cadastrados (usuario ou ong).
// Aceita tambem perfis legados (doador/beneficiario) para nao quebrar usuarios antigos.
const PERFIS_PERMITIDOS = ['usuario', 'ong', 'doador', 'beneficiario']

const serverTimestamp = () => admin.firestore.FieldValue.serverTimestamp()

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

  const base = {
    usuarioId: usuario.uid,
    tipoPeca: dados.tipoPeca,
    tamanho: dados.tamanho,
    quantidade,
    status: STATUS.PENDENTE,
  }

  // Fluxo livre (REF09): sem doacaoId, apenas registra o pedido descritivo.
  if (dados.doacaoId == null || dados.doacaoId === '') {
    const novo = {
      ...base,
      doacaoId: null,
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    }
    const ref = await db.collection(COLLECTION).add(novo)
    return { id: ref.id, ...novo, criadoEm: null, atualizadoEm: null }
  }

  // Fluxo "Solicitar esta peca": reserva a doacao numa transacao para evitar que
  // duas pessoas reservem a mesma peca ao mesmo tempo.
  const doacaoId = String(dados.doacaoId)
  const doacaoRef = db.collection(DOACOES_COLLECTION).doc(doacaoId)
  const solRef = db.collection(COLLECTION).doc()

  const novo = await db.runTransaction(async (tx) => {
    const doacaoSnap = await tx.get(doacaoRef)
    if (!doacaoSnap.exists) {
      throw new HttpError(404, 'NOT_FOUND', 'Doacao informada nao encontrada')
    }
    const status = doacaoSnap.data().status
    if (status !== DOACAO_STATUS.DISPONIVEL) {
      throw new HttpError(
        409,
        'PECA_INDISPONIVEL',
        status === DOACAO_STATUS.RESERVADA
          ? 'Esta peca ja foi reservada por outra solicitacao'
          : `So e possivel solicitar pecas com status '${DOACAO_STATUS.DISPONIVEL}'`,
      )
    }

    const doc = { ...base, doacaoId, criadoEm: serverTimestamp(), atualizadoEm: serverTimestamp() }
    tx.set(solRef, doc)
    tx.update(doacaoRef, { status: DOACAO_STATUS.RESERVADA, atualizadoEm: serverTimestamp() })
    return doc
  })

  return { id: solRef.id, ...novo, criadoEm: null, atualizadoEm: null }
}

export async function listarDoUsuario(uid) {
  const snap = await db.collection(COLLECTION).where('usuarioId', '==', uid).get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// Pedidos recebidos: solicitacoes feitas sobre as pecas que o usuario doou.
export async function listarRecebidas(uid) {
  const doacoesSnap = await db.collection(DOACOES_COLLECTION).where('usuarioId', '==', uid).get()
  if (doacoesSnap.empty) return []

  const doacoesPorId = new Map(doacoesSnap.docs.map((d) => [d.id, d.data()]))
  const ids = [...doacoesPorId.keys()]

  // Firestore limita o operador 'in' a 10 valores por consulta — busca em lotes.
  const solicitacoes = []
  for (let i = 0; i < ids.length; i += 10) {
    const chunk = ids.slice(i, i + 10)
    const snap = await db.collection(COLLECTION).where('doacaoId', 'in', chunk).get()
    solicitacoes.push(...snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  }
  if (solicitacoes.length === 0) return []

  // Enriquece com nome/email de quem solicitou.
  const solicitanteIds = [...new Set(solicitacoes.map((s) => s.usuarioId).filter(Boolean))]
  const userRefs = solicitanteIds.map((u) => db.collection(USUARIOS_COLLECTION).doc(u))
  const userDocs = userRefs.length ? await db.getAll(...userRefs) : []
  const usuariosPorId = new Map(userDocs.map((d) => [d.id, d.exists ? d.data() : null]))

  return solicitacoes.map((s) => {
    const peca = doacoesPorId.get(s.doacaoId) ?? {}
    const solicitante = usuariosPorId.get(s.usuarioId) ?? null
    return {
      id: s.id,
      doacaoId: s.doacaoId,
      status: s.status,
      quantidade: s.quantidade,
      criadoEm: s.criadoEm ?? null,
      peca: { tipoPeca: peca.tipoPeca ?? s.tipoPeca, tamanho: peca.tamanho ?? s.tamanho, status: peca.status ?? null },
      solicitante: { nome: solicitante?.nome ?? null, email: solicitante?.email ?? null },
    }
  })
}

export async function cancelar(id, uid) {
  const ref = db.collection(COLLECTION).doc(id)

  const atualizado = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
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

    // Libera a reserva: se a peca estava reservada por esse pedido, volta a Disponivel.
    if (data.doacaoId) {
      const doacaoRef = db.collection(DOACOES_COLLECTION).doc(data.doacaoId)
      const doacaoSnap = await tx.get(doacaoRef)
      if (doacaoSnap.exists && doacaoSnap.data().status === DOACAO_STATUS.RESERVADA) {
        tx.update(doacaoRef, { status: DOACAO_STATUS.DISPONIVEL, atualizadoEm: serverTimestamp() })
      }
    }

    tx.update(ref, { status: STATUS.CANCELADA, atualizadoEm: serverTimestamp() })
    return { id, ...data, status: STATUS.CANCELADA }
  })

  return atualizado
}
