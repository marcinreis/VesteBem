import { useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../pages_css/Cadastro.css";
import { cadastrar } from "../services/authService";
import { useNavigate } from "react-router-dom";


const roles = [
  { id: "doador", label: "Doador", desc: "Quero doar roupas" },
  { id: "beneficiario", label: "Beneficiário/ONG", desc: "Preciso de roupas" },
];

export default function Cadastro() {
  const [selectedRole, setSelectedRole] = useState("doador");
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    telefone: "",
    endereco: "",
  });
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (form.senha !== form.confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await cadastrar(form.email, form.senha, {
        nome: form.nome,
        telefone: form.telefone || undefined,
        endereco: form.endereco || undefined,
        perfil: selectedRole,
      });
      navigate("/login");
    } catch (err) {
      setErro(err.message || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cadastro-wrapper d-flex flex-column align-items-center justify-content-center min-vh-100 px-3 py-5">
      {/* Header */}
      <div className="text-center mb-4">
        <span className="cadastro-heart-icon mb-3 d-block">&#x2665;</span>
        <h1 className="cadastro-title">Criar Conta</h1>
        <p className="cadastro-subtitle">Junte-se à nossa comunidade</p>
      </div>

      {/* Card */}
      <div className="cadastro-card">
        {/* Role Selector */}
        <div className="mb-4">
          <label className="cadastro-label mb-2">Cadastrar como:</label>
          <div className="row g-3">
            {roles.map((role) => (
              <div className="col-6" key={role.id}>
                <button
                  type="button"
                  className={`cadastro-role-card w-100 text-start ${
                    selectedRole === role.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <span className="cadastro-role-title">{role.label}</span>
                  <span className="cadastro-role-desc">{role.desc}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {erro && (
            <div className="alert alert-danger py-2 mb-3" role="alert">
              {erro}
            </div>
          )}
          <div className="row g-3">
            {/* Nome */}
            <div className="col-12 col-md-6">
              <label className="cadastro-label mb-1">Nome completo *</label>
              <div className="cadastro-input-wrapper">
                <span className="cadastro-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                </span>
                <input
                  type="text"
                  name="nome"
                  className="cadastro-input"
                  placeholder="João Silva"
                  value={form.nome}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="col-12 col-md-6">
              <label className="cadastro-label mb-1">E-mail *</label>
              <div className="cadastro-input-wrapper">
                <span className="cadastro-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="M2 7l10 7 10-7"/>
                  </svg>
                </span>
                <input
                  type="email"
                  name="email"
                  className="cadastro-input"
                  placeholder="joao@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div className="col-12 col-md-6">
              <label className="cadastro-label mb-1">Senha *</label>
              <div className="cadastro-input-wrapper">
                <span className="cadastro-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  type="password"
                  name="senha"
                  className="cadastro-input"
                  placeholder="8+ chars, letra, número e símbolo"
                  value={form.senha}
                  onChange={handleChange}
                  required
                  minLength={8}
                />
              </div>
            </div>

            {/* Confirmar Senha */}
            <div className="col-12 col-md-6">
              <label className="cadastro-label mb-1">Confirmar senha *</label>
              <div className="cadastro-input-wrapper">
                <span className="cadastro-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  type="password"
                  name="confirmarSenha"
                  className="cadastro-input"
                  placeholder="Digite a senha novamente"
                  value={form.confirmarSenha}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Telefone */}
            <div className="col-12 col-md-6">
              <label className="cadastro-label mb-1">Telefone</label>
              <div className="cadastro-input-wrapper">
                <span className="cadastro-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.08 4.18 2 2 0 0 1 5.07 2h3a2 2 0 0 1 2 1.72c.13 1 .37 1.97.72 2.91a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.17-1.17a2 2 0 0 1 2.11-.45c.94.35 1.91.59 2.91.72A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </span>
                <input
                  type="tel"
                  name="telefone"
                  className="cadastro-input"
                  placeholder="(11) 99999-9999"
                  value={form.telefone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Endereço */}
            <div className="col-12 col-md-6">
              <label className="cadastro-label mb-1">Endereço</label>
              <div className="cadastro-input-wrapper">
                <span className="cadastro-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                    <circle cx="12" cy="9" r="2.5"/>
                  </svg>
                </span>
                <input
                  type="text"
                  name="endereco"
                  className="cadastro-input"
                  placeholder="Cidade, Estado"
                  value={form.endereco}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="cadastro-btn-submit w-100 mt-4 mb-3" disabled={loading}>
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <p className="text-center cadastro-login-text mb-0">
          Já tem uma conta?{" "}
          <Link to="/login" className="cadastro-link-green fw-semibold">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}