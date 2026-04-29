import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import "../pages_css/Dashboard.css";

const statusLabel = {
  disponivel: "Disponível",
  entregue: "Entregue",
  pendente: "Pendente",
};

const statusClass = {
  disponivel: "badge-disponivel",
  entregue: "badge-entregue",
  pendente: "badge-pendente",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [doacoes, setDoacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        const lista = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setDoacoes(lista);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoacoes();
  }, []);

  const totalDoacoes = doacoes.length;
  const totalPecas = doacoes.reduce((acc, d) => acc + (d.quantidade || 1), 0);
  const totalEntregues = doacoes.filter((d) => d.status === "entregue").length;
  const recentes = doacoes.slice(0, 4);

  const formatData = (timestamp) => {
    if (!timestamp) return "—";
    const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return data.toLocaleDateString("pt-BR");
  };

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
      valor: totalPecas,
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

      {/* Título */}
      <div className="dash-header">
        <h1 className="dash-title">Dashboard do Doador</h1>
        <p className="dash-subtitle">Acompanhe o impacto das suas doações</p>
      </div>

      {/* Cards de métricas */}
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

      {/* Doações Recentes */}
      <div className="dash-recentes">
        <div className="dash-recentes-header">
          <div>
            <p className="dash-recentes-title">Doações Recentes</p>
            <p className="dash-recentes-desc">Suas últimas contribuições</p>
          </div>
          <button
            className="dash-ver-todas"
            onClick={() => navigate("/minhasdoacoes")}
          >
            Ver todas →
          </button>
        </div>

        <div className="dash-lista">
          {loading ? (
            <p className="dash-empty">Carregando...</p>
          ) : recentes.length === 0 ? (
            <p className="dash-empty">Nenhuma doação cadastrada ainda.</p>
          ) : (
            recentes.map((doacao) => (
              <div className="dash-item" key={doacao.id}>
                <div className="dash-item-left">
                  <div className="dash-item-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2ec4a5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/>
                      <path d="M12 22V7"/>
                    </svg>
                  </div>
                  <div>
                    <p className="dash-item-nome">{doacao.tipo}</p>
                    <p className="dash-item-data">
                      📅 {formatData(doacao.criadoEm)}
                    </p>
                  </div>
                </div>
                <span className={`dash-badge ${statusClass[doacao.status] ?? "badge-pendente"}`}>
                  {statusLabel[doacao.status] ?? doacao.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}