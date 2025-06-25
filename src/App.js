import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Imposta icona corretta
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function App() {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.error("Errore geolocalizzazione:", err);
      }
    );
  }, []);

  return (
    <div style={{ height: "100vh" }}>
      {position && (
        <MapContainer center={position} zoom={16} style={{ height: "100%" }}>
          {/* Satellite style da Esri o Mapbox */}
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="© Esri, Maxar, Earthstar Geographics"
          />
          <Marker position={position}>
            <Popup>Sei qui!</Popup>
          </Marker>
        </MapContainer>
      )}
      {!position && <p>Caricamento posizione GPS...</p>}
    </div>
  );
}

export default App;