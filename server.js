const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_URL = process.env.API_URL || 'http://localhost:8000';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/styles', express.static(path.join(__dirname, 'src', 'styles')));
app.use('/scripts', express.static(path.join(__dirname, 'src', 'scripts')));
app.use('/pages', express.static(path.join(__dirname, 'src', 'pages')));

app.get('/api/config', (req, res) => {
  res.json({ apiUrl: API_URL });
});

app.listen(PORT, () => {
  console.log(`Frontend server running at http://localhost:${PORT}`);
  console.log(`Backend API URL: ${API_URL}`);
});
