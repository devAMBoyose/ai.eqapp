const path = require('path');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// Serve static files (like CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/JS', express.static(path.join(__dirname, 'JS')));

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});


const axios = require('axios');

// Example: proxy to USGS (adjust params as you need)
app.get('/api/quakes', async (req, res) => {
  try {
    const { starttime, endtime, minmagnitude = 4.5 } = req.query;
    const url = 'https://earthquake.usgs.gov/fdsnws/event/1/query';
    const { data } = await axios.get(url, {
      params: {
        format: 'geojson',
        starttime,
        endtime,
        minmagnitude
      },
      timeout: 10000,
    });
    res.json(data);
  } catch (e) {
    console.error('Quake proxy error:', e.message);
    res.status(502).json({ error: 'Failed to fetch quake data' });
  }
});
