import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        {/* Rotas futuras */}
        {/* <Route path="/cadastro" element={<Cadastro />} /> */}
        {/* <Route path="/esqueceu-senha" element={<EsqueceuSenha />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;