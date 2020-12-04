const https = require('https');
const { Promise } = require('bluebird');
const git = require('git-rev-sync');
var timediff = require('timediff');
const webHookURL = process.env.SLACK_WEBHOOK_URL;

const mergedResults = require('../../results/json/wdio-merged.json');
const redHexCode = "#FF0000";
const greenHexCode = "#2eb886";

const duration = timediff(mergedResults.start, mergedResults.end, 'mS');
// const masterBranchCommitMessage = require('child_process')
//   .execSync('git log -1 --pretty=%B origin/master')
//   .toString().trim();

let messageBody = {
  "username": "Automated test", // This will appear as user name who posts the message
  "text": "ARA UI automate tests",
  "icon_emoji": "#status_icon#", // User icon, default value
  "blocks": [
    //TODO add link and commit message from env
    // {
    //   "type": "section",
    //   "text": {
    //     "type": "mrkdwn",
    //     "text": `:octocat: *git commit*: ${masterBranchCommitMessage}`
    //   }
    // },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `:octocat: *test env*: ${process.env.WDIO_TEST_ENV}`
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `:octocat: *git branch for test scripts*: ${git.branch()}`
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `:link: <https://github.com/TykTechnologies/ara/actions?query=workflow%3A%22Scheduled+UI+test+run%22|Execution page>`
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `:clock10: Duration: ${duration.minutes}min ${duration.seconds}s`
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `:checkered_flag: Tests: 
        Passed - ${mergedResults.state.passed} 
        Failed - ${mergedResults.state.failed} 
        Skipped - ${mergedResults.state.skipped}`
      }
    }
  ],
  "attachments": [],
}

const sendPromise = () => { //promise for http request
  return new Promise((resolve, reject) => {
    const requestOptions = {
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      }
    };
        
    const req = https.request(webHookURL, requestOptions, (res) => {
      let response = '';        
        
      res.on('data', (d) => {
        response += d;
      });
        
      // response finished, resolve the promise with data
      res.on('end', () => {
        resolve(response);
      })
    });
        
    // on error -> reject the promise
    req.on('error', (e) => {
      reject(e);
    });
        
    req.write(messageBody);
    req.end();
  });
}

const addSteps = (testsResultJson) => { 
  return testsResultJson.map(test => { 
    const statusIcon = (test.state === 'passed') ? "" : " :bangbang: "
    const errorMessage = (test.standardError !== undefined) ? `Error: \n ${test.standardError}` : "";
    return `${statusIcon} ${test.name} ${statusIcon} ${errorMessage}`}).join("\n") 
}

const addTests = () => mergedResults.suites.forEach(describe => {
  let text = addSteps(describe.tests);
  return messageBody["attachments"].push(
    {
      "color": text.includes('Error') ? redHexCode : greenHexCode,
      "fallback": "Test was not added!!",
      "title": `Scenario: ${describe.name}. Tests:`,
      "text": text,

    }
  )
});

const sendNotification = () => {
  addTests();

  const executionFailed = JSON.stringify(messageBody).includes('Error');
  if (executionFailed){
    messageBody["icon_emoji"] =  ":red_circle:";
    messageBody["text"] += " FAILED!";
  }    
  else{
    messageBody["icon_emoji"] =  ":white_check_mark:";
    messageBody["text"] += " PASSED";
  }

  try {
    messageBody = JSON.stringify(messageBody);
  } catch (e) {
    throw new Error('Failed to stringify messageBody', e);
  }

  console.log('>>> Sending slack notification: ' + messageBody);
  sendPromise().timeout(10000)
    .catch(Promise.TimeoutError, err => console.log(`>>>> Error while sending Slac notification: ${err}`)) 
}

sendNotification();
