// === PH Quake Watch ===
// Fetches earthquake data and generates a 24H activity forecast

async function loadQuakes({ lat, lon }) {
  const now = new Date();
  const start = new Date(now.getTime() - 24 * 60 * 60 * 1000); // past 24 hours

  try {
    const res = await fetch(
      `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${start.toISOString()}&endtime=${now.toISOString()}&minmagnitude=4.5`
    );

    const data = await res.json();
    console.log("Fetched quake data:", data);

    if (!data || !data.features) {
      console.warn("No quake data found");
      return;
    }

    // === Render Earthquake List ===
    const eventsList = document.getElementById("events");
    eventsList.innerHTML = ""; // clear previous

    data.features.forEach(eq => {
      const mag = eq.properties.mag;
      const place = eq.properties.place;
      const time = new Date(eq.properties.time).toLocaleString();
      const li = document.createElement("li");
      li.textContent = `M${mag} - ${place} (${time})`;
      eventsList.appendChild(li);
    });

    // === 🔥 Generate Forecast ===
    const forecast = detectHotspots(data.features);
    displayForecast(forecast);

  } catch (err) {
    console.error("Error loading quakes:", err);
  }
}

// === Forecast Feature ===
// Detects quake clusters by region and estimates activity intensity
function detectHotspots(quakes) {
  const clusters = {};

  quakes.forEach(q => {
    const region = q.properties.place.split(",").pop().trim();
    if (!clusters[region]) clusters[region] = [];
    clusters[region].push(q.properties.mag);
  });

  const forecast = Object.entries(clusters).map(([region, mags]) => {
    const avgMag = mags.reduce((a, b) => a + b, 0) / mags.length;
    const intensity =
      avgMag > 5 ? "High" :
      avgMag > 4 ? "Moderate" : "Low";

    return { region, avgMag: avgMag.toFixed(2), intensity };
  });

  return forecast;
}

// === Display Forecast on the Page ===
function displayForecast(forecast) {
  const forecastList = document.getElementById("forecast");
  if (!forecastList) return;

  forecastList.innerHTML = "";
  forecast.forEach(f => {
    const li = document.createElement("li");
    li.textContent = `${f.region}: ${f.intensity} (avg mag ${f.avgMag})`;
    forecastList.appendChild(li);
  });
}

// === Initialize App ===
// If you already call loadQuakes elsewhere, keep that.
// Otherwise, auto-load data for PH center as default.
window.addEventListener("load", () => {
  loadQuakes({ lat: 12.8797, lon: 121.7740 }); // Philippines center
});
