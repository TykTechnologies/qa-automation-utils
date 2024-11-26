// fetchAndSaveData.js
require('dotenv').config();
const fs = require('fs');
const fetchData = require('./fetchData');

async function fetchAndSaveData() {
    try {
        console.log('Fetching data...');
        const data = await fetchData();
        fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
        console.log('Data saved to data.json');
    } catch (error) {
        console.error('Failed to fetch data:', error);
    }
}

fetchAndSaveData();