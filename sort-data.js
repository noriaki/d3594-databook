const { readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');

const { compareCommanders, compareTactics } = require('./libs/sort');

const commandersFilePath = resolve('data/commanders.json');
const tacticsFilePath = resolve('data/tactics.json');

const sort = (rawData, compareFunc) => {
  const data = [...rawData];
  data.sort(compareFunc);
  return data;
};

const main = () => {
  // commanders
  const commandersData = JSON.parse(readFileSync(commandersFilePath));
  const resultCommandersData = sort(commandersData, compareCommanders);
  writeFileSync(
    commandersFilePath,
    JSON.stringify(resultCommandersData, null, 2),
    'utf8'
  );

  // tactics
  const tacticsData = JSON.parse(readFileSync(tacticsFilePath));
  const resultTacticsData = sort(tacticsData, compareTactics);
  writeFileSync(
    tacticsFilePath,
    JSON.stringify(resultTacticsData, null, 2),
    'utf8'
  );
};

main();
