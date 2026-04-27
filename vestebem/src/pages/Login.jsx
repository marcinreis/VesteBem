import { useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../pages_css/Login.css";

const roles = ["Doador", "Beneficiário", "Admin"];

export default function Login() {
  const [selectedRole, setSelectedRole] = useState("Doador");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ role: selectedRole, email, password });
  };

  return (
    <div className="login-wrapper d-flex flex-column align-items-center justify-content-center min-vh-100 px-3">
      {/* Header */}
      <div className="text-center mb-4">
        <span className="login-heart-icon mb-3 d-block">&#x2665;</span>
        <h1 className="login-title">Bem-vindo ao VesteBem</h1>
        <p className="login-subtitle">Faça login para continuar</p>
      </div>

      {/* Card */}
      <div className="login-card">
        {/* Role Selector */}
        <div className="mb-4">
          <label className="login-label mb-2">Entrar como:</label>
          <div className="d-flex gap-2">
            {roles.map((role) => (
              <button
                key={role}
                type="button"
                className={`login-role-btn ${selectedRole === role ? "active" : ""}`}
                onClick={() => setSelectedRole(role)}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-3">
            <label className="login-label mb-1">E-mail</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="M2 7l10 7 10-7"/>
                </svg>
              </span>
              <input
                type="email"
                className="login-input"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="login-label mb-1">Senha</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                type="password"
                className="login-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Forgot password */}
          <div className="text-end mb-4">
            <Link to="/esqueceu-senha" className="login-link-green">
              Esqueceu sua senha?
            </Link>
          </div>

          {/* Submit */}
          <button type="submit" className="login-btn-submit w-100 mb-3">
            Entrar
          </button>
        </form>

        {/* Register */}
        <p className="text-center login-register-text mb-0">
          Não tem uma conta?{" "}
          <Link to="/cadastro" className="login-link-green fw-semibold">
            Cadastre-se
          </Link>
        </p>
      </div>

      {/* Footer */}
      <p className="login-footer-text mt-4 text-center">
        Ao continuar, você concorda com nossos{" "}
        <span className="login-link-muted">Termos de Uso</span> e{" "}
        <span className="login-link-muted">Política de Privacidade</span>
      </p>
    </div>
  );
}