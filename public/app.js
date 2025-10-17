async function loadQuakes({ lat, lon }) {
  const now = new Date();
  const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  try {
    const res = await fetch(
      `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${start.toISOString()}&endtime=${now.toISOString()}&minmagnitude=4.5`
    );

    const data = await res.json(); // ✅ data is defined here
    console.log("Fetched quake data:", data);

    if (!data || !data.features) {
      console.warn("No quake data found");
      return;
    }

    // Now you can safely process data.features
    const eventsList = document.getElementById("events");
    eventsList.innerHTML = ""; // Clear previous
    data.features.forEach(eq => {
      const mag = eq.properties.mag;
      const place = eq.properties.place;
      const time = new Date(eq.properties.time).toLocaleString();
      const li = document.createElement("li");
      li.textContent = `M${mag} - ${place} (${time})`;
      eventsList.appendChild(li);
    });

  } catch (err) {
    console.error("Error loading quakes:", err);
  }
}
