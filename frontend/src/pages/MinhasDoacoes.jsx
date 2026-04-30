import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { editarDoacao, cancelarDoacao } from "../services/doacoesService";
import EditarDoacaoModal from "../components/EditarDoacaoModal";
import "../pages_css/MinhasDoacoes.css";

const filtros = ["Todas", "Disponíveis", "Entregues", "Canceladas"];

const statusLabel = {
  disponivel: "Disponível",
  entregue: "Entregue",
  cancelada: "Cancelada",
};

const statusClass = {
  disponivel: "mdb-badge-disponivel",
  entregue: "mdb-badge-entregue",
  cancelada: "mdb-badge-cancelada",
};

const filtroMap = {
  "Todas": null,
  "Disponíveis": "disponivel",
  "Entregues": "entregue",
  "Canceladas": "cancelada",
};

export default function MinhasDoacoes() {
  const navigate = useNavigate();
  const [doacoes, setDoacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroAtivo, setFiltroAtivo] = useState("Todas");
  const [doacaoEditando, setDoacaoEditando] = useState(null);

  const fetchDoacoes = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const q = query(
        collection(db, "doacoes"),
        where("doadorUid", "==", uid),
        orderBy("criadoEm", "desc")
      );
      const snap = await getDocs(q);
      setDoacoes(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoacoes();
  }, []);

  const formatData = (timestamp) => {
    if (!timestamp) return "—";
    const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return data.toLocaleDateString("pt-BR");
  };

  const doacoesFiltradas = doacoes.filter((d) => {
    const statusFiltro = filtroMap[filtroAtivo];
    return statusFiltro ? d.status === statusFiltro : true;
  });

  const handleSalvar = async (id, dados) => {
    await editarDoacao(id, dados);
    await fetchDoacoes();
    setDoacaoEditando(null);
  };

  const handleCancelar = async (id) => {
    if (!window.confirm("Tem certeza que deseja cancelar esta doação?")) return;
    try {
      await cancelarDoacao(id);
      await fetchDoacoes();
    } catch (err) {
      alert("Erro ao cancelar doação.");
      console.error(err);
    }
  };

  return (
    <div className="mdb-wrapper">

      {/* Header */}
      <div className="mdb-header">
        <div>
          <h1 className="mdb-title">Minhas Doações</h1>
          <p className="mdb-subtitle">Gerencie suas contribuições</p>
        </div>
        <button className="mdb-btn-nova" onClick={() => navigate("/doarroupas")}>
          + Nova Doação
        </button>
      </div>

      {/* Filtros */}
      <div className="mdb-filtros">
        {filtros.map((f) => (
          <button
            key={f}
            className={`mdb-filtro ${filtroAtivo === f ? "active" : ""}`}
            onClick={() => setFiltroAtivo(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <p className="mdb-empty">Carregando...</p>
      ) : doacoesFiltradas.length === 0 ? (
        <p className="mdb-empty">Nenhuma doação encontrada.</p>
      ) : (
        <div className="mdb-grid">
          {doacoesFiltradas.map((doacao) => (
            <div className="mdb-card" key={doacao.id}>

              {/* Topo */}
              <div className="mdb-card-top">
                <div className="mdb-card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2ec4a5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/>
                    <path d="M12 22V7"/>
                  </svg>
                </div>
                <span className={`mdb-badge ${statusClass[doacao.status] ?? "mdb-badge-disponivel"}`}>
                  {statusLabel[doacao.status] ?? doacao.status}
                </span>
              </div>

              {/* Conteúdo */}
              <div className="mdb-card-body">
                <p className="mdb-card-tipo">{doacao.tipoPeca ?? doacao.tipo}</p>
                <p className="mdb-card-detalhe">Tamanho: <strong>{doacao.tamanho}</strong></p>
                <p className="mdb-card-detalhe">Condição: <strong>{doacao.conservacao}</strong></p>
                {doacao.descricao && (
                  <p className="mdb-card-desc">{doacao.descricao}</p>
                )}
                <p className="mdb-card-data">📅 {formatData(doacao.criadoEm)}</p>
              </div>

              {/* Ações */}
              <div className="mdb-card-actions">
                {doacao.status !== "cancelada" && doacao.status !== "entregue" && (
                  <>
                    <button
                      className="mdb-btn-editar"
                      onClick={() => setDoacaoEditando(doacao)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Editar
                    </button>
                    <button className="mdb-btn-coleta" disabled>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                        <circle cx="12" cy="9" r="2.5"/>
                      </svg>
                      Coleta
                    </button>
                  </>
                )}
                <button className="mdb-btn-deletar" onClick={() => handleCancelar(doacao.id)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal do colega */}
      {doacaoEditando && (
        <EditarDoacaoModal
          doacao={doacaoEditando}
          onSalvar={handleSalvar}
          onFechar={() => setDoacaoEditando(null)}
        />
      )}

    </div>
  );
}