const { readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');
const { get, set } = require('lodash');

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
  if (ret) {
    commander.originalId = String(ret.id);
    if (get(ret, 'methodId') !== '') {
      set(commander, 'tactics.init.originalId', String(ret.methodId));
    }
    if (get(ret, 'methodId1') !== '') {
      set(
        commander, 'tactics.analyzables[0].originalId', String(ret.methodId1)
      );
    }
    if (get(ret, 'methodId2') !== '') {
      set(
        commander, 'tactics.analyzables[1].originalId', String(ret.methodId2)
      );
    }
  }
  console.log([
    commander.id,
    commander.originalId,
    get(commander, 'tactics.init.originalId'),
    get(commander, 'tactics.analyzables[0].originalId') || get(commander, 'tactics.analyzables[0]'),
    get(commander, 'tactics.analyzables[1].originalId') || get(commander, 'tactics.analyzables[1]'),
    ret ? ret.uniqueName : null,
  ]);
  return commander;
});
