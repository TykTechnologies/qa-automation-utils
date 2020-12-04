var Wrapper = require('./Wrapper');

class Table_object extends Wrapper {
  constructor(selector) {
    super(selector);
    this.element = $(selector);
  }

  getRowCount() {
    return this.element.$('tbody').$$('tr').length;
  }

  getRowaValues(rowNumber) {
    const rowElement = this.element.$('tbody').$$('tr')[rowNumber];
    return rowElement.$$('td').map( row => row.getText());
  }

  getRowWithValue(cellValue) {
    for (let rowNumber = 0; rowNumber < this.getRowCount(); rowNumber++) {
      let rowValues = this.getRowaValues(rowNumber);
      if (rowValues.includes(cellValue))
        return rowValues;
    }
  }
  //TODO:
  isRowWithValuesPreset(...values) {
    values.forEach( value => console.log(value) );
  }

  clickCellWithText(text) {
    this.element.$('tbody').waitForExist();
    const cell = this.element.$('tbody').$$(`a=${text}`);
    if (cell.length !== 1)
      assert.fail(`Unable to click cell with text: ${text}. Number of cells found: ${cell.length}`);
    cell[0].waitForClickable();
    try {
      cell[0].click();
    } catch (e) {
      console.warn(`Unable to click cell. Error: ${e}. Trying again!`);
      this.element.$('tbody').$$(`a=${text}`)[0].click();
    }
  }

  waitForExist() {return this.element.waitForExist();}
}

module.exports = Table_object;