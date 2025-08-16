const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send('🟢 Universal Swiggy CORS Proxy is running');
});

// Universal proxy route
app.get('/proxy', async (req, res) => {
  // Manually decode the full encoded URL from the request
  const rawUrl = req.query.url || req.originalUrl.split('?url=')[1];
  const targetUrl = decodeURIComponent(rawUrl || '');

  console.log("Decoded target URL:", targetUrl);

  if (!targetUrl.startsWith('https://www.swiggy.com')) {
    return res.status(400).json({ error: 'Invalid or missing `url` query param' });
  }

  const lat = new URL(targetUrl).searchParams.get('lat');
  const lng = new URL(targetUrl).searchParams.get('lng');

  // console.log("Lat:", lat, "Lng:", lng);

  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat or lng missing in URL' });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        accept: '*/*',
        'content-type': 'application/json',
        referer: 'https://www.swiggy.com/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        cookie: `lat=s:${lat}; lng=s:${lng}; platform=web`
      },
    });

    const contentType = response.headers.get('content-type');
    const data = await response.text();

    res.set('Content-Type', contentType || 'application/json');
    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).json({ error: 'Fetch Failed', message: error.message });
  }
});



const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Universal Swiggy Proxy running at http://localhost:${PORT}`);
});

