import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarDemandas } from "../services/solicitacoesService";
import "../pages_css/Demandas.css";

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

export default function Demandas() {
  const navigate = useNavigate();
  const [demandas, setDemandas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    listarDemandas()
      .then(setDemandas)
      .catch((err) => setErro(err.message || "Erro ao carregar demandas."))
      .finally(() => setLoading(false));
  }, []);

  const doarPara = (demanda) => {
    // Leva ao formulário de doação já com o pedido em foco (pré-preenche tipo/tamanho).
    navigate("/doarroupas", {
      state: { demanda: { id: demanda.id, tipoPeca: demanda.tipoPeca, tamanho: demanda.tamanho } },
    });
  };

  return (
    <div className="dem-wrapper">
      <div className="dem-header">
        <div>
          <h1 className="dem-title">Demandas da comunidade</h1>
          <p className="dem-subtitle">
            Pedidos de quem precisa. Doe uma peça para atender uma necessidade real.
          </p>
        </div>
        <span className="dem-contador">
          {demandas.length} {demandas.length === 1 ? "pedido" : "pedidos"} em aberto
        </span>
      </div>

      {erro && <p className="dem-erro">{erro}</p>}

      {loading ? (
        <p className="dem-empty">Carregando demandas...</p>
      ) : demandas.length === 0 ? (
        <p className="dem-empty">Nenhum pedido em aberto no momento.</p>
      ) : (
        <div className="dem-grid">
          {demandas.map((d) => (
            <div className="dem-card" key={d.id}>
              <div className="dem-card-top">
                <p className="dem-card-tipo">{d.tipoPeca}</p>
                <span className={`dem-badge ${d.ehOng ? "dem-badge-ong" : "dem-badge-pf"}`}>
                  {d.ehOng ? "ONG" : "Beneficiário"}
                </span>
              </div>
              <p className="dem-card-meta">Tamanho {d.tamanho ?? "—"} · Qtd {d.quantidade ?? 1}</p>
              <p className="dem-card-quem">Pedido de {d.solicitante}</p>
              <p className="dem-card-data">📅 {formatData(d.criadoEm)}</p>
              <button type="button" className="dem-btn" onClick={() => doarPara(d)}>
                Quero doar isto
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
