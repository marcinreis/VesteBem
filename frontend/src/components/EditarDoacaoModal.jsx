import { useState } from "react";
import "../pages_css/DoarRoupas.css";
import "./EditarDoacaoModal.css";

const tiposRoupa = ["Camiseta", "Calça", "Jaqueta", "Vestido", "Saia", "Shorts", "Moletom", "Camisa", "Blusa", "Outro"];
const tamanhos = ["PP", "P", "M", "G", "GG", "XG", "Infantil"];
const conservacoes = ["Excelente", "Bom", "Regular"];

export default function EditarDoacaoModal({ doacao, onSalvar, onFechar }) {
  const [tipoPeca, setTipoPeca] = useState(doacao.tipoPeca || "");
  const [tamanho, setTamanho] = useState(doacao.tamanho || "");
  const [conservacao, setConservacao] = useState(doacao.conservacao || "");
  const [cidade, setCidade] = useState(doacao.cidade || "");
  const [descricao, setDescricao] = useState(doacao.descricao || "");
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
      await onSalvar(doacao.id, {
        tipoPeca,
        tamanho,
        conservacao,
        cidade: cidade.trim(),
        descricao: descricao.trim() || undefined,
      });
    } catch (err) {
      setErro(err.message || "Erro ao salvar alterações.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onFechar}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Editar Doação</h2>
          <button type="button" className="modal-close" onClick={onFechar} aria-label="Fechar">
            ×
          </button>
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
              placeholder="Detalhes adicionais sobre a peça..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="doar-btn-cancel" onClick={onFechar} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="doar-btn-submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
