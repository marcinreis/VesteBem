import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../pages_css/Perfil.css";
import { obterMeuPerfil, atualizarMeuPerfil } from "../services/usuariosService";

const perfilLabel = {
  doador: "Doador",
  beneficiario: "Beneficiário",
  ong: "ONG",
  admin: "Admin",
};

function iniciais(nome) {
  if (!nome) return "?";
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

export default function Perfil() {
  const [perfil, setPerfil] = useState(null);
  const [form, setForm] = useState({ nome: "", telefone: "", endereco: "" });
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    obterMeuPerfil()
      .then((dados) => {
        setPerfil(dados);
        setForm({
          nome: dados.nome ?? "",
          telefone: dados.telefone ?? "",
          endereco: dados.endereco ?? "",
        });
      })
      .catch((err) => setErro(err.message || "Erro ao carregar perfil."))
      .finally(() => setCarregando(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSucesso("");
  };

  const handleReset = () => {
    if (!perfil) return;
    setForm({
      nome: perfil.nome ?? "",
      telefone: perfil.telefone ?? "",
      endereco: perfil.endereco ?? "",
    });
    setErro("");
    setSucesso("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setSalvando(true);
    try {
      const atualizado = await atualizarMeuPerfil({
        nome: form.nome.trim(),
        telefone: form.telefone.trim() || null,
        endereco: form.endereco.trim() || null,
      });
      setPerfil(atualizado);
      setSucesso("Perfil atualizado com sucesso.");
    } catch (err) {
      setErro(err.message || "Erro ao salvar perfil.");
    } finally {
      setSalvando(false);
    }
  };

  const houveAlteracao =
    perfil &&
    (form.nome !== (perfil.nome ?? "") ||
      form.telefone !== (perfil.telefone ?? "") ||
      form.endereco !== (perfil.endereco ?? ""));

  return (
    <div className="perfil-wrapper">
      <div className="perfil-header">
        <div className="perfil-avatar">{iniciais(perfil?.nome ?? form.nome)}</div>
        <h1 className="perfil-title">Meu Perfil</h1>
        <p className="perfil-subtitle">Gerencie suas informações de conta</p>
      </div>

      <div className="perfil-card">
        {erro && <div className="perfil-feedback error" role="alert">{erro}</div>}
        {sucesso && <div className="perfil-feedback success" role="status">{sucesso}</div>}

        {carregando ? (
          <p className="text-center text-muted mb-0">Carregando...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* Nome */}
              <div className="col-12">
                <label className="perfil-label mb-1">Nome completo *</label>
                <div className="perfil-input-wrapper">
                  <span className="perfil-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4"/>
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>
                  </span>
                  <input
                    type="text"
                    name="nome"
                    className="perfil-input"
                    placeholder="João Silva"
                    value={form.nome}
                    onChange={handleChange}
                    required
                    minLength={2}
                    disabled={salvando}
                  />
                </div>
              </div>

              {/* Email (somente leitura) */}
              <div className="col-12 col-md-6">
                <label className="perfil-label mb-1">E-mail</label>
                <div className="perfil-input-wrapper readonly">
                  <span className="perfil-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="M2 7l10 7 10-7"/>
                    </svg>
                  </span>
                  <input
                    type="email"
                    className="perfil-input"
                    value={perfil?.email ?? ""}
                    disabled
                  />
                </div>
              </div>

              {/* Perfil (somente leitura) */}
              <div className="col-12 col-md-6">
                <label className="perfil-label mb-1">Tipo de conta</label>
                <div className="perfil-input-wrapper readonly">
                  <span className="perfil-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </span>
                  <span className="perfil-badge-perfil">
                    {perfilLabel[perfil?.perfil] ?? perfil?.perfil ?? "—"}
                  </span>
                </div>
              </div>

              {/* Telefone */}
              <div className="col-12 col-md-6">
                <label className="perfil-label mb-1">Telefone</label>
                <div className="perfil-input-wrapper">
                  <span className="perfil-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.08 4.18 2 2 0 0 1 5.07 2h3a2 2 0 0 1 2 1.72c.13 1 .37 1.97.72 2.91a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.17-1.17a2 2 0 0 1 2.11-.45c.94.35 1.91.59 2.91.72A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </span>
                  <input
                    type="tel"
                    name="telefone"
                    className="perfil-input"
                    placeholder="(11) 99999-9999"
                    value={form.telefone}
                    onChange={handleChange}
                    disabled={salvando}
                  />
                </div>
              </div>

              {/* Endereço */}
              <div className="col-12 col-md-6">
                <label className="perfil-label mb-1">Endereço</label>
                <div className="perfil-input-wrapper">
                  <span className="perfil-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                      <circle cx="12" cy="9" r="2.5"/>
                    </svg>
                  </span>
                  <input
                    type="text"
                    name="endereco"
                    className="perfil-input"
                    placeholder="Cidade, Estado"
                    value={form.endereco}
                    onChange={handleChange}
                    disabled={salvando}
                  />
                </div>
              </div>
            </div>

            <div className="perfil-actions">
              <button
                type="button"
                className="perfil-btn-secondary"
                onClick={handleReset}
                disabled={salvando || !houveAlteracao}
              >
                Desfazer
              </button>
              <button
                type="submit"
                className="perfil-btn-submit"
                disabled={salvando || !houveAlteracao}
              >
                {salvando ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
