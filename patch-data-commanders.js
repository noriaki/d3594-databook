const { readdirSync, readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');

const patchDir = 'data/patch';
const dataPathname = 'data/commanders.json';

const main = () => {
  const filenames = readdirSync(resolve(patchDir));
  const correctFilename = /\.js$/;
  const dataPath = resolve(dataPathname);
  const initialData = JSON.parse(readFileSync(dataPath));
  const resultData = filenames
    .filter(filename => correctFilename.test(filename))
    .reduce((data, patchFilePath) => {
      const {
        indexFinder,
        dataReplacer,
      } = require(resolve(patchDir, patchFilePath));
      const index = data.findIndex(indexFinder);
      if (index !== -1) { data.splice(index, 1, dataReplacer(data[index])); }
      return data;
    }, initialData);
  writeFileSync(dataPath, JSON.stringify(resultData, null, 2), 'utf8');
};

main();
