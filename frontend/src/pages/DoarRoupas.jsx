import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { collection, addDoc } from "firebase/firestore";
import "../pages_css/DoarRoupas.css";

const tiposRoupa = ["Camiseta", "Calça", "Jaqueta", "Vestido", "Saia", "Shorts", "Moletom", "Camisa", "Blusa", "Outro"];
const tamanhos = ["PP", "P", "M", "G", "GG", "XG", "Infantil"];
const conservacoes = ["Excelente", "Bom", "Regular"];

export default function DoarRoupas() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [tipo, setTipo] = useState("");
  const [tamanho, setTamanho] = useState("");
  const [conservacao, setConservacao] = useState("");
  const [descricao, setDescricao] = useState("");
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoto(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tipo || !tamanho || !conservacao) {
      alert("Preencha os campos obrigatórios: Tipo, Tamanho e Conservação.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "doacoes"), {
        tipo,
        tamanho,
        conservacao,
        descricao,
        doadorUid: auth.currentUser.uid,
        status: "disponivel",
        criadoEm: new Date(),
      });
      navigate("/dashboard");
    } catch (err) {
      alert("Erro ao cadastrar doação.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="doar-wrapper">
      {/* Cabeçalho da página */}
      <div className="doar-header">
        <h1 className="doar-title">Cadastrar Doação</h1>
        <p className="doar-subtitle">Preencha as informações sobre a peça que você deseja doar</p>
      </div>

      {/* Card do formulário */}
      <div className="doar-card">
        <div className="doar-card-header">
          <p className="doar-card-title">Informações da Peça</p>
          <p className="doar-card-desc">Quanto mais detalhes, melhor para quem precisa</p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Tipo de Roupa */}
          <div className="doar-field">
            <label className="doar-label">Tipo de Roupa *</label>
            <div className="doar-chips">
              {tiposRoupa.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`doar-chip ${tipo === t ? "active" : ""}`}
                  onClick={() => setTipo(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Tamanho + Conservação */}
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

          {/* Descrição */}
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

          {/* Upload de foto */}
          <div className="doar-field">
            <label className="doar-label">Foto da Peça (opcional)</label>
            <div
              className={`doar-upload ${fotoPreview ? "has-preview" : ""}`}
              onClick={() => fileInputRef.current.click()}
            >
              {fotoPreview ? (
                <img src={fotoPreview} alt="Preview" className="doar-preview-img" />
              ) : (
                <>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <p className="doar-upload-text">Clique para fazer upload</p>
                  <p className="doar-upload-hint">PNG, JPG até 5MB</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg"
              style={{ display: "none" }}
              onChange={handleFoto}
            />
          </div>

          {/* Botões */}
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