import { db } from '../config/firebase.js'
import { STATUS } from './doacao.service.js'

const PERFIS = ['usuario', 'ong', 'admin']

function tsToMillis(ts) {
  if (!ts) return 0
  if (typeof ts.toMillis === 'function') return ts.toMillis()
  if (typeof ts.seconds === 'number') return ts.seconds * 1000
  if (typeof ts._seconds === 'number') return ts._seconds * 1000
  return 0
}

function topN(obj, n = 5) {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([nome, total]) => ({ nome, total }))
}

const SOL_STATUS = { PENDENTE: 'Pendente', ATENDIDA: 'Atendida', CANCELADA: 'Cancelada' }

export async function gerarRelatorio() {
  const [doacoesSnap, usuariosSnap, solicitacoesSnap] = await Promise.all([
    db.collection('doacoes').get(),
    db.collection('usuarios').get(),
    db.collection('solicitacoes').get(),
  ])

  const doacoes = doacoesSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
  const usuarios = usuariosSnap.docs.map((u) => ({ id: u.id, ...u.data() }))
  const solicitacoes = solicitacoesSnap.docs.map((s) => ({ id: s.id, ...s.data() }))

  const porStatus = {
    [STATUS.DISPONIVEL]: 0,
    [STATUS.RESERVADA]: 0,
    [STATUS.ENTREGUE]: 0,
    [STATUS.CANCELADA]: 0,
  }

  const solPorStatus = {
    [SOL_STATUS.PENDENTE]: 0,
    [SOL_STATUS.ATENDIDA]: 0,
    [SOL_STATUS.CANCELADA]: 0,
  }
  for (const s of solicitacoes) {
    if (s.status in solPorStatus) solPorStatus[s.status]++
  }
  const porTipo = {}
  // chaveNormalizada -> { rotulos: { grafiaOriginal: contagem }, total }
  const porCidade = {}

  for (const d of doacoes) {
    if (d.status in porStatus) porStatus[d.status]++
    if (d.tipoPeca) porTipo[d.tipoPeca] = (porTipo[d.tipoPeca] || 0) + 1
    if (d.cidade) {
      const rotulo = String(d.cidade).trim()
      if (rotulo) {
        // Normaliza para juntar variantes: minusculas, sem acento e sem espacos extras.
        const chave = rotulo
          .toLowerCase()
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
        const cidade = porCidade[chave] || (porCidade[chave] = { rotulos: {}, total: 0 })
        cidade.total++
        cidade.rotulos[rotulo] = (cidade.rotulos[rotulo] || 0) + 1
      }
    }
  }

  // Junta variantes da mesma cidade (ex.: "Fortaleza" e "fortaleza") e
  // exibe a grafia mais frequente.
  const topCidades = Object.values(porCidade)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map(({ rotulos, total }) => ({
      nome: Object.entries(rotulos).sort((a, b) => b[1] - a[1])[0][0],
      total,
    }))

  const usuariosPorPerfil = Object.fromEntries(PERFIS.map((p) => [p, 0]))
  for (const u of usuarios) {
    if (u.perfil in usuariosPorPerfil) usuariosPorPerfil[u.perfil]++
  }

  const ultimasEntregas = doacoes
    .filter((d) => d.status === STATUS.ENTREGUE)
    .sort((a, b) => tsToMillis(b.atualizadoEm) - tsToMillis(a.atualizadoEm))
    .slice(0, 5)
    .map((d) => ({
      id: d.id,
      tipoPeca: d.tipoPeca,
      tamanho: d.tamanho ?? null,
      cidade: d.cidade ?? null,
      atualizadoEm: d.atualizadoEm ?? null,
    }))

  const ultimasDoacoes = [...doacoes]
    .sort((a, b) => tsToMillis(b.criadoEm) - tsToMillis(a.criadoEm))
    .slice(0, 5)
    .map((d) => ({
      id: d.id,
      tipoPeca: d.tipoPeca,
      tamanho: d.tamanho ?? null,
      cidade: d.cidade ?? null,
      status: d.status,
      criadoEm: d.criadoEm ?? null,
    }))

  return {
    geradoEm: new Date().toISOString(),
    totais: {
      doacoes: doacoes.length,
      disponiveis: porStatus[STATUS.DISPONIVEL],
      reservadas: porStatus[STATUS.RESERVADA],
      entregues: porStatus[STATUS.ENTREGUE],
      canceladas: porStatus[STATUS.CANCELADA],
      usuarios: usuarios.length,
      solicitacoes: solicitacoes.length,
      solicitacoesPendentes: solPorStatus[SOL_STATUS.PENDENTE],
      solicitacoesAtendidas: solPorStatus[SOL_STATUS.ATENDIDA],
    },
    usuariosPorPerfil,
    topTipos: topN(porTipo),
    topCidades,
    ultimasDoacoes,
    ultimasEntregas,
  }
}
