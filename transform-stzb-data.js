const { readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');

const { toText, toRarity, sortKey } = require('./libs/convert');

const basePath = './data/stzb'

// commanders
const commanderKeys = [
  'uniqueName', 'name', 'sex', 'contory', 'type', 'desc',
  'methodName', 'methodDesc',
  'methodName1', 'methodDesc1',
  'methodName2', 'methodDesc2',
  'group',
];

const commandersFilePath = resolve(basePath, 'commanders-raw.json');
const commandersData = JSON.parse(readFileSync(commandersFilePath));

const convertedCommandersData = commandersData.map(commander => {
  const textizeCommander = commanderKeys.reduce((ret, key) => (
    Object.assign(ret, { [key]: toText(commander[key]) })
  ), {});
  const convertedCommander = Object.assign({}, commander, textizeCommander);

  return Object.assign(
    convertedCommander,
    {
      sortKey: sortKey(convertedCommander),
      quality: toRarity(convertedCommander.quality),
    }
  );
});

writeFileSync(
  resolve(basePath, 'commanders.json'),
  JSON.stringify(convertedCommandersData, null, 2),
  'utf8'
);

// tactics
const tacticsKeys = [
  'name', 'type', 'soldierType', 'targetType', 'targetShow',
];

const tacticsFilePath = resolve(basePath, 'tactics-raw.json');
const tacticsData = JSON.parse(readFileSync(tacticsFilePath));

const convertedTacticsData = tacticsData.map(t => (
  Object.assign({}, t, tacticsKeys.reduce((ret, key) => Object.assign(
    ret, { [key]: toText(t[key]) }
  ), {}))
));

writeFileSync(
  resolve(basePath, 'tactics.json'),
  JSON.stringify(convertedTacticsData, null, 2),
  'utf8'
);
