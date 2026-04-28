import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro"
import RecuSenha from "./pages/RecuSenha";
import RotaPrivada from "./components/RotaPrivada";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/RecuSenha" element={<RecuSenha />} />
        <Route path="/dashboard" element={
          <RotaPrivada>
          <Dashboard />
          </RotaPrivada>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;