import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { criarDoacao } from "../services/doacoesService";
import "../pages_css/DoarRoupas.css";

const tiposRoupa = ["Camiseta", "Calça", "Jaqueta", "Vestido", "Saia", "Shorts", "Moletom", "Camisa", "Blusa", "Outro"];
const tamanhos = ["PP", "P", "M", "G", "GG", "XG", "Infantil"];
const conservacoes = ["Excelente", "Bom", "Regular"];

// Casa um valor livre (vindo de uma demanda) com uma das opções fixas, ignorando caixa.
const matchOpcao = (opcoes, valor) =>
  opcoes.find((o) => o.toLowerCase() === String(valor ?? "").toLowerCase()) ?? "";

export default function DoarRoupas() {
  const navigate = useNavigate();
  const location = useLocation();
  const demanda = location.state?.demanda ?? null;

  // Veio da Vitrine de demandas: já inicia tipo/tamanho quando batem com as opções.
  const [tipoPeca, setTipoPeca] = useState(() => matchOpcao(tiposRoupa, demanda?.tipoPeca));
  const [tamanho, setTamanho] = useState(() => matchOpcao(tamanhos, demanda?.tamanho));
  const [conservacao, setConservacao] = useState("");
  const [cidade, setCidade] = useState("");
  const [descricao, setDescricao] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (!tipoPeca || !tamanho || !conservacao || !cidade.trim()) {
      setErro("Preencha os campos obrigatórios: Tipo, Tamanho, Conservação e Cidade.");
      return;
    }

    setLoading(true);
    try {
      await criarDoacao({
        tipoPeca,
        tamanho,
        conservacao,
        cidade: cidade.trim(),
        descricao: descricao.trim() || undefined,
        // Quando veio da Vitrine de demandas, fecha o pedido atendido.
        demandaId: demanda?.id,
      });
      navigate(demanda ? "/demandas" : "/dashboard");
    } catch (err) {
      setErro(err.message || "Erro ao cadastrar doação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="doar-wrapper">
      <div className="doar-header">
        <h1 className="doar-title">Cadastrar Doação</h1>
        <p className="doar-subtitle">Preencha as informações sobre a peça que você deseja doar</p>
      </div>

      {demanda && (
        <div
          style={{
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            color: "#065f46",
            borderRadius: 10,
            padding: "10px 14px",
            margin: "0 0 16px",
            fontSize: 14,
          }}
        >
          Você está doando para atender um pedido:{" "}
          <strong>{demanda.tipoPeca}</strong>
          {demanda.tamanho ? <> · tamanho <strong>{demanda.tamanho}</strong></> : null}
        </div>
      )}

      <div className="doar-card">
        <div className="doar-card-header">
          <p className="doar-card-title">Informações da Peça</p>
          <p className="doar-card-desc">Quanto mais detalhes, melhor para quem precisa</p>
        </div>

        <form onSubmit={handleSubmit}>
          {erro && <div className="doar-error">{erro}</div>}

          <div className="doar-field">
            <label className="doar-label">Tipo de Roupa *</label>
            <div className="doar-chips">
              {tiposRoupa.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`doar-chip ${tipoPeca === t ? "active" : ""}`}
                  onClick={() => setTipoPeca(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="doar-row">
            <div className="doar-field">
              <label className="doar-label">Tamanho *</label>
              <div className="doar-chips">
                {tamanhos.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`doar-chip ${tamanho === t ? "active" : ""}`}
                    onClick={() => setTamanho(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="doar-field">
              <label className="doar-label">Estado de Conservação *</label>
              <div className="doar-chips">
                {conservacoes.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`doar-chip ${conservacao === c ? "active" : ""}`}
                    onClick={() => setConservacao(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="doar-field">
            <label className="doar-label">Cidade *</label>
            <input
              type="text"
              className="doar-input"
              placeholder="Ex: Fortaleza"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
            />
          </div>

          <div className="doar-field">
            <label className="doar-label">Descrição (opcional)</label>
            <textarea
              className="doar-textarea"
              placeholder="Ex: Camiseta azul com estampa, sem manchas, bem conservada..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
            />
          </div>

          <div className="doar-actions">
            <button
              type="button"
              className="doar-btn-cancel"
              onClick={() => navigate("/dashboard")}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="doar-btn-submit"
              disabled={loading}
            >
              {loading ? "Cadastrando..." : "Cadastrar Doação"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
