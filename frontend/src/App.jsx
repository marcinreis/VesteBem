import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import RotaPrivada from "./components/RotaPrivada";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro"
import RecuSenha from "./pages/RecuSenha";
import Dashboard from "./pages/Dashboard";
import DoarRoupas from "./pages/DoarRoupas";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/RecuSenha" element={<RecuSenha />} />
        <Route element={<RotaPrivada><Layout /></RotaPrivada>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/doarroupas" element={<DoarRoupas/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;