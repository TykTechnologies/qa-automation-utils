require('dotenv').config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'TykTechnologies';
const COMBINATIONS = require('./combinations.json');
const WORKFLOW_FILE = 'release.yml';
const API_JOB_NAME_PREFIX = 'api-tests';
const UI_JOB_NAME_PREFIX = 'ui-tests';

async function fetchWorkflowRuns(repoName, branch, workflowFile) {
    const fetch = (await import('node-fetch')).default;
    const url = `https://api.github.com/repos/${REPO_OWNER}/${repoName}/actions/workflows/${workflowFile}/runs?branch=${branch}&per_page=1`;
    console.log(`Fetching workflow runs for ${repoName}/${workflowFile} and branch ${branch}...`);
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

async function fetchJobDetails(repoName, runId, jobNames) {
    console.log(`Fetching job details for ${repoName} and run ${runId}...`);
    const fetch = (await import('node-fetch')).default;
    const url = `https://api.github.com/repos/${REPO_OWNER}/${repoName}/actions/runs/${runId}/jobs`;

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
        return data.jobs.filter(job => 
            // Check if any job name in jobNames is included in job.name
            jobNames.some(name => job.name.includes(name))
        ).map(job => ({
            id: job.id,
            name: job.name,
            status: job.status,
            conclusion: job.conclusion,
            started_at: job.started_at,
            duration: new Date(job.completed_at) - new Date(job.started_at),
            url: job.html_url
        }));
    } catch (error) {
        console.error(`Failed to fetch job details for run ${runId}:`, error);
        return [];
    }
}

async function fetchData() {
    let results = [];
    for (const repoName in COMBINATIONS) {
        const repoConfig = COMBINATIONS[repoName];
        const branches = repoConfig.branches;
        const fileNames = repoConfig.fileNames;
        for (const branch of branches) {
            for (const workflowFile of fileNames) {
                const workflowRuns = await fetchWorkflowRuns(repoName, branch, workflowFile);
                for (const run of workflowRuns) {
                    const jobs = await fetchJobDetails(repoName, run.id, repoConfig.jobs);
                    const jobsWithInfo = jobs.map(job => ({
                        ...job,
                        head_branch: run.head_branch,
                        repo_name: repoName,
                        workflow_file: workflowFile
                    }));
                    results.push(...jobsWithInfo);
                }
            }
        }
    }
    return results;
}

module.exports = fetchData;