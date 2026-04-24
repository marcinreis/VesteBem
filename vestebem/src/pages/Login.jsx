import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../pages_css/Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    senha: "",
  });

  const [tipo, setTipo] = useState("doador");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({ ...form, tipo });

    if (form.email && form.senha) {
      navigate("/");
    }
  };

  return (
    <div className="login-page">
      <div className="login-hero">
        <div style={{ fontSize: "2rem" }}>💚</div>
        <h1>VesteBem</h1>
        <p>Entre na sua conta</p>
      </div>

      <div className="login-card">
        <form onSubmit={handleSubmit}>
          {/* Tipo de usuário */}
          <div className="login-type-label">Entrar como</div>
          <div className="login-type-btns">
            <button
              type="button"
              className={`login-type-btn ${
                tipo === "doador" ? "active" : ""
              }`}
              onClick={() => setTipo("doador")}
            >
              Doador
            </button>

            <button
              type="button"
              className={`login-type-btn ${
                tipo === "ong" ? "active" : ""
              }`}
              onClick={() => setTipo("ong")}
            >
              ONG
            </button>
          </div>

          {/* Email */}
          <div className="login-input-group mb-3">
            <span className="input-icon">📧</span>
            <input
              type="email"
              name="email"
              placeholder="Seu email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Senha */}
          <div className="login-input-group mb-2">
            <span className="input-icon">🔒</span>
            <input
              type="password"
              name="senha"
              placeholder="Sua senha"
              value={form.senha}
              onChange={handleChange}
              required
            />
          </div>

          <div className="login-forgot">
            <a href="#">Esqueceu a senha?</a>
          </div>

          <button type="submit" className="login-btn-submit">
            Entrar
          </button>
        </form>

        <div className="login-signup">
          Não tem conta? <a href="#">Cadastre-se</a>
        </div>
      </div>

      <div className="login-legal">
        Ao continuar, você concorda com nossos <a href="#">Termos</a> e{" "}
        <a href="#">Privacidade</a>.
      </div>
    </div>
  );
}