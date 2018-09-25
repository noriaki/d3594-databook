const { readFileSync } = require('fs');
const { resolve } = require('path');
const deepMerge = require('lodash.merge');

const { humanizeId } = require('./identify');

const mergeCommanderData = (data, filepath) => {
  const patchedData = JSON.parse(readFileSync(filepath));
  const id = humanizeId(data);
  const overrideData = patchedData[id];
  if (overrideData != null) { deepMerge(data, overrideData); }
  return data;
};

const patchCommanderData = (data, source = '1') => {
  const filepath = resolve(__dirname, `../data/patch${source}.json`);
  return mergeCommanderData(data, filepath);
};

const applyCommanderData = (data) => {
  const filepath = resolve(__dirname, '../data/apply.json');
  return mergeCommanderData(data, filepath);
};

module.exports = {
  patchCommanderData,
  applyCommanderData,
};
