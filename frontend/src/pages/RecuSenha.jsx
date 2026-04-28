import { useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../pages_css/RecuSenha.css";
import { recuperarSenha } from "../services/authService";

export default function RecuSenha() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await recuperarSenha(email);
    alert("Instruções enviadas para o seu e-mail!");
  } catch (err) {
    alert("E-mail não encontrado.");
    console.error(err);
  }
};

  return (
    <div className="recu-wrapper d-flex flex-column align-items-center justify-content-center min-vh-100 px-3">

      {/* Voltar */}
      <div className="recu-back-wrapper">
        <Link to="/login" className="recu-back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          Voltar para login
        </Link>
      </div>

      {/* Header */}
      <div className="text-center mb-4">
        <span className="recu-heart-icon mb-3 d-block">&#x2665;</span>
        <h1 className="recu-title">Recuperar Senha</h1>
        <p className="recu-subtitle">Digite seu e-mail para receber instruções</p>
      </div>

      {/* Card */}
      <div className="recu-card">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="recu-label mb-1">E-mail cadastrado</label>
            <div className="recu-input-wrapper">
              <span className="recu-input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="M2 7l10 7 10-7"/>
                </svg>
              </span>
              <input
                type="email"
                className="recu-input"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="recu-btn-submit w-100">
            Enviar instruções
          </button>
        </form>
      </div>

    </div>
  );
}