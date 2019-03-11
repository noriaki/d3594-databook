const { readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');

const { findBy } = require('./libs/convert');

const basePath = './data';

const commandersFilePath = resolve(basePath, 'commanders.json');
const commandersStzbFilePath = resolve(basePath, 'stzb/commanders.json');
const commandersData = JSON.parse(readFileSync(commandersFilePath));
const commandersStzbData = JSON.parse(readFileSync(commandersStzbFilePath));

const commandersWithIdAdded = commandersData.map((commander) => {
  let ret;
  const rets = commandersStzbData.filter(findBy(commander));
  if (rets.length === 2) {
    if (commander.special === 'SP') {
      ret = rets.find(r => r.name.includes('SP'));
    } else {
      ret = rets.find(r => !r.name.includes('SP'));
    }
  }
  if (rets.length === 1) {
    ret = rets[0];
  }
  if (ret) { commander.originalId = String(ret.id); }
  console.log([
    commander.id,
    commander.originalId,
    ret ? ret.uniqueName : null,
    rets.length,
    rets.map(r => r.uniqueName),
  ]);
  return commander;
});
