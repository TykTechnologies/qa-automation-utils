var Wrapper = require('./Wrapper');

class Checkbox_object extends Wrapper{
  constructor(selector) {
    super(selector);
  }

  check() { //TODO refactor with nice retry and error message
    console.log('Checking Checkbox!');
    if (this.element.getAttribute('value') === 'true') 
      return;
    this.element.click();
    browser.pause(1000);
    if (this.element.getAttribute('value') === 'false') 
      this.element.click();
  }
    
}

module.exports = Checkbox_object;