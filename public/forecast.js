function detectHotspots(quakes) {
  const clusters = {};
  quakes.forEach(q => {
    const region = q.properties.place.split(",").pop().trim();
    if (!clusters[region]) clusters[region] = [];
    clusters[region].push(q.properties.mag);
  });

  const forecast = Object.entries(clusters).map(([region, mags]) => {
    const avgMag = mags.reduce((a,b)=>a+b,0) / mags.length;
    const intensity = avgMag > 5 ? "High" : avgMag > 4 ? "Moderate" : "Low";
    return { region, avgMag: avgMag.toFixed(2), intensity };
  });

  return forecast;
}

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
