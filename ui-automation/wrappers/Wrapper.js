class Wrapper{
  constructor(selector) {
    this.element = $(selector);
  }

  click() {
    this.element.click();
  }

  waitForExist() {return this.element.waitForExist();}

  waitForClickable() { 
    this.waitForExist();
    return this.element.waitForClickable();}
}

module.exports = Wrapper;