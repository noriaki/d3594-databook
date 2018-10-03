const {
  readdirSync,
  readFileSync,
  copyFileSync,
  writeFileSync,
} = require('fs');
const { resolve } = require('path');
const merge = require('lodash.merge');
const union = require('lodash.union');

const { applyCommanderData } = require('./libs/patch');

const correctFilename = /^[0-9a-f]+\.json$/;

const baseDataDir = 'data';
const destDataDir = 'data/dest';
const baseImgsDir = 'imgs';
const destImgsDir = 'imgs/dest';

const main = () => {
  const files1 = readdirSync(
    resolve(baseDataDir, '1')
  ).filter(f => correctFilename.test(f));
  const files2 = readdirSync(
    resolve(baseDataDir, '2')
  ).filter(f => correctFilename.test(f));
  const files = union(files1, files2);
  for (const filename of files) {
    const filepath1 = resolve(baseDataDir, '1', filename);
    const filepath2 = resolve(baseDataDir, '2', filename);
    const destpath = resolve(destDataDir, filename);

    if (files1.includes(filename) && files2.includes(filename)) {
      const data1 = JSON.parse(readFileSync(filepath1));
      const data2 = JSON.parse(readFileSync(filepath2));
      const data = merge({}, data1, data2);
      data.imageUrl = data1.imageUrl;
      data.image = data1.image;
      if (!/[?？"]/.test(data1.description)) {
        data.description = data1.description;
      }
      data.tactics.init.permissions = data1.tactics.init.permissions;
      writeFileSync(destpath, JSON.stringify(data, null, 2));
      copyFileSync(
        resolve(baseImgsDir, '1', data.image),
        resolve(destImgsDir, data.image)
      );
    } else if (files1.includes(filename)) {
      const data = JSON.parse(readFileSync(filepath1));
      copyFileSync(filepath1, destpath);
      copyFileSync(
        resolve(baseImgsDir, '1', data.image),
        resolve(destImgsDir, data.image)
      );
    } else if (files2.includes(filename)) {
      const data = JSON.parse(readFileSync(filepath2));
      copyFileSync(filepath2, destpath);
      copyFileSync(
        resolve(baseImgsDir, '2', data.image),
        resolve(destImgsDir, data.image)
      );
    }

    const commander = JSON.parse(readFileSync(destpath));
    writeFileSync(
      destpath, JSON.stringify(applyCommanderData(commander), null, 2)
    );
  }
};

main();
