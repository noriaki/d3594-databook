const { readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');
const { get, set, findIndex } = require('lodash');

const { findBy } = require('./libs/convert');

const basePath = './data';

const commandersFilePath = resolve(basePath, 'commanders.json');
const commandersStzbFilePath = resolve(basePath, 'stzb/commanders.json');
const commandersData = JSON.parse(readFileSync(commandersFilePath));
const commandersStzbData = JSON.parse(readFileSync(commandersStzbFilePath));

const tacticsFilePath = resolve(basePath, 'tactics.json');
const tacticsData = JSON.parse(readFileSync(tacticsFilePath));

const tacticsPathMap = {
  methodId: 'tactics.init',
  methodId1: 'tactics.analyzables[0]',
  methodId2: 'tactics.analyzables[1]',
};

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
    // commannder
    commander.originalId = String(ret.id);
    // tactics
    for (const [stzbPath, dataPath] of Object.entries(tacticsPathMap)) {
      if (get(ret, stzbPath) !== '') {
        const originalId = String(get(ret, stzbPath));
        set(commander, `${dataPath}.originalId`, originalId);
        const identifier = get(commander, `${dataPath}.identifier`);
        const idx = findIndex(tacticsData, ['identifier', identifier]);
        if (idx >= 0) { set(tacticsData, `[${idx}].originalId`, originalId); }
      }
    }
  }
  return commander;
});

writeFileSync(
  resolve(basePath, 'commanders.json'),
  JSON.stringify(commandersWithIdAdded, null, 2),
  'utf8'
);

writeFileSync(
  resolve(basePath, 'tactics.json'),
  JSON.stringify(tacticsData, null, 2),
  'utf8'
);
