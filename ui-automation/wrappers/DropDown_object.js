var Wrapper = require('./Wrapper');

class DropDown_object extends Wrapper{
  constructor(selector) {
    super(selector);
  }

  selectOption(text) { //TODO refactor
    var option = $(`span*=${text}`);
    this.element.waitForExist();
    this.element.click();
    browser.pause(1000);
    if (option.isExisting()) {
      option.click();
      return;
    }
    this.element.click();
    option.click();
  }

  selectFirstOption() {
    this.element.click();
    const optionsList = $('.tyk-combobox2__combobox-list');
    optionsList.waitForExist();
    return optionsList.$$('li')[0].click();
  }

}

module.exports = DropDown_object;