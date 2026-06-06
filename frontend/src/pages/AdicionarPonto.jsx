import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { criarPontoColeta } from "../services/pontosColetaService";
import "../pages_css/AdicionarPonto.css";

export default function AdicionarPonto() {
  const navigate = useNavigate();

  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [erroBusca, setErroBusca] = useState("");

  const [form, setForm] = useState({
    nome: "",
    endereco: "",
    cidade: "",
    lat: null,
    lng: null,
  });

  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Busca endereço via Nominatim ───────────────────────────
  const buscarEndereco = async () => {
    if (!busca.trim()) return;
    setBuscando(true);
    setErroBusca("");
    setResultados([]);

    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(busca)}&format=json&addressdetails=1&limit=5`;
      const res = await fetch(url, {
        headers: { "Accept-Language": "pt-BR" },
      });
      const data = await res.json();
      if (data.length === 0) setErroBusca("Nenhum endereço encontrado.");
      else setResultados(data);
    } catch {
      setErroBusca("Erro ao buscar endereço.");
    } finally {
      setBuscando(false);
    }
  };

  const selecionarResultado = (item) => {
    const cidade =
      item.address?.city ||
      item.address?.town ||
      item.address?.village ||
      item.address?.county ||
      "";

    const endereco = item.display_name.split(",").slice(0, 3).join(",").trim();

    setForm({
      ...form,
      endereco,
      cidade,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    });
    setResultados([]);
    setBusca(item.display_name);
  };

  // ── Submit ─────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (!form.nome.trim()) {
      setErro("Informe o nome do local.");
      return;
    }
    if (!form.lat || !form.lng) {
      setErro("Selecione um endereço na busca.");
      return;
    }

    setLoading(true);
    try {
      await criarPontoColeta(form);
      navigate("/pontos-de-coleta");
    } catch (err) {
      setErro(err.message || "Erro ao cadastrar ponto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ap-wrapper">

      <div className="ap-header">
        <h1 className="ap-title">Adicionar Ponto de Coleta</h1>
        <p className="ap-subtitle">Cadastre um novo local parceiro para receber doações</p>
      </div>

      <div className="ap-card">

        {/* Busca de endereço */}
        <div className="ap-field">
          <label className="ap-label">Buscar endereço</label>
          <div className="ap-busca-wrapper">
            <input
              type="text"
              className="ap-input"
              placeholder="Ex: Rua das Flores, 123, Fortaleza"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), buscarEndereco())}
            />
            <button
              type="button"
              className="ap-btn-buscar"
              onClick={buscarEndereco}
              disabled={buscando}
            >
              {buscando ? "Buscando..." : "Buscar"}
            </button>
          </div>
          {erroBusca && <p className="ap-erro-busca">{erroBusca}</p>}

          {/* Resultados da busca */}
          {resultados.length > 0 && (
            <ul className="ap-resultados">
              {resultados.map((item) => (
                <li
                  key={item.place_id}
                  className="ap-resultado-item"
                  onClick={() => selecionarResultado(item)}
                >
                  {item.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={handleSubmit}>

          {/* Endereço selecionado */}
          {form.lat && (
            <div className="ap-endereco-selecionado">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2ec4a5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
              <div>
                <p className="ap-endereco-texto">{form.endereco}</p>
                <p className="ap-coordenadas">
                  {form.cidade} · {form.lat.toFixed(5)}, {form.lng.toFixed(5)}
                </p>
              </div>
            </div>
          )}

          {/* Nome do local */}
          <div className="ap-field">
            <label className="ap-label">Nome do local *</label>
            <input
              type="text"
              className="ap-input"
              placeholder="Ex: Igreja São Francisco, Escola Municipal..."
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              required
            />
          </div>

          {/* Cidade (editável) */}
          <div className="ap-field">
            <label className="ap-label">Cidade *</label>
            <input
              type="text"
              className="ap-input"
              placeholder="Ex: Fortaleza"
              value={form.cidade}
              onChange={(e) => setForm({ ...form, cidade: e.target.value })}
              required
            />
          </div>

          {erro && <p className="ap-erro">{erro}</p>}

          <div className="ap-actions">
            <button
              type="button"
              className="ap-btn-cancelar"
              onClick={() => navigate("/admin/dashboard")}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="ap-btn-submit"
              disabled={loading}
            >
              {loading ? "Cadastrando..." : "Cadastrar ponto"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}