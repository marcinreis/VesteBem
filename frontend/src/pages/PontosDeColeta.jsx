import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { listarPontosColeta } from "../services/pontosColetaService";
import "leaflet/dist/leaflet.css";
import "../pages_css/PontosDeColeta.css";

// Corrige o ícone padrão do Leaflet que quebra no Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const FORTALEZA = [-3.7172, -38.5433];

export default function PontosDeColeta() {
  const [pontos, setPontos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    listarPontosColeta()
      .then(setPontos)
      .catch((err) => setErro(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pdc-wrapper">

      {/* Header */}
      <div className="pdc-header">
        <div>
          <h1 className="pdc-title">Pontos de Coleta</h1>
          <p className="pdc-subtitle">
            Locais parceiros onde você pode entregar suas doações
          </p>
        </div>
        <span className="pdc-contador">
          {pontos.length} {pontos.length === 1 ? "ponto" : "pontos"} na região
        </span>
      </div>

      {/* Mapa */}
      <div className="pdc-mapa-wrapper">
        {loading ? (
          <div className="pdc-loading">Carregando mapa...</div>
        ) : (
          <MapContainer
            center={FORTALEZA}
            zoom={13}
            className="pdc-mapa"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {pontos.map((ponto) => (
              <Marker key={ponto.id} position={[ponto.lat, ponto.lng]}>
                <Popup>
                  <div className="pdc-popup">
                    <p className="pdc-popup-nome">{ponto.nome}</p>
                    <p className="pdc-popup-endereco">{ponto.endereco}</p>
                    <p className="pdc-popup-cidade">{ponto.cidade}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Lista de pontos */}
      <div className="pdc-lista-wrapper">
        <h2 className="pdc-lista-titulo">Todos os pontos</h2>
        {erro && <p className="pdc-erro">{erro}</p>}
        {!loading && pontos.length === 0 && (
          <p className="pdc-empty">Nenhum ponto de coleta cadastrado ainda.</p>
        )}
        <div className="pdc-grid">
          {pontos.map((ponto) => (
            <div className="pdc-card" key={ponto.id}>
              <div className="pdc-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2ec4a5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5"/>
                </svg>
              </div>
              <div className="pdc-card-info">
                <p className="pdc-card-nome">{ponto.nome}</p>
                <p className="pdc-card-endereco">{ponto.endereco}</p>
                <p className="pdc-card-cidade">{ponto.cidade}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}