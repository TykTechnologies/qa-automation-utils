require('dotenv').config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'TykTechnologies';
const COMBINATIONS = {
    "tyk-analytics": {"branches": ["master", "release-5.7", "release-5.7.0", "release-5-lts"], "jobs": ["api-tests", "ui-tests"]},
    "tyk": {"branches": ["master", "release-5.7", "release-5.7.0", "release-5-lts"], "jobs": ["api-tests"]},
    "tyk-sink": {"branches": ["master"], "jobs": ["api-tests"]},
    "tyk-pump": {"branches": ["master"], "jobs": ["api-tests"]},
};
const WORKFLOW_FILE = 'release.yml';
const API_JOB_NAME_PREFIX = 'api-tests';
const UI_JOB_NAME_PREFIX = 'ui-tests';

async function fetchWorkflowRuns(repoName, branch) {
    const fetch = (await import('node-fetch')).default;
    const url = `https://api.github.com/repos/${REPO_OWNER}/${repoName}/actions/workflows/${WORKFLOW_FILE}/runs?branch=${branch}&per_page=1`;
    console.log(`Fetching workflow runs for ${repoName} and branch ${branch}...`);
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
        return data.jobs.filter(job => job.name.startsWith(API_JOB_NAME_PREFIX) || job.name.startsWith(UI_JOB_NAME_PREFIX)).map(job => ({
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
        for (const branch of branches) {
            const workflowRuns = await fetchWorkflowRuns(repoName, branch);
            for (const run of workflowRuns) {
                const jobs = await fetchJobDetails(repoName, run.id, repoConfig.jobs);
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