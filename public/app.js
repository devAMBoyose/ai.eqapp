// PH Quake Watch — Map + 24H Forecast
console.log("✅ PH Quake Watch starting...");

const $ = (id) => document.getElementById(id);

function magColor(m) {
  return m >= 6 ? '#d73027'
    : m >= 5 ? '#fc8d59'
    : m >= 4 ? '#fee08b'
    : m >= 3 ? '#d9ef8b'
    : '#91cf60';
}

// ---- Forecast Analyzer ----
function detectHotspots(quakes) {
  const clusters = {};
  quakes.forEach(q => {
    const p = q.properties || {};
    const region = (p.place || '').split(',').pop().trim() || "Unspecified";
    if (!clusters[region]) clusters[region] = [];
    clusters[region].push(p.mag ?? 0);
  });

  return Object.entries(clusters).map(([region, mags]) => {
    const avg = mags.reduce((a, b) => a + b, 0) / mags.length;
    const intensity = avg > 5 ? "High" : avg > 4 ? "Moderate" : "Low";
    return { region, avgMag: avg.toFixed(2), intensity };
  });
}

function displayForecast(forecast) {
  const ul = $("forecast");
  if (!ul) return;
  ul.innerHTML = "";

  forecast.forEach(f => {
    const li = document.createElement("li");
    const color =
      f.intensity === "High"
        ? "#ef4444"
        : f.intensity === "Moderate"
        ? "#f59e0b"
        : "#22c55e";
    li.innerHTML = `
      <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};margin-right:6px;"></span>
      <strong>${f.region}</strong>: ${f.intensity} (avg mag ${f.avgMag})
    `;
    ul.appendChild(li);
  });
}

// ---- Map Setup ----
let map, markers;
function setupMap() {
  if (map) return;
  map = L.map("map", { zoomControl: true, worldCopyJump: true })
    .setView([12.8797, 121.7740], 5);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);
  markers = L.layerGroup().addTo(map);
}

// ---- Fetch Quake Data ----
const BOUNDS = { minlat: 4, maxlat: 21, minlon: 116, maxlon: 127 };
const USGS_URL = (startISO, endISO) =>
  `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startISO}&endtime=${endISO}&minlatitude=${BOUNDS.minlat}&maxlatitude=${BOUNDS.maxlat}&minlongitude=${BOUNDS.minlon}&maxlongitude=${BOUNDS.maxlon}&minmagnitude=2.5&orderby=time`;

async function loadQuakes() {
  const list = $("list");
  if (!list) return console.error("❌ Missing #list element");

  let data;
  try {
    const end = new Date();
    const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
    const startISO = start.toISOString().slice(0, 19);
    const endISO = end.toISOString().slice(0, 19);

    const res = await fetch(USGS_URL(startISO, endISO));
    data = await res.json();
    console.log("Fetched quake data:", data);
  } catch (err) {
    console.error("Fetch error:", err);
    list.innerHTML = "<div class='row'><div>⚠️ Failed to load data.</div></div>";
    return;
  }

  if (!data || !Array.isArray(data.features)) {
    list.innerHTML = "<div class='row'><div>No data available.</div></div>";
    return;
  }

  markers.clearLayers();
  list.innerHTML = "";

  data.features.forEach(f => {
    const p = f.properties || {};
    const [lon, lat, depth] = f.geometry?.coordinates || [0, 0, 0];
    const m = p.mag ?? 0;
    const time = new Date(p.time).toLocaleString();

    const circle = L.circleMarker([lat, lon], {
      radius: Math.max(4, m * 2),
      fillColor: magColor(m),
      color: "#111",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.85,
    }).addTo(markers);

    circle.bindPopup(`
      <b>M${m.toFixed(1)}</b> – ${p.place || "Unknown"}<br/>
      Depth: ${depth.toFixed(1)} km<br/>
      Time: ${time}
    `);

    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <div class="mag" style="background:${magColor(m)}">${m.toFixed(1)}</div>
      <div class="loc">
        <div>${p.place || "Unknown"}</div>
        <div class="time">${time} · Depth ${depth.toFixed(0)} km</div>
      </div>
    `;
    row.onclick = () => {
      map.setView([lat, lon], 7);
      circle.openPopup();
    };
    list.appendChild(row);
  });

  // Forecast
  const forecast = detectHotspots(data.features);
  displayForecast(forecast);
}

// ---- Initialize ----
window.addEventListener("DOMContentLoaded", () => {
  setupMap();
  loadQuakes();
  setInterval(loadQuakes, 120000); // refresh every 2 mins
});
