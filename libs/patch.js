const { readFileSync } = require('fs');
const { resolve } = require('path');
const deepMerge = require('lodash.merge');

const { humanizeId } = require('./identify');

const patchCommanderData = (data, source = '1') => {
  const patchedData = JSON.parse(readFileSync(
    resolve(__dirname, '../data/patch.json')))[source];
  const id = humanizeId(data);
  const overrideData = patchedData[id];
  let finalData;
  if (overrideData != null) {
    finalData = deepMerge({}, data, overrideData);
  }
  return finalData;
};

module.exports = {
  patchCommanderData,
};
