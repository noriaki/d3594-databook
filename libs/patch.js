const { readFileSync } = require('fs');
const { resolve } = require('path');
const deepMerge = require('lodash.merge');

const { humanizeId } = require('./identify');

const patchCommanderData = (data, source = '1') => {
  const patchedData = JSON.parse(readFileSync(
    resolve(__dirname, '../data/patch.json')))[source];
  const id = humanizeId(data);
  const overrideData = patchedData[id];
  if (overrideData != null) { deepMerge(data, overrideData); }
  return data;
};

module.exports = {
  patchCommanderData,
};
