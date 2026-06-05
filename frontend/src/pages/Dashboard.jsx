import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import {
  listarMinhasDoacoes,
  editarDoacao,
  cancelarDoacao,
  confirmarEntrega,
} from "../services/doacoesService";
import {
  criarSolicitacao,
  listarMinhasSolicitacoes,
  cancelarSolicitacao,
  listarSolicitacoesRecebidas,
} from "../services/solicitacoesService";
import { listarCatalogo } from "../services/catalogoService";
import { obterMeuPerfil } from "../services/usuariosService";
import EditarDoacaoModal from "../components/EditarDoacaoModal";
import "../pages_css/Dashboard.css";

const SOL_STATUS = {
  PENDENTE: "Pendente",
  ATENDIDA: "Atendida",
  CANCELADA: "Cancelada",
};

const solStatusClass = {
  [SOL_STATUS.PENDENTE]: "badge-disponivel",
  [SOL_STATUS.ATENDIDA]: "badge-entregue",
  [SOL_STATUS.CANCELADA]: "badge-cancelada",
};

const STATUS = {
  DISPONIVEL: "Disponível",
  RESERVADA: "Reservada",
  ENTREGUE: "Entregue",
  CANCELADA: "Cancelada",
};

const statusClass = {
  [STATUS.DISPONIVEL]: "badge-disponivel",
  [STATUS.RESERVADA]: "badge-reservada",
  [STATUS.ENTREGUE]: "badge-entregue",
  [STATUS.CANCELADA]: "badge-cancelada",
};

function formatData(ts) {
  if (!ts) return "—";
  if (typeof ts === "string" || typeof ts === "number") {
    return new Date(ts).toLocaleDateString("pt-BR");
  }
  if (ts._seconds) {
    return new Date(ts._seconds * 1000).toLocaleDateString("pt-BR");
  }
  if (typeof ts.toDate === "function") {
    return ts.toDate().toLocaleDateString("pt-BR");
  }
  return "—";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [aba, setAba] = useState("doacoes");
  const [doacoes, setDoacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [editandoDoacao, setEditandoDoacao] = useState(null);
  const [cancelandoId, setCancelandoId] = useState(null);
  const [confirmandoId, setConfirmandoId] = useState(null);
  const [perfil, setPerfil] = useState(undefined);

  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loadingSol, setLoadingSol] = useState(true);
  const [erroSol, setErroSol] = useState("");
  const [formSol, setFormSol] = useState({ tipoPeca: "", tamanho: "", quantidade: 1 });
  const [enviandoSol, setEnviandoSol] = useState(false);
  const [cancelandoSolId, setCancelandoSolId] = useState(null);

  const [catalogo, setCatalogo] = useState([]);
  const [loadingCat, setLoadingCat] = useState(true);
  const [erroCat, setErroCat] = useState("");
  const [catMsg, setCatMsg] = useState("");
  const [solicitandoCatId, setSolicitandoCatId] = useState(null);

  const [recebidas, setRecebidas] = useState([]);
  const [loadingReceb, setLoadingReceb] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setPerfil(null);
        return;
      }
      obterMeuPerfil()
        .then((dados) => setPerfil(dados?.perfil ?? null))
        .catch(() => setPerfil(null));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (perfil === undefined || perfil === "admin" || perfil === "ong") return;
    listarMinhasDoacoes()
      .then((lista) => setDoacoes(lista))
      .catch((err) => setErro(err.message || "Erro ao carregar doações."))
      .finally(() => setLoading(false));
    listarMinhasSolicitacoes()
      .then((lista) => setSolicitacoes(lista))
      .catch((err) => setErroSol(err.message || "Erro ao carregar solicitações."))
      .finally(() => setLoadingSol(false));
    listarCatalogo()
      .then((lista) => setCatalogo(lista))
      .catch((err) => setErroCat(err.message || "Erro ao carregar catálogo."))
      .finally(() => setLoadingCat(false));
    listarSolicitacoesRecebidas()
      .then((lista) => setRecebidas(lista))
      .catch(() => setRecebidas([]))
      .finally(() => setLoadingReceb(false));
  }, [perfil]);

  if (perfil === undefined) {
    return <p style={{ padding: 16 }}>Carregando...</p>;
  }
  if (perfil === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (perfil === "ong") {
    return <Navigate to="/ong/dashboard" replace />;
  }

  const totalDoacoes = doacoes.length;
  const totalEntregues = doacoes.filter((d) => d.status === STATUS.ENTREGUE).length;

  const ordenadas = [...doacoes].sort(
    (a, b) => (b.criadoEm?._seconds ?? 0) - (a.criadoEm?._seconds ?? 0),
  );

  const handleSalvarEdicao = async (id, dados) => {
    setErro("");
    const atualizada = await editarDoacao(id, dados);
    setDoacoes((prev) => prev.map((d) => (d.id === id ? { ...d, ...atualizada } : d)));
    setEditandoDoacao(null);
  };

  const handleCancelar = async (doacao) => {
    if (!window.confirm(`Cancelar doação "${doacao.tipoPeca}"?`)) return;
    setErro("");
    setCancelandoId(doacao.id);
    try {
      const atualizada = await cancelarDoacao(doacao.id);
      setDoacoes((prev) => prev.map((d) => (d.id === doacao.id ? { ...d, ...atualizada } : d)));
    } catch (err) {
      setErro(err.message || "Erro ao cancelar doação.");
    } finally {
      setCancelandoId(null);
    }
  };

  const handleConfirmarEntrega = async (doacao) => {
    if (
      !window.confirm(
        `Confirmar entrega de "${doacao.tipoPeca}"? Esta ação não pode ser desfeita.`,
      )
    )
      return;
    setErro("");
    setConfirmandoId(doacao.id);
    try {
      const atualizada = await confirmarEntrega(doacao.id);
      setDoacoes((prev) => prev.map((d) => (d.id === doacao.id ? { ...d, ...atualizada } : d)));
      // A entrega marca a solicitação vinculada como Atendida — recarrega os pedidos.
      listarSolicitacoesRecebidas()
        .then((lista) => setRecebidas(lista))
        .catch(() => {});
    } catch (err) {
      setErro(err.message || "Erro ao confirmar entrega.");
    } finally {
      setConfirmandoId(null);
    }
  };

  const handleCriarSolicitacao = async (e) => {
    e.preventDefault();
    setErroSol("");
    setEnviandoSol(true);
    try {
      const nova = await criarSolicitacao({
        tipoPeca: formSol.tipoPeca.trim(),
        tamanho: formSol.tamanho.trim(),
        quantidade: Number(formSol.quantidade),
      });
      setSolicitacoes((prev) => [nova, ...prev]);
      setFormSol({ tipoPeca: "", tamanho: "", quantidade: 1 });
    } catch (err) {
      setErroSol(err.message || "Erro ao criar solicitação.");
    } finally {
      setEnviandoSol(false);
    }
  };

  const handleCancelarSolicitacao = async (sol) => {
    if (!window.confirm(`Cancelar solicitação de "${sol.tipoPeca}"?`)) return;
    setErroSol("");
    setCancelandoSolId(sol.id);
    try {
      const atualizada = await cancelarSolicitacao(sol.id);
      setSolicitacoes((prev) => prev.map((s) => (s.id === sol.id ? { ...s, ...atualizada } : s)));
    } catch (err) {
      setErroSol(err.message || "Erro ao cancelar solicitação.");
    } finally {
      setCancelandoSolId(null);
    }
  };

  const handleSolicitarPeca = async (peca) => {
    setErroCat("");
    setCatMsg("");
    setSolicitandoCatId(peca.id);
    try {
      const nova = await criarSolicitacao({
        tipoPeca: peca.tipoPeca,
        tamanho: peca.tamanho,
        quantidade: 1,
        doacaoId: peca.id,
      });
      setSolicitacoes((prev) => [nova, ...prev]);
      // A peça foi reservada — sai do catálogo de disponíveis.
      setCatalogo((prev) => prev.filter((p) => p.id !== peca.id));
      setCatMsg(
        `Peça "${peca.tipoPeca}" reservada! A solicitação está na aba Solicitações.`,
      );
    } catch (err) {
      setErroCat(err.message || "Erro ao solicitar peça.");
    } finally {
      setSolicitandoCatId(null);
    }
  };

  const solOrdenadas = [...solicitacoes].sort(
    (a, b) => (b.criadoEm?._seconds ?? 0) - (a.criadoEm?._seconds ?? 0),
  );
  const totalSolPendentes = solicitacoes.filter((s) => s.status === SOL_STATUS.PENDENTE).length;
  const totalSolAtendidas = solicitacoes.filter((s) => s.status === SOL_STATUS.ATENDIDA).length;

  const cards = [
    {
      label: "Total de Doações",
      valor: totalDoacoes,
      cor: "#3b82f6",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/>
          <path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
        </svg>
      ),
    },
    {
      label: "Peças Doadas",
      valor: totalDoacoes,
      cor: "#2ec4a5",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 12 20 22 4 22 4 12"/>
          <rect x="2" y="7" width="20" height="5"/>
          <line x1="12" y1="22" x2="12" y2="7"/>
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
        </svg>
      ),
    },
    {
      label: "Pessoas Impactadas",
      valor: totalEntregues,
      cor: "#f59e0b",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
          <polyline points="17 6 23 6 23 12"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="dash-wrapper">
      <div className="dash-header">
        <h1 className="dash-title">Dashboard</h1>
        <p className="dash-subtitle">
          Acompanhe suas doações e solicitações em um só lugar
        </p>
      </div>

      <div className="dash-tabs">
        <button
          type="button"
          className={`dash-tab ${aba === "doacoes" ? "active" : ""}`}
          onClick={() => setAba("doacoes")}
        >
          Doações
        </button>
        <button
          type="button"
          className={`dash-tab ${aba === "catalogo" ? "active" : ""}`}
          onClick={() => setAba("catalogo")}
        >
          Catálogo
        </button>
        <button
          type="button"
          className={`dash-tab ${aba === "solicitacoes" ? "active" : ""}`}
          onClick={() => setAba("solicitacoes")}
        >
          Solicitações
        </button>
      </div>

      {aba === "doacoes" && (
      <>
      {erro && <div className="dash-error">{erro}</div>}

      <div className="dash-cards">
        {cards.map((card) => (
          <div className="dash-card" key={card.label}>
            <div className="dash-card-info">
              <span className="dash-card-label">{card.label}</span>
              <span className="dash-card-valor">
                {loading ? "—" : card.valor}
              </span>
            </div>
            <div className="dash-card-icon" style={{ background: card.cor }}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="dash-recentes">
        <div className="dash-recentes-header">
          <div>
            <p className="dash-recentes-title">Minhas Doações</p>
            <p className="dash-recentes-desc">Gerencie suas contribuições</p>
          </div>
          <button
            className="dash-ver-todas"
            onClick={() => navigate("/doarroupas")}
          >
            + Nova doação
          </button>
        </div>

        <div className="dash-lista">
          {loading ? (
            <p className="dash-empty">Carregando...</p>
          ) : ordenadas.length === 0 ? (
            <p className="dash-empty">Nenhuma doação cadastrada ainda.</p>
          ) : (
            ordenadas.map((doacao) => {
              const podeEditar = doacao.status === STATUS.DISPONIVEL;
              // REF06a: o doador pode confirmar a entrega (no ponto de coleta) tanto
              // com a peça Disponível quanto Reservada por uma solicitação.
              const podeEntregar =
                doacao.status === STATUS.DISPONIVEL || doacao.status === STATUS.RESERVADA;
              return (
                <div className="dash-item" key={doacao.id}>
                  <div className="dash-item-left">
                    <div className="dash-item-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2ec4a5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/>
                        <path d="M12 22V7"/>
                      </svg>
                    </div>
                    <div>
                      <p className="dash-item-nome">{doacao.tipoPeca}</p>
                      <p className="dash-item-data">
                        📅 {formatData(doacao.criadoEm)}
                      </p>
                    </div>
                  </div>
                  <div className="dash-item-right">
                    <span className={`dash-badge ${statusClass[doacao.status] ?? "badge-disponivel"}`}>
                      {doacao.status}
                    </span>
                    {(podeEditar || podeEntregar) && (
                      <div className="dash-item-actions">
                        {podeEntregar && (
                          <button
                            type="button"
                            className="dash-btn-entregar"
                            onClick={() => handleConfirmarEntrega(doacao)}
                            disabled={cancelandoId === doacao.id || confirmandoId === doacao.id}
                          >
                            {confirmandoId === doacao.id ? "Confirmando..." : "Confirmar entrega"}
                          </button>
                        )}
                        {podeEditar && (
                          <button
                            type="button"
                            className="dash-btn-editar"
                            onClick={() => setEditandoDoacao(doacao)}
                            disabled={cancelandoId === doacao.id || confirmandoId === doacao.id}
                          >
                            Editar
                          </button>
                        )}
                        {podeEditar && (
                          <button
                            type="button"
                            className="dash-btn-cancelar"
                            onClick={() => handleCancelar(doacao)}
                            disabled={cancelandoId === doacao.id || confirmandoId === doacao.id}
                          >
                            {cancelandoId === doacao.id ? "Cancelando..." : "Cancelar"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="dash-recentes">
        <div className="dash-recentes-header">
          <div>
            <p className="dash-recentes-title">Pedidos recebidos</p>
            <p className="dash-recentes-desc">Solicitações feitas nas suas peças</p>
          </div>
        </div>

        <div className="dash-lista">
          {loadingReceb ? (
            <p className="dash-empty">Carregando...</p>
          ) : recebidas.length === 0 ? (
            <p className="dash-empty">Nenhum pedido nas suas peças ainda.</p>
          ) : (
            recebidas.map((p) => (
              <div className="dash-item" key={p.id}>
                <div className="dash-item-left">
                  <div className="dash-item-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2ec4a5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <div>
                    <p className="dash-item-nome">
                      {p.peca?.tipoPeca}
                      {p.peca?.tamanho ? ` · Tam ${p.peca.tamanho}` : ""}
                    </p>
                    <p className="dash-item-data">
                      👤 {p.solicitante?.nome || p.solicitante?.email || "Usuário"} · 📅{" "}
                      {formatData(p.criadoEm)}
                    </p>
                  </div>
                </div>
                <div className="dash-item-right">
                  <span className={`dash-badge ${solStatusClass[p.status] ?? ""}`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {editandoDoacao && (
        <EditarDoacaoModal
          doacao={editandoDoacao}
          onSalvar={handleSalvarEdicao}
          onFechar={() => setEditandoDoacao(null)}
        />
      )}
      </>
      )}

      {aba === "catalogo" && (
      <>
      {erroCat && <div className="dash-error">{erroCat}</div>}
      {catMsg && <div className="dash-sucesso">{catMsg}</div>}

      <div className="dash-recentes">
        <div className="dash-recentes-header">
          <div>
            <p className="dash-recentes-title">Roupas disponíveis para doação</p>
            <p className="dash-recentes-desc">Escolha uma peça e clique em Solicitar</p>
          </div>
        </div>

        <div className="dash-lista">
          {loadingCat ? (
            <p className="dash-empty">Carregando catálogo...</p>
          ) : catalogo.length === 0 ? (
            <p className="dash-empty">Nenhuma peça disponível no momento.</p>
          ) : (
            catalogo.map((peca) => {
              const meta = [
                peca.conservacao && `Conservação: ${peca.conservacao}`,
                peca.cidade && `📍 ${peca.cidade}`,
                peca.criadoEm && `📅 ${formatData(peca.criadoEm)}`,
              ]
                .filter(Boolean)
                .join(" · ");
              return (
                <div className="dash-item" key={peca.id}>
                  <div className="dash-item-left">
                    <div className="dash-item-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2ec4a5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/>
                        <path d="M12 22V7"/>
                      </svg>
                    </div>
                    <div>
                      <p className="dash-item-nome">
                        {peca.tipoPeca}
                        {peca.tamanho ? ` · Tam ${peca.tamanho}` : ""}
                      </p>
                      <p className="dash-item-data">{meta || "—"}</p>
                      {peca.descricao && (
                        <p className="dash-item-desc">{peca.descricao}</p>
                      )}
                    </div>
                  </div>
                  <div className="dash-item-right">
                    <button
                      type="button"
                      className="dash-btn-solicitar"
                      onClick={() => handleSolicitarPeca(peca)}
                      disabled={solicitandoCatId === peca.id}
                    >
                      {solicitandoCatId === peca.id ? "Solicitando..." : "Solicitar"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      </>
      )}

      {aba === "solicitacoes" && (
      <>
      {erroSol && <div className="dash-error">{erroSol}</div>}

      <div className="dash-cards">
        <div className="dash-card">
          <div className="dash-card-info">
            <span className="dash-card-label">Total de Solicitações</span>
            <span className="dash-card-valor">{loadingSol ? "—" : solicitacoes.length}</span>
          </div>
          <div className="dash-card-icon" style={{ background: "#3b82f6" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
        </div>
        <div className="dash-card">
          <div className="dash-card-info">
            <span className="dash-card-label">Pendentes</span>
            <span className="dash-card-valor">{loadingSol ? "—" : totalSolPendentes}</span>
          </div>
          <div className="dash-card-icon" style={{ background: "#f59e0b" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
        </div>
        <div className="dash-card">
          <div className="dash-card-info">
            <span className="dash-card-label">Atendidas</span>
            <span className="dash-card-valor">{loadingSol ? "—" : totalSolAtendidas}</span>
          </div>
          <div className="dash-card-icon" style={{ background: "#2ec4a5" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="dash-recentes">
        <div className="dash-recentes-header">
          <div>
            <p className="dash-recentes-title">Nova Solicitação</p>
            <p className="dash-recentes-desc">Informe o que você precisa</p>
          </div>
        </div>
        <form className="dash-sol-form" onSubmit={handleCriarSolicitacao}>
          <div className="dash-sol-row">
            <input
              type="text"
              className="dash-sol-input"
              placeholder="Tipo de peça (ex.: camisa)"
              value={formSol.tipoPeca}
              onChange={(e) => setFormSol({ ...formSol, tipoPeca: e.target.value })}
              required
              minLength={2}
              disabled={enviandoSol}
            />
            <input
              type="text"
              className="dash-sol-input"
              placeholder="Tamanho (ex.: M)"
              value={formSol.tamanho}
              onChange={(e) => setFormSol({ ...formSol, tamanho: e.target.value })}
              required
              disabled={enviandoSol}
            />
            <input
              type="number"
              className="dash-sol-input"
              placeholder="Qtd"
              value={formSol.quantidade}
              onChange={(e) => setFormSol({ ...formSol, quantidade: e.target.value })}
              required
              min={1}
              disabled={enviandoSol}
            />
            <button type="submit" className="dash-ver-todas" disabled={enviandoSol}>
              {enviandoSol ? "Enviando..." : "+ Solicitar"}
            </button>
          </div>
        </form>
      </div>

      <div className="dash-recentes">
        <div className="dash-recentes-header">
          <div>
            <p className="dash-recentes-title">Minhas Solicitações</p>
            <p className="dash-recentes-desc">Acompanhe o status dos seus pedidos</p>
          </div>
        </div>

        <div className="dash-lista">
          {loadingSol ? (
            <p className="dash-empty">Carregando...</p>
          ) : solOrdenadas.length === 0 ? (
            <p className="dash-empty">Nenhuma solicitação registrada ainda.</p>
          ) : (
            solOrdenadas.map((sol) => {
              const podeCancelar = sol.status === SOL_STATUS.PENDENTE;
              return (
                <div className="dash-item" key={sol.id}>
                  <div className="dash-item-left">
                    <div className="dash-item-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2ec4a5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                    </div>
                    <div>
                      <p className="dash-item-nome">
                        {sol.tipoPeca} · Tam {sol.tamanho} · Qtd {sol.quantidade}
                      </p>
                      <p className="dash-item-data">📅 {formatData(sol.criadoEm)}</p>
                    </div>
                  </div>
                  <div className="dash-item-right">
                    <span className={`dash-badge ${solStatusClass[sol.status] ?? ""}`}>
                      {sol.status}
                    </span>
                    {podeCancelar && (
                      <div className="dash-item-actions">
                        <button
                          type="button"
                          className="dash-btn-cancelar"
                          onClick={() => handleCancelarSolicitacao(sol)}
                          disabled={cancelandoSolId === sol.id}
                        >
                          {cancelandoSolId === sol.id ? "Cancelando..." : "Cancelar"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      </>
      )}
    </div>
  );
}
