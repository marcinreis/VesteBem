import { useEffect, useState } from "react";
import { obterRelatorioImpacto } from "../services/adminService";
import "../pages_css/RelatorioAdmin.css";

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

const perfilLabel = {
  doador: "Doadores",
  beneficiario: "Beneficiários",
  ong: "ONGs",
  admin: "Administradores",
};

export default function RelatorioAdmin() {
  const [data, setData] = useState(null);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obterRelatorioImpacto()
      .then(setData)
      .catch((err) => setErro(err.message || "Erro ao carregar relatório."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="rel-empty">Carregando relatório...</p>;
  if (erro) return <p className="rel-erro">{erro}</p>;
  if (!data) return null;

  const cards = [
    { label: "Total de Doações", valor: data.totais.doacoes, cor: "#3b82f6" },
    { label: "Disponíveis", valor: data.totais.disponiveis, cor: "#2ec4a5" },
    { label: "Entregues", valor: data.totais.entregues, cor: "#f59e0b" },
    { label: "Canceladas", valor: data.totais.canceladas, cor: "#ef4444" },
    { label: "Usuários Cadastrados", valor: data.totais.usuarios, cor: "#8b5cf6" },
  ];

  return (
    <div className="rel-wrapper">
      <div className="rel-header">
        <h1 className="rel-title">Relatório de Impacto Social</h1>
        <p className="rel-subtitle">
          Resumo da plataforma — gerado em{" "}
          {new Date(data.geradoEm).toLocaleString("pt-BR")}
        </p>
      </div>

      <div className="rel-cards">
        {cards.map((c) => (
          <div className="rel-card" key={c.label}>
            <span className="rel-card-label">{c.label}</span>
            <span className="rel-card-valor" style={{ color: c.cor }}>
              {c.valor}
            </span>
          </div>
        ))}
      </div>

      <div className="rel-grid">
        <section className="rel-section">
          <h2 className="rel-section-title">Usuários por Perfil</h2>
          <ul className="rel-lista">
            {Object.entries(data.usuariosPorPerfil).map(([k, v]) => (
              <li key={k}>
                <span>{perfilLabel[k] ?? k}</span>
                <strong>{v}</strong>
              </li>
            ))}
          </ul>
        </section>

        <section className="rel-section">
          <h2 className="rel-section-title">Top Tipos de Peça</h2>
          {data.topTipos.length === 0 ? (
            <p className="rel-empty">Sem dados ainda.</p>
          ) : (
            <ul className="rel-lista">
              {data.topTipos.map((t) => (
                <li key={t.nome}>
                  <span>{t.nome}</span>
                  <strong>{t.total}</strong>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rel-section">
          <h2 className="rel-section-title">Top Cidades</h2>
          {data.topCidades.length === 0 ? (
            <p className="rel-empty">Sem dados ainda.</p>
          ) : (
            <ul className="rel-lista">
              {data.topCidades.map((c) => (
                <li key={c.nome}>
                  <span>{c.nome}</span>
                  <strong>{c.total}</strong>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rel-section">
          <h2 className="rel-section-title">Últimas Entregas</h2>
          {data.ultimasEntregas.length === 0 ? (
            <p className="rel-empty">Nenhuma entrega registrada.</p>
          ) : (
            <ul className="rel-lista">
              {data.ultimasEntregas.map((d) => (
                <li key={d.id}>
                  <span>
                    {d.tipoPeca} — {d.tamanho ?? "—"} ({d.cidade ?? "—"})
                  </span>
                  <strong>{formatData(d.atualizadoEm)}</strong>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
