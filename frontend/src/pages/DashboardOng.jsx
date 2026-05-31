import { useEffect, useState } from "react";
import { listarCatalogo } from "../services/catalogoService";
import {
  criarSolicitacao,
  listarMinhasSolicitacoes,
  cancelarSolicitacao,
} from "../services/solicitacoesService";
import "../pages_css/DashboardOng.css";

const SOL_STATUS = {
  PENDENTE: "Pendente",
  ATENDIDA: "Atendida",
  CANCELADA: "Cancelada",
};

const solStatusClass = {
  [SOL_STATUS.PENDENTE]: "ong-badge-pendente",
  [SOL_STATUS.ATENDIDA]: "ong-badge-atendida",
  [SOL_STATUS.CANCELADA]: "ong-badge-cancelada",
};

function formatData(ts) {
  if (!ts) return "—";
  if (typeof ts === "string" || typeof ts === "number") {
    return new Date(ts).toLocaleDateString("pt-BR");
  }
  if (ts._seconds) {
    return new Date(ts._seconds * 1000).toLocaleDateString("pt-BR");
  }
  return "—";
}

export default function DashboardOng() {
  const [catalogo, setCatalogo] = useState([]);
  const [loadingCat, setLoadingCat] = useState(true);
  const [erroCat, setErroCat] = useState("");
  const [filtros, setFiltros] = useState({ tipo: "", tamanho: "", cidade: "" });

  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loadingSol, setLoadingSol] = useState(true);
  const [erroSol, setErroSol] = useState("");
  const [formSol, setFormSol] = useState({ tipoPeca: "", tamanho: "", quantidade: 1 });
  const [enviandoSol, setEnviandoSol] = useState(false);
  const [cancelandoSolId, setCancelandoSolId] = useState(null);

  const carregarCatalogo = (filtrosAtivos = {}) => {
    setLoadingCat(true);
    setErroCat("");
    listarCatalogo(filtrosAtivos)
      .then(setCatalogo)
      .catch((err) => setErroCat(err.message || "Erro ao carregar catálogo."))
      .finally(() => setLoadingCat(false));
  };

  useEffect(() => {
    carregarCatalogo();
    listarMinhasSolicitacoes()
      .then(setSolicitacoes)
      .catch((err) => setErroSol(err.message || "Erro ao carregar solicitações."))
      .finally(() => setLoadingSol(false));
  }, []);

  const handleFiltrar = (e) => {
    e.preventDefault();
    const ativos = {
      tipo: filtros.tipo.trim() || undefined,
      tamanho: filtros.tamanho.trim() || undefined,
      cidade: filtros.cidade.trim() || undefined,
    };
    carregarCatalogo(ativos);
  };

  const handleLimparFiltros = () => {
    setFiltros({ tipo: "", tamanho: "", cidade: "" });
    carregarCatalogo();
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

  const solOrdenadas = [...solicitacoes].sort(
    (a, b) => (b.criadoEm?._seconds ?? 0) - (a.criadoEm?._seconds ?? 0),
  );
  const totalSolPendentes = solicitacoes.filter((s) => s.status === SOL_STATUS.PENDENTE).length;
  const totalSolAtendidas = solicitacoes.filter((s) => s.status === SOL_STATUS.ATENDIDA).length;

  const cards = [
    { label: "Peças disponíveis no catálogo", valor: loadingCat ? "—" : catalogo.length, cor: "#3b82f6" },
    { label: "Solicitações pendentes", valor: loadingSol ? "—" : totalSolPendentes, cor: "#f59e0b" },
    { label: "Solicitações atendidas", valor: loadingSol ? "—" : totalSolAtendidas, cor: "#2ec4a5" },
  ];

  return (
    <div className="ong-wrapper">
      <div className="ong-header">
        <div>
          <h1 className="ong-title">Painel da ONG</h1>
          <p className="ong-subtitle">
            Veja peças disponíveis e registre o que sua instituição precisa receber.
          </p>
        </div>
      </div>

      <div className="ong-cards">
        {cards.map((c) => (
          <div className="ong-card" key={c.label}>
            <span className="ong-card-label">{c.label}</span>
            <span className="ong-card-valor" style={{ color: c.cor }}>{c.valor}</span>
          </div>
        ))}
      </div>

      <section className="ong-section">
        <h2 className="ong-section-title">Catálogo de roupas disponíveis</h2>
        {erroCat && <p className="ong-erro">{erroCat}</p>}

        <form className="ong-filtros" onSubmit={handleFiltrar}>
          <input
            type="text"
            className="ong-input"
            placeholder="Filtrar por tipo"
            value={filtros.tipo}
            onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
          />
          <input
            type="text"
            className="ong-input"
            placeholder="Tamanho"
            value={filtros.tamanho}
            onChange={(e) => setFiltros({ ...filtros, tamanho: e.target.value })}
          />
          <input
            type="text"
            className="ong-input"
            placeholder="Cidade"
            value={filtros.cidade}
            onChange={(e) => setFiltros({ ...filtros, cidade: e.target.value })}
          />
          <button type="submit" className="ong-btn-primary">Filtrar</button>
          <button type="button" className="ong-btn-secondary" onClick={handleLimparFiltros}>Limpar</button>
        </form>

        {loadingCat ? (
          <p className="ong-empty">Carregando catálogo...</p>
        ) : catalogo.length === 0 ? (
          <p className="ong-empty">Nenhuma peça disponível com esses filtros.</p>
        ) : (
          <div className="ong-grid-catalogo">
            {catalogo.map((peca) => (
              <div className="ong-peca-card" key={peca.id}>
                <p className="ong-peca-tipo">{peca.tipoPeca}</p>
                <p className="ong-peca-sub">Tamanho {peca.tamanho ?? "—"}</p>
                <p className="ong-peca-meta">Conservação: {peca.conservacao ?? "—"}</p>
                <p className="ong-peca-meta">Cidade: {peca.cidade ?? "—"}</p>
                {peca.descricao && <p className="ong-peca-desc">{peca.descricao}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="ong-section">
        <h2 className="ong-section-title">Nova solicitação</h2>
        {erroSol && <p className="ong-erro">{erroSol}</p>}
        <form className="ong-form-solicitar" onSubmit={handleCriarSolicitacao}>
          <input
            type="text"
            className="ong-input"
            placeholder="Tipo de peça (ex.: agasalho)"
            value={formSol.tipoPeca}
            onChange={(e) => setFormSol({ ...formSol, tipoPeca: e.target.value })}
            required
            minLength={2}
            disabled={enviandoSol}
          />
          <input
            type="text"
            className="ong-input"
            placeholder="Tamanho (ex.: M)"
            value={formSol.tamanho}
            onChange={(e) => setFormSol({ ...formSol, tamanho: e.target.value })}
            required
            disabled={enviandoSol}
          />
          <input
            type="number"
            className="ong-input"
            placeholder="Quantidade"
            value={formSol.quantidade}
            onChange={(e) => setFormSol({ ...formSol, quantidade: e.target.value })}
            required
            min={1}
            disabled={enviandoSol}
          />
          <button type="submit" className="ong-btn-primary" disabled={enviandoSol}>
            {enviandoSol ? "Enviando..." : "+ Solicitar"}
          </button>
        </form>
      </section>

      <section className="ong-section">
        <h2 className="ong-section-title">Minhas solicitações</h2>
        {loadingSol ? (
          <p className="ong-empty">Carregando...</p>
        ) : solOrdenadas.length === 0 ? (
          <p className="ong-empty">Nenhuma solicitação registrada ainda.</p>
        ) : (
          <ul className="ong-lista-sol">
            {solOrdenadas.map((sol) => (
              <li key={sol.id} className="ong-lista-sol-item">
                <div>
                  <p className="ong-sol-titulo">
                    {sol.tipoPeca} · Tam {sol.tamanho} · Qtd {sol.quantidade}
                  </p>
                  <p className="ong-sol-sub">📅 {formatData(sol.criadoEm)}</p>
                </div>
                <div className="ong-sol-actions">
                  <span className={`ong-badge ${solStatusClass[sol.status] ?? ""}`}>
                    {sol.status}
                  </span>
                  {sol.status === SOL_STATUS.PENDENTE && (
                    <button
                      type="button"
                      className="ong-btn-cancelar"
                      onClick={() => handleCancelarSolicitacao(sol)}
                      disabled={cancelandoSolId === sol.id}
                    >
                      {cancelandoSolId === sol.id ? "Cancelando..." : "Cancelar"}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
