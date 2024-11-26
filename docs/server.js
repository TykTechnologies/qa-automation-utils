require('dotenv').config();
const express = require('express');
const fetchData = require('./fetchData');
const cors = require('cors');

const app = express();
const PORT = 3003;

app.use(express.static('public'));
// Enable CORS for all routes
app.use(cors());
app.get('/data', async (req, res) => {
    try {
        console.log('Fetching data...');
        const data = await fetchData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});