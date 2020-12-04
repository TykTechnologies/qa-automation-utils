import moment from 'moment';

export const getTimeStamp = () => {
  return moment().format('D-MMM-h_mm_ss');
}

export const isRunningLocally = () => { return testEnv === 'local'};

export const jsClick = element => { return browser.execute("arguments[0].click();", element)};

export const switchToTab = () => {
  browser.switchWindow('Tyk.io API Gateway');
}