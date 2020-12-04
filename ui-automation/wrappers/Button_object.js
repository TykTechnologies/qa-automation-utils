var Wrapper = require('./Wrapper');

class Button_object extends Wrapper{
  constructor(selector) {
    super(selector);
  }

  click() {
    super.waitForClickable();
    browser.pause(1000);
    return this.element.click();
  }

}

module.exports = Button_object;