import { db, admin } from '../config/firebase.js'
import { HttpError } from '../middlewares/errorHandler.js'

const COLLECTION = 'doacoes'

export const STATUS = Object.freeze({
  DISPONIVEL: 'Disponível',
  RESERVADA: 'Reservada',
  ENTREGUE: 'Entregue',
  CANCELADA: 'Cancelada',
})

// Status da solicitacao usado ao fechar o ciclo na confirmacao de entrega.
// Mantido como literal para evitar import circular com solicitacao.service.
const SOLICITACAO_PENDENTE = 'Pendente'
const SOLICITACAO_ATENDIDA = 'Atendida'

const CAMPOS_EDITAVEIS = ['tipoPeca', 'tamanho', 'conservacao', 'descricao', 'fotoUrl', 'cidade']

// Conectores que ficam em minuscula no meio do nome (ex.: "Rio de Janeiro").
const CONECTORES_CIDADE = new Set(['de', 'do', 'da', 'dos', 'das', 'e'])

// Limpa e padroniza a cidade ao salvar: remove espacos extras e aplica
// capitalizacao (ex.: " fortaleza " -> "Fortaleza"). Nao valida se a cidade
// existe; apenas deixa os dados consistentes na origem.
function normalizarCidade(valor) {
  if (valor == null) return null
  const limpo = String(valor).trim().replace(/\s+/g, ' ')
  if (!limpo) return null
  return limpo
    .toLowerCase()
    .split(' ')
    .map((palavra, i) =>
      i > 0 && CONECTORES_CIDADE.has(palavra)
        ? palavra
        : palavra.charAt(0).toUpperCase() + palavra.slice(1),
    )
    .join(' ')
}

function pickEditaveis(dados) {
  const out = {}
  for (const campo of CAMPOS_EDITAVEIS) {
    if (dados[campo] !== undefined) out[campo] = dados[campo]
  }
  if (out.cidade !== undefined) out.cidade = normalizarCidade(out.cidade)
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
    cidade: normalizarCidade(dados.cidade),
    status: STATUS.DISPONIVEL,
    criadoEm: admin.firestore.FieldValue.serverTimestamp(),
    atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
  }
  const ref = await db.collection(COLLECTION).add(novo)

  // Doação feita pela Vitrine de demandas: fecha o pedido livre que ela atende.
  if (dados.demandaId) {
    await marcarDemandaAtendida(String(dados.demandaId))
  }

  return { id: ref.id, ...novo, criadoEm: null, atualizadoEm: null }
}

// Marca um pedido do fluxo livre (sem peça vinculada) como Atendida quando alguém
// doa para atendê-lo pela Vitrine de demandas. Mantido tolerante: ignora em silêncio
// se o pedido nao existe mais ou ja saiu de Pendente.
async function marcarDemandaAtendida(demandaId) {
  const ref = db.collection('solicitacoes').doc(demandaId)
  const snap = await ref.get()
  if (!snap.exists) return
  const data = snap.data()
  if (data.doacaoId == null && data.status === SOLICITACAO_PENDENTE) {
    await ref.update({
      status: SOLICITACAO_ATENDIDA,
      atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
    })
  }
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

  // Fecha o ciclo: marca como 'Atendida' as solicitacoes pendentes vinculadas a
  // essa peca (so existem quando o pedido veio do catalogo, com doacaoId).
  const solSnap = await db.collection('solicitacoes').where('doacaoId', '==', id).get()
  const pendentes = solSnap.docs.filter((d) => d.data().status === SOLICITACAO_PENDENTE)
  if (pendentes.length > 0) {
    const batch = db.batch()
    for (const d of pendentes) {
      batch.update(d.ref, {
        status: SOLICITACAO_ATENDIDA,
        atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
      })
    }
    await batch.commit()
  }

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
