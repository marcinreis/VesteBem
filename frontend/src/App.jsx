import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import RotaPrivada from "./components/RotaPrivada";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro"
import RecuSenha from "./pages/RecuSenha";
import Dashboard from "./pages/Dashboard";
import DoarRoupas from "./pages/DoarRoupas";
import MinhasDoacoes from "./pages/MinhasDoacoes";
import Perfil from "./pages/Perfil";
import RelatorioAdmin from "./pages/RelatorioAdmin";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardOng from "./pages/DashboardOng";
import PontosDeColeta from "./pages/PontosDeColeta";


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
          <Route path="/minhas-doacoes"element={<MinhasDoacoes/>}/>
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/admin/dashboard" element={<DashboardAdmin />} />
          <Route path="/admin/relatorio" element={<RelatorioAdmin />} />
          <Route path="/ong/dashboard" element={<DashboardOng />} />
          <Route path="/pontos-de-coleta" element={<PontosDeColeta />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;