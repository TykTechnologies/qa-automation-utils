require('dotenv').config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_NAMES = process.env.REPO_NAMES.split(',');
const BRANCHES = ['master', 'release-5.7', 'release-5.6'];
const WORKFLOW_FILE = 'release.yml';
const API_JOB_NAME_PREFIX = 'api-tests';
const UI_JOB_NAME_PREFIX = 'ui-tests';

async function fetchWorkflowRuns(repoName, branch) {
    const fetch = (await import('node-fetch')).default;
    const url = `https://api.github.com/repos/${repoName}/actions/workflows/${WORKFLOW_FILE}/runs?branch=${branch}&per_page=1`;
    console.log(`Fetching workflow runs for branch ${branch}...`);
    console.log(`URL: ${url}`);
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`
            }
        });
        if (!response.ok) {
            throw new Error(`Error fetching workflow runs: ${response.statusText}`);
        }
        const data = await response.json();
        return data.workflow_runs || [];
    } catch (error) {
        console.error(`Failed to fetch workflow runs for branch ${branch}:`, error);
        return [];
    }
}

async function fetchJobDetails(repoName, runId) {
    const fetch = (await import('node-fetch')).default;
    const url = `https://api.github.com/repos/${repoName}/actions/runs/${runId}/jobs`;
    console.log(`Fetching job details for run ${runId}...`);
    console.log(`URL: ${url}`);

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`
            }
        });
        if (!response.ok) {
            throw new Error(`Error fetching job details: ${response.statusText}`);
        }
        const data = await response.json();
        return data.jobs.filter(job => job.name.startsWith(API_JOB_NAME_PREFIX) || job.name.startsWith(UI_JOB_NAME_PREFIX));
    } catch (error) {
        console.error(`Failed to fetch job details for run ${runId}:`, error);
        return [];
    }
}

async function fetchData() {
    console.log('Fetching data...');
    let results = [];
    for (const repoName of REPO_NAMES) {
        for (const branch of BRANCHES) {
            const runs = await fetchWorkflowRuns(repoName, branch);
            for (const run of runs) {
                const jobs = await fetchJobDetails(repoName, run.id);
                // Include repo_name in each job
                const jobsWithInfo = jobs.map(job => ({
                    ...job,
                    head_branch: run.head_branch,
                    repo_name: repoName
                }));
                results.push(...jobsWithInfo);
            }
        }
    }
    return results;
}

module.exports = fetchData;