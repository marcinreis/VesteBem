import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { obterRelatorioImpacto } from "../services/adminService";
import "../pages_css/DashboardAdmin.css";

const STATUS = {
  DISPONIVEL: "Disponível",
  ENTREGUE: "Entregue",
  CANCELADA: "Cancelada",
};

const statusClass = {
  [STATUS.DISPONIVEL]: "adm-badge-disponivel",
  [STATUS.ENTREGUE]: "adm-badge-entregue",
  [STATUS.CANCELADA]: "adm-badge-cancelada",
};

const perfilLabel = {
  doador: "Doadores",
  beneficiario: "Beneficiários",
  ong: "ONGs",
  admin: "Administradores",
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

export default function DashboardAdmin() {
  const [data, setData] = useState(null);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obterRelatorioImpacto()
      .then(setData)
      .catch((err) => setErro(err.message || "Erro ao carregar dashboard."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="adm-wrapper">
        <p className="adm-empty">Carregando dashboard...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="adm-wrapper">
        <p className="adm-erro">{erro}</p>
      </div>
    );
  }

  if (!data) return null;

  const t = data.totais;
  const taxaEntrega = t.doacoes > 0 ? Math.round((t.entregues / t.doacoes) * 100) : 0;

  const cards = [
    {
      label: "Roupas cadastradas",
      valor: t.doacoes,
      desc: "Total de doações registradas",
      cor: "#3b82f6",
    },
    {
      label: "Roupas doadas",
      valor: t.entregues,
      desc: "Doações com status Entregue",
      cor: "#2ec4a5",
    },
    {
      label: "Disponíveis",
      valor: t.disponiveis,
      desc: "No catálogo agora",
      cor: "#f59e0b",
    },
    {
      label: "Canceladas",
      valor: t.canceladas,
      desc: "Doações canceladas",
      cor: "#ef4444",
    },
    {
      label: "Usuários cadastrados",
      valor: t.usuarios,
      desc: "Todos os perfis somados",
      cor: "#8b5cf6",
    },
    {
      label: "Taxa de entrega",
      valor: `${taxaEntrega}%`,
      desc: "Entregues / cadastradas",
      cor: "#0ea5e9",
    },
  ];

  return (
    <div className="adm-wrapper">
      <div className="adm-header">
        <div>
          <h1 className="adm-title">Painel do Administrador</h1>
          <p className="adm-subtitle">
            Visão geral da plataforma — atualizado em{" "}
            {new Date(data.geradoEm).toLocaleString("pt-BR")}
          </p>
        </div>
        <Link to="/admin/relatorio" className="adm-btn-relatorio">
          Ver relatório completo
        </Link>
        <Link to="/admin/pontos-coleta" className="adm-btn-pontos">
          + Adicionar ponto de coleta
        </Link>
      </div>

      <div className="adm-cards">
        {cards.map((c) => (
          <div className="adm-card" key={c.label}>
            <span className="adm-card-label">{c.label}</span>
            <span className="adm-card-valor" style={{ color: c.cor }}>
              {c.valor}
            </span>
            <span className="adm-card-desc">{c.desc}</span>
          </div>
        ))}
      </div>

      <div className="adm-grid">
        <section className="adm-section">
          <h2 className="adm-section-title">Usuários por perfil</h2>
          <ul className="adm-lista">
            {Object.entries(data.usuariosPorPerfil).map(([k, v]) => (
              <li key={k}>
                <span>{perfilLabel[k] ?? k}</span>
                <strong>{v}</strong>
              </li>
            ))}
          </ul>
        </section>

        <section className="adm-section adm-section-wide">
          <h2 className="adm-section-title">Últimas doações cadastradas</h2>
          {data.ultimasDoacoes.length === 0 ? (
            <p className="adm-empty">Nenhuma doação cadastrada ainda.</p>
          ) : (
            <ul className="adm-lista">
              {data.ultimasDoacoes.map((d) => (
                <li key={d.id} className="adm-lista-item-rich">
                  <div className="adm-lista-info">
                    <span className="adm-lista-titulo">{d.tipoPeca}</span>
                    <span className="adm-lista-sub">
                      Tamanho {d.tamanho ?? "—"} · {d.cidade ?? "—"} ·{" "}
                      {formatData(d.criadoEm)}
                    </span>
                  </div>
                  <span className={`adm-badge ${statusClass[d.status] ?? ""}`}>
                    {d.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="adm-section">
          <h2 className="adm-section-title">Top tipos de peça</h2>
          {data.topTipos.length === 0 ? (
            <p className="adm-empty">Sem dados ainda.</p>
          ) : (
            <ul className="adm-lista">
              {data.topTipos.map((tp) => (
                <li key={tp.nome}>
                  <span>{tp.nome}</span>
                  <strong>{tp.total}</strong>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="adm-section">
          <h2 className="adm-section-title">Top cidades</h2>
          {data.topCidades.length === 0 ? (
            <p className="adm-empty">Sem dados ainda.</p>
          ) : (
            <ul className="adm-lista">
              {data.topCidades.map((c) => (
                <li key={c.nome}>
                  <span>{c.nome}</span>
                  <strong>{c.total}</strong>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
