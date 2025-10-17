const forecast = detectHotspots(recentData.features);
const ul = document.getElementById("forecast");
forecast.forEach(f => {
  const li = document.createElement("li");
  li.textContent = `${f.region}: ${f.intensity} (avg mag ${f.avgMag})`;
  ul.appendChild(li);
});
