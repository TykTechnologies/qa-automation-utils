import notifier from 'mail-notifier';
import { Promise } from 'bluebird';
import variables from './../../variables.json'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; //disabling certificate verification

const waitForEmailTimeout = 120000;
const hubspotDomain = 'hubspotfree.net'

export default class EmailConnection {
  constructor(emailName = variables.inviteEmail) {
    this.emailAdress = emailName + "@outlook.com";
    this.imap = {
      user: this.emailAdress,
      password: process.env.WDIO_BASIC_PASSWORD, //the same password used for email and testing envs
      host: "imap-mail.outlook.com",
      markSeen: true,
      port: 993, // imap port
      tls: true,// use secure connection
    };
    
    this.connector = notifier(this.imap);
  }

  get getLastEmailTextPromise() {return new Promise((resolve, reject) => {
    console.log(`>>> Getting emails from account ${this.imap.user}`);
    this.connector.on('end', () => this.connector.start()) // session closed
      .on('mail', mail => {
        console.log(`>>>> Email received! \nFrom: ${mail.from[0].address} \nText ${mail.text}`);
        if (mail.from[0].address.endsWith(hubspotDomain))
          resolve(mail.text);
      })
      .on('error', err => {
        console.log(`>>>> Error while reading email: ${err}`);
        reject(err);
      })
      .start();
  });
  }
  
  getLastEmailText() {
    return browser.call( () => { 
      return this.getLastEmailTextPromise.timeout(waitForEmailTimeout)
        .catch(Promise.TimeoutError, err => console.log(`>>>> Error while waiting for invite email: ${err}`)) 
    })
  }
  
  markAllEmailsAsRead() {
    browser.call( () => { return new Promise((resolve, reject) => {
      this.connector.on('error', err => {
        console.log(`>> Error while reading emails: ${err}`);
        reject(err);
      })
        .on('mail', mail => {
          console.log(`>>>> Marking emails as read! \nFrom: ${mail.from[0].address} \nText ${mail.text}`);
        })
        .start()
      resolve();
    })
    })
  }
}

