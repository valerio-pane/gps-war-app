import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Circle,
  Popup,
  Pane,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

// Motivazioni randomiche per le tratte
const motiviTratte = [
  "Rotta ottimizzata per evitare aree ad alto rischio e massimizzare la sicurezza.",
  "Percorso commerciale scelto per facilitare supporto logistico.",
  "Tratta pianificata per coprire zone strategiche e garantire deterrenza.",
  "Missione di pattugliamento in aree sensibili o di crisi.",
  "Evita acque territoriali ostili per ridurre la vulnerabilità a minacce."
];

// BASI militari con informazioni analitiche documentate
const basi = [
  {
    nome: "Aviano Air Base",
    coord: [46.0285, 12.6215],
    tipo: "confermata",
    funzione: `Una delle principali basi aeree USA/NATO in Europa, situata in Friuli Venezia Giulia.
Ospita il 31st Fighter Wing dell’US Air Force con caccia F-16.
Ruolo chiave per operazioni aeree in Europa sudorientale, Mediterraneo e Medio Oriente.
Base utilizzata anche per missioni di deterrenza nucleare (presenza di ordigni B61 non confermata ufficialmente).
Frequentemente coinvolta in esercitazioni NATO e missioni reali, come i raid nei Balcani e in Libia.`,
    note: `Circa 3.000 militari americani e 600 civili impiegati nella struttura.
Pista di 2.800 metri. Strutture di comando, logistica, manutenzione velivoli, depositi munizioni.
Personale italiano per sicurezza e controllo spazio aereo.`
  },
  {
    nome: "NAS Sigonella",
    coord: [37.4169, 14.9097],
    tipo: "confermata",
    funzione: `Considerata “la portaerei sul suolo” per il Mediterraneo, strategica per la proiezione navale e aerea USA/NATO nel Sud Europa e Africa.
Supporta missioni logistiche, intelligence, droni e attività di sorveglianza.
Fondamentale nelle operazioni in Libia e nel monitoraggio dei flussi migratori e delle crisi nel Mediterraneo.`,
    note: `Ospita personale della US Navy, US Air Force, NATO e agenzie civili americane.
Due piste (2.400 m e 1.800 m), hangar, depositi carburante, centri comando.`
  },
  {
    nome: "Ghedi Air Base",
    coord: [45.4311, 10.2782],
    tipo: "confermata",
    funzione: `Base aerea italiana, con presenza significativa USA/NATO.
Dotata di velivoli Tornado e destinata a ricevere i nuovi F-35.
Ruolo nel sistema di deterrenza nucleare NATO (partnership “nuclear sharing”).
Usata anche per esercitazioni e operazioni di supporto alle missioni NATO.`,
    note: `Pista di 2.990 metri. Magazzini, strutture di manutenzione, alloggi militari.
Presenza USAF in attività congiunte.`
  },
  {
    nome: "Camp Darby",
    coord: [43.6497, 10.3733],
    tipo: "confermata",
    funzione: `Area logistica strategica tra Pisa e Livorno.
Deposito di munizioni, veicoli, carburanti e materiali, punto di snodo per le operazioni USA in Europa, Medio Oriente e Africa.
Il più grande deposito logistico USA fuori dagli Stati Uniti.
Gestita da US Army, US Air Force e US Navy.
Usata per supportare i contingenti USA in caso di crisi.`,
    note: `Deposito su area di 8.000 ettari. Binari ferroviari interni, collegamento diretto con porto di Livorno. Capacità di stoccaggio circa 125.000 tonnellate materiali.`
  },
  {
    nome: "Caserma Ederle",
    coord: [45.542, 11.535],
    tipo: "confermata",
    funzione: `Centro di comando per le forze terrestri USA in Italia e in Europa meridionale.
Sede della 173rd Airborne Brigade.
Fondamentale per la logistica e il comando delle operazioni NATO-USA.
Ospita anche il Centro di Eccellenza NATO per le operazioni terrestri.`,
    note: `Strutture di comando, alloggi, poligoni addestramento. Collegamento con base Del Din per espansione capacità operative.`
  },
  {
    nome: "NSA Naples",
    coord: [40.8448, 14.2525],
    tipo: "confermata",
    funzione: `Quartier generale delle forze navali USA in Europa (US Sixth Fleet).
Centro di comando e di supporto operativo per le attività navali NATO e USA nel Mediterraneo.
Fondamentale per la gestione delle crisi e delle operazioni navali in Europa, Africa e Medio Oriente.
Ospita anche personale NATO e quartier generali multinazionali.`,
    note: `Struttura a Capodichino e Lago Patria. Centri comando operazioni, logistica, alloggi, sicurezza informatica.`
  },
  {
    nome: "UN Logistics Base Brindisi",
    coord: [40.64, 17.962],
    tipo: "confermata",
    funzione: `Base logistica delle Nazioni Unite, punto di transito e supporto per missioni ONU in Africa, Medio Oriente e Balcani.
Usata anche per attività di cooperazione internazionale e addestramento.`,
    note: `Magazzini, centri smistamento materiali, aree addestramento, uffici amministrativi.`
  },
  {
    nome: "NSA La Maddalena",
    coord: [41.2111, 9.4058],
    tipo: "ipotetica",
    funzione: `Ex base sottomarini USA, chiusa nel 2008 ma ancora oggetto di accordi per uso occasionale o in caso di crisi.
Ha avuto un ruolo fondamentale durante la Guerra Fredda.`,
    note: `Banchine, officine sommergibili dismesse, spazi logistica in parte riconvertiti a usi civili.`
  },
  {
    nome: "NAS Gaeta",
    coord: [41.2108, 13.5695],
    tipo: "ipotetica",
    funzione: `Base della US Navy utilizzata come porto di appoggio logistico per la Sesta Flotta USA.
Punto strategico per manovre navali nel Tirreno e nel Mediterraneo occidentale.`,
    note: `Banchina ormeggio, magazzini, alloggi personale, collegamento diretto con comando Napoli.`
  }
];

// Navi alleate e rotte
const navi = [
  {
    nome: "USS Gerald R. Ford",
    descrizione: "Portaerei nucleare USA in missione deterrente.",
    paese: "USA",
    motivoTransito: "Operazione di deterrenza, pattugliamento NATO e supporto a Israele.",
    velocita: 50,
    percorso: [
      [36.85, -76.29],
      [37.0, 10.0],
      [34.0, 20.0],
      [32.0, 30.0],
    ],
    partenza: "2025-06-25T01:00:00Z",
  },
  {
    nome: "INS Eilat",
    descrizione: "Fregata israeliana in missione di pattugliamento.",
    paese: "Israele",
    motivoTransito: "Protezione traffico commerciale e presenza militare.",
    velocita: 38,
    percorso: [
      [32.08, 34.80],
      [33.0, 28.0],
      [34.0, 22.0],
      [36.0, 15.0],
    ],
    partenza: "2025-06-25T12:00:00Z",
  },
  {
    nome: "HMS Prince of Wales",
    descrizione: "Portaerei britannica in esercitazione congiunta.",
    paese: "UK",
    motivoTransito: "Esercitazione e supporto a operazioni NATO e Israele.",
    velocita: 44,
    percorso: [
      [50.8, -1.1],
      [38.0, 10.0],
      [34.0, 18.0],
      [32.0, 30.0],
    ],
    partenza: "2025-06-24T18:00:00Z",
  },
  {
    nome: "FS Charles de Gaulle",
    descrizione: "Portaerei francese in operazione rafforzata.",
    paese: "Francia",
    motivoTransito: "Presenza rafforzata e collaborazione sicurezza marittima.",
    velocita: 42,
    percorso: [
      [43.1, 5.9],
      [36.0, 18.0],
      [34.0, 22.0],
      [32.0, 30.0],
    ],
    partenza: "2025-06-25T06:00:00Z",
  },
  {
    nome: "ITS Cavour",
    descrizione: "Portaerei italiana in missione multinazionale.",
    paese: "Italia",
    motivoTransito: "Addestramento multinazionale e supporto a sicurezza mediterranea.",
    velocita: 35,
    percorso: [
      [42.0, 12.0],
      [38.0, 16.0],
      [35.0, 20.0],
      [32.0, 30.0],
    ],
    partenza: "2025-06-25T00:00:00Z",
  },
  {
    nome: "Eastern Mediterranean Patrol",
    descrizione: "Pattugliamento USA/Israele tra Creta, Cipro e largo Israele.",
    paese: "USA/Israele",
    motivoTransito: "Presenza militare e deterrenza.",
    velocita: 38,
    percorso: [
      [34.5, 28.0],
      [34.6, 32.0],
      [32.0, 34.0],
      [34.5, 28.0],
    ],
    partenza: "2025-06-24T00:00:00Z",
    loop: true,
  },
  {
    nome: "Red Sea Deployment",
    descrizione: "Transito strategico verso il Mar Rosso tramite Suez.",
    paese: "USA/Israele",
    motivoTransito: "Transito verso il Corno d'Africa e Golfo Persico.",
    velocita: 35,
    percorso: [
      [32.08, 34.80],
      [31.0, 32.0],
      [29.9, 32.55],
      [27.0, 34.0],
    ],
    partenza: "2025-06-24T06:00:00Z",
  },
  {
    nome: "Straits of Sicily Surveillance",
    descrizione: "Pattugliamento tra Tunisia, Sicilia e Malta.",
    paese: "USA/Israele",
    motivoTransito: "Controllo rotte migratorie e traffici illeciti.",
    velocita: 32,
    percorso: [
      [37.0, 10.0],
      [36.5, 13.0],
      [35.9, 14.5],
      [37.0, 10.0],
    ],
    partenza: "2025-06-24T12:00:00Z",
    loop: true,
  },
  {
    nome: "Cyprus Air & Sea Bridge",
    descrizione: "Rotta di rifornimento tra Cipro e Israele.",
    paese: "USA/UK/FR",
    motivoTransito: "Supporto logistico e transito forze speciali.",
    velocita: 38,
    percorso: [
      [34.7, 32.7],
      [32.0, 34.8],
      [34.7, 32.7]
    ],
    partenza: "2025-06-24T09:00:00Z",
    loop: true,
  },
  {
    nome: "Haifa–Sicily–Toulon",
    descrizione: "Transito tra Israele, Sicilia e la Francia.",
    paese: "Francia/Italia/Israele",
    motivoTransito: "Rotazione flotte, esercitazioni e protezione convogli.",
    velocita: 40,
    percorso: [
      [32.8, 35.0],
      [37.5, 15.1],
      [43.1, 5.9],
      [32.8, 35.0]
    ],
    partenza: "2025-06-24T15:00:00Z",
    loop: true,
  },
  {
    nome: "Aegean–Crete–Libya Route",
    descrizione: "Pattugliamento tra Egeo, Creta e costa libica.",
    paese: "NATO",
    motivoTransito: "Controllo traffici e presenza in aree instabili.",
    velocita: 35,
    percorso: [
      [38.0, 24.0],
      [35.2, 25.1],
      [33.2, 13.2],
      [38.0, 24.0]
    ],
    partenza: "2025-06-24T07:00:00Z",
    loop: true,
  },
  {
    nome: "Black Sea Monitoring",
    descrizione: "Monitoraggio accessi e traffici Mar Nero.",
    paese: "NATO",
    motivoTransito: "Sorveglianza strategica area Mar Nero.",
    velocita: 45,
    percorso: [
      [44.6, 33.5],
      [44.5, 37.9],
      [43.0, 41.0],
      [42.0, 38.0],
      [44.6, 33.5]
    ],
    partenza: "2025-06-25T04:00:00Z",
    loop: true,
  },
  {
    nome: "Suez–Gib Convoy",
    descrizione: "Convoglio militare Suez-Gibilterra.",
    paese: "USA/UK",
    motivoTransito: "Sicurezza transiti vitali Suez-Mediterraneo occidentale.",
    velocita: 40,
    percorso: [
      [29.9, 32.55],
      [34.0, 20.0],
      [36.1, -5.36]
    ],
    partenza: "2025-06-24T22:00:00Z",
  }
];

// Funzioni di supporto
const haversine = (c1, c2) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(c2[0] - c1[0]);
  const dLon = toRad(c2[1] - c1[1]);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(c1[0])) * Math.cos(toRad(c2[0])) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
const interpola = ([a1, b1], [a2, b2], t) => [
  a1 + (a2 - a1) * t,
  b1 + (b2 - b1) * t,
];

function calcolaPosizioneNave({ percorso, velocita, partenza, loop }) {
  if (!percorso || percorso.length < 2) return percorso[0];
  const now = new Date();
  const start = new Date(partenza);
  let ore = (now - start) / 3600000;
  if (ore < 0) return percorso[0];
  const lung = percorso.reduce(
    (a, c, i) => (i ? a + haversine(percorso[i - 1], c) : 0),
    0
  );
  const coperto = velocita * ore;
  let progress = coperto / lung;
  if (loop) progress = progress % 1;
  else if (progress >= 1) return percorso[percorso.length - 1];
  let acc = 0;
  for (let i = 1; i < percorso.length; i++) {
    const d = haversine(percorso[i - 1], percorso[i]);
    const prev = acc / lung;
    const next = (acc + d) / lung;
    if (progress >= prev && progress <= next) {
      const t = (progress - prev) / (next - prev);
      return interpola(percorso[i - 1], percorso[i], t);
    }
    acc += d;
  }
  return percorso[percorso.length - 1];
}

function useZoomLevel() {
  const [zoom, setZoom] = useState(6);
  useMapEvents({
    zoomend: (e) => setZoom(e.target.getZoom()),
  });
  return zoom;
}

function approxRoutesWhenZoomLow(navi, zoom) {
  if (zoom >= 6) return navi.map(n => n.percorso);

  const grouped = {};
  navi.forEach(n => {
    const start = n.percorso[0].map(x => x.toFixed(2)).join(',');
    const end = n.percorso[n.percorso.length - 1].map(x => x.toFixed(2)).join(',');
    const key = start + '-' + end;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(n.percorso);
  });
  return Object.values(grouped).map(group => {
    if (group.length === 1) return group[0];
    const len = Math.min(...group.map(r => r.length));
    if (len > 2) {
      const avgRoute = [];
      for (let i = 0; i < len; i++) {
        let sumLat = 0, sumLon = 0;
        group.forEach(r => {
          sumLat += r[i][0];
          sumLon += r[i][1];
        });
        avgRoute.push([sumLat / group.length, sumLon / group.length]);
      }
      return avgRoute;
    } else {
      const startLat = group.reduce((a, r) => a + r[0][0], 0) / group.length;
      const startLon = group.reduce((a, r) => a + r[0][1], 0) / group.length;
      const endLat = group.reduce((a, r) => a + r[r.length-1][0], 0) / group.length;
      const endLon = group.reduce((a, r) => a + r[r.length-1][1], 0) / group.length;
      return [
        [startLat, startLon],
        [endLat, endLon]
      ];
    }
  });
}

function NavyMarker({ center, zoom, popup }) {
  const minR = 8, maxR = 17;
  let r = minR + (maxR - minR) * ((zoom - 4) / 10);
  if (r < minR) r = minR;
  if (r > maxR) r = maxR;
  return (
    <CircleMarker
      center={center}
      radius={r}
      pathOptions={{
        color: "#000",
        fillColor: "#000",
        fillOpacity: 1,
        weight: 2.1,
      }}
      pane="navy-markers"
    >
      {popup && (
        <Popup>
          <div className="popup-navy">{popup}</div>
        </Popup>
      )}
    </CircleMarker>
  );
}

function AccuracyCircle({ pos, accuracy }) {
  if (!accuracy || accuracy > 5000) return null;
  return (
    <Circle
      center={pos}
      radius={accuracy}
      pathOptions={{
        color: "#ffd600",
        fillColor: "#ffd600",
        fillOpacity: 0.12,
        weight: 1.8,
        dashArray: "2 6",
      }}
      pane="gps-marker"
    />
  );
}

function GpsPin({ pos, accuracy, zoom }) {
  return (
    <>
      <CircleMarker
        center={pos}
        radius={8}
        pathOptions={{
          color: "#ffd600",
          fillColor: "#ffd600",
          fillOpacity: 0.8,
          weight: 2.1,
          dashArray: "2 2 2 6",
        }}
        pane="gps-marker"
      >
        <Popup>
          <div className="popup-gps">
            <b>La tua posizione</b>
            <br />
            <span className="gps-coords">
              Lat: {pos[0].toFixed(5)}, Lon: {pos[1].toFixed(5)}
            </span>
            {accuracy && (
              <>
                <br />
                <span className="gps-accuracy">
                  Precisione: {Math.round(accuracy)} m
                </span>
              </>
            )}
          </div>
        </Popup>
      </CircleMarker>
      <AccuracyCircle pos={pos} accuracy={accuracy} />
    </>
  );
}

function stimaRaggioEBreveMotivo(base) {
  const popolazioneVicino = {
    "Aviano Air Base": 300,
    "Caserma Ederle": 850,
    "Camp Darby": 450,
    "NAS Sigonella": 320,
    "NSA Naples": 1400,
    "Ghedi Air Base": 400,
    "UN Logistics Base Brindisi": 250,
    "NSA La Maddalena": 55,
    "NAS Gaeta": 120,
  };
  const storiciBomb = {
    "Aviano Air Base": true,
    "Caserma Ederle": false,
    "Camp Darby": true,
    "NAS Sigonella": true,
    "NSA Naples": true,
    "Ghedi Air Base": false,
    "UN Logistics Base Brindisi": false,
    "NSA La Maddalena": false,
    "NAS Gaeta": false,
  };
  const romaCoords = [41.9027835, 12.4963655];
  const distRoma = haversine(base.coord, romaCoords);

  let raggio = 60;
  let motivi = [];

  if (distRoma < 45) {
    raggio = Math.min(raggio, distRoma - 7);
    motivi.push("raggio ridotto per non coinvolgere Roma, protetta da convenzioni");
  }

  const pop = popolazioneVicino[base.nome] ?? 400;
  if (pop > 700) {
    raggio = Math.min(raggio, 35);
    motivi.push("area densamente popolata: zona di rischio ridotta per minimizzare danni civili");
  } else if (pop < 200) {
    raggio = Math.max(raggio, 80);
    motivi.push("zona scarsamente abitata: rischio maggiore di danni collaterali ridotto");
  }

  if (storiciBomb[base.nome]) {
    raggio = Math.max(raggio, 70);
    motivi.push("storicamente soggetta a bombardamenti");
  }

  if (raggio < 25) raggio = 25;
  if (raggio > 120) raggio = 120;

  return {
    raggio,
    motivo:
      "Fattori: diritto internazionale, densità popolazione, storia bombardamenti. " +
      (motivi.join(", ") || "nessuna limitazione particolare"),
  };
}

export default function App() {
  const [pos, setPos] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [accuracyMsg, setAccuracyMsg] = useState("");
  const [gpsLog, setGpsLog] = useState(() => {
    const saved = localStorage.getItem("gpsLog");
    return saved ? JSON.parse(saved) : [];
  });
  const [accurateMode, setAccurateMode] = useState(false);
  const watchId = useRef(null);

  useEffect(() => {
    localStorage.setItem("gpsLog", JSON.stringify(gpsLog));
  }, [gpsLog]);

  useEffect(() => {
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = navigator.geolocation.watchPosition(
      (p) => {
        setPos([p.coords.latitude, p.coords.longitude]);
        setAccuracy(p.coords.accuracy);
        setAccuracyMsg(
          "Geolocalizzazione attiva (" +
            Math.round(p.coords.accuracy) +
            " m)"
        );
        setAccurateMode(true);
      },
      (err) => {
        setAccuracyMsg("Geolocalizzazione non attiva o non disponibile");
      },
      { enableHighAccuracy: false, maximumAge: 60000, timeout: 5000 }
    );
    return () => {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  useEffect(() => {
    if (!accurateMode) return;
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = navigator.geolocation.watchPosition(
      (p) => {
        setPos([p.coords.latitude, p.coords.longitude]);
        setAccuracy(p.coords.accuracy);
        setAccuracyMsg(
          "Geolocalizzazione attiva (" +
            Math.round(p.coords.accuracy) +
            " m)"
        );
        if (p.coords.accuracy < 400) {
          setGpsLog((prev) => {
            const newPos = [p.coords.latitude, p.coords.longitude];
            if (
              prev.length === 0 ||
              haversine(prev[prev.length - 1], newPos) > 2
            ) {
              return [...prev, newPos];
            }
            return prev;
          });
        }
      },
      (err) => {
        setAccuracyMsg("Geolocalizzazione non attiva o non disponibile");
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 }
    );
    return () => {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [accurateMode]);

  function MapContent() {
    const zoom = useZoomLevel();
    const posizioni = navi.map(calcolaPosizioneNave);

    const showBaseMarkers = zoom >= 8;
    const showNavyMarkers = true;
    const rotte = approxRoutesWhenZoomLow(navi, zoom);

    return (
      <>
        {rotte.map((route, i) => (
          <Polyline
            key={i}
            positions={route}
            pathOptions={{
              color: "#fff",
              weight: zoom >= 6 ? 2 : 1.2,
              opacity: 1,
            }}
            eventHandlers={{
              click: (e) => {
                e.target.openPopup();
              },
            }}
            pane="navy-lines"
          >
            <Popup>
              <div className="popup-route">
                <b>Motivazione della tratta:</b><br />
                {motiviTratte[i % motiviTratte.length]}
              </div>
            </Popup>
          </Polyline>
        ))}
        {showNavyMarkers && posizioni.map(
          (p, i) =>
            p && (
              <NavyMarker
                key={i}
                center={p}
                zoom={zoom}
                popup={
                  <>
                    <b>{navi[i].nome}</b>
                    <br />
                    {navi[i].descrizione}
                    <br />
                    <span className="popup-navy-info">
                      <b>Motivo:</b> {navi[i].motivoTransito}
                      <br />
                      Paese: {navi[i].paese}
                      <br />
                      Velocità: {navi[i].velocita} km/h
                    </span>
                  </>
                }
              />
            )
        )}
        {basi.map((b, i) => {
          const stima = stimaRaggioEBreveMotivo(b);
          return (
            <Circle
              key={i}
              center={b.coord}
              radius={stima.raggio * 1000 * (zoom < 5 ? 0.7 : zoom < 7 ? 0.85 : 1)}
              pathOptions={{
                color: "#fff",
                fillColor: "#fff",
                fillOpacity: 0.14,
                weight: 1.2,
              }}
              eventHandlers={{
                click: (e) => {
                  e.target.openPopup();
                },
              }}
              pane="base-circles"
            >
              <Popup>
                <div className="popup-risk">
                  <b>{b.nome}</b><br />
                  <b>Funzione:</b> {b.funzione}<br />
                  <b>Dettagli:</b> {b.note}<br />
                  <b>Zona di rischio bombardamento</b><br />
                  {stima.motivo}
                  <br />
                  (Raggio stimato: {Math.round(stima.raggio)} km)
                </div>
              </Popup>
            </Circle>
          );
        })}
        {showBaseMarkers && basi.map((b, i) => (
          <CircleMarker
            key={i}
            center={b.coord}
            radius={8}
            pathOptions={{
              color: "#fff",
              fillColor: "rgba(0,0,0,0.98)",
              fillOpacity: 1,
              weight: 3,
            }}
            pane="base-markers"
          >
            <Popup>
              <div className="popup-base">
                <b>{b.nome}</b>
                <br />
                Funzione: {b.funzione}
                <br />
                Dettagli: {b.note}
              </div>
            </Popup>
          </CircleMarker>
        ))}
        {gpsLog.length > 1 && (
          <Polyline
            positions={gpsLog}
            pathOptions={{
              color: "#ffd600",
              weight: 2.3,
              opacity: 0.86,
              dashArray: "4 8",
            }}
            pane="gps-marker"
          />
        )}
        {pos && <GpsPin pos={pos} accuracy={accuracy} zoom={zoom} />}
      </>
    );
  }

  return (
    <div className="main-map4safety">
      <MapContainer
        center={pos || [37.0, 15.0]}
        zoom={5}
        className="leaflet-main"
        minZoom={2}
        maxZoom={18}
        zoomControl={false}
        scrollWheelZoom
        doubleClickZoom={false}
        attributionControl={false}
        dragging
      >
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
          attribution=""
          opacity={1}
        />
        <Pane name="base-circles" style={{ zIndex: 300 }} />
        <Pane name="navy-lines" style={{ zIndex: 400 }} />
        <Pane name="base-markers" style={{ zIndex: 500 }} />
        <Pane name="navy-markers" style={{ zIndex: 600 }} />
        <Pane name="gps-marker" style={{ zIndex: 700 }} />
        <MapContent />
      </MapContainer>
      {accuracyMsg && (
        <div className="gps-accuracy-box">
          {accuracyMsg}
        </div>
      )}
    </div>
  );
}