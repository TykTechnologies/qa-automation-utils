// fetchAndSaveData.js
require('dotenv').config();
const fs = require('fs');
const fetchData = require('./fetchData');

async function fetchAndSaveData() {
    try {
        console.log('Fetching data...');
        const data = await fetchData();

        // Group jobs by repoName and branch
        const groupedData = data.reduce((acc, job) => {
            const key = `${job.repo_name}-${job.head_branch}`;
            if (!acc[key]) {
                acc[key] = {
                    repoName: job.repo_name,
                    branch: job.head_branch,
                    jobs: []
                };
            }
            acc[key].jobs.push(job);
            return acc;
        }, {});

        const formattedData = Object.values(groupedData);

        // Add last execution time
        const result = {
            lastExecutionTime: new Date().toISOString(),
            data: formattedData
        };

        fs.writeFileSync('data.json', JSON.stringify(result, null, 2));
        console.log('Data saved to data.json');
    } catch (error) {
        console.error('Failed to fetch data:', error);
    }
}

fetchAndSaveData();