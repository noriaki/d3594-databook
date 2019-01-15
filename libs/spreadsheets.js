const { isEmpty } = require('lodash');

const isEmptyRow = data => data.every(isEmpty);


const toColumnName = (index) => {
  index += 1;
  for (var ret = '', a = 1, b = 26; (index -= a) >= 0; a = b, b *= 26) {
    ret = String.fromCharCode(parseInt((index % b) / a) + 65) + ret;
  }
  return ret;
};

const toCellName = (row, column) => `${toColumnName(column)}${row + 1}`;

const parseColumnToIndex = column => (
  Array.from(column).reverse().reduce(
    (ret, char, offset) => (
      ret + (parseInt(char.charCodeAt() - 65, 10) + 1) * (26 ** offset)
    ), 0
  ) - 1
);

const toCellIndex = (cell) => [
  parseInt(cell.prelace(/\D/g, ''), 10) - 1,
  parseColumnToIndex(cell.replace(/\d/g, '')),
];

module.exports = {
  isEmptyRow,
  toColumnName,
  toCellName,
  parseColumnToIndex,
  toCellIndex,
};
