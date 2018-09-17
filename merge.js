const { readdirSync, readFileSync, copyFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');
const moment = require('moment');
const merge = require('lodash.merge');
const union = require('lodash.union');

const main = () => {
  const correctFilename = /^[0-9a-f]+\.json$/;
  const basedir1name = 'data/1';
  const basedir2name = 'data/2';
  const destdirname = 'data/dest';
  const files1 = readdirSync(resolve(basedir1name)).filter(f => correctFilename.test(f));
  const files2 = readdirSync(resolve(basedir2name)).filter(f => correctFilename.test(f));
  const files = union(files1, files2);
  for (const filename of files) {
    const filepath1 = resolve(basedir1name, filename);
    const filepath2 = resolve(basedir2name, filename);
    const destpath = resolve(destdirname, filename);
    if (files1.includes(filename) && files2.includes(filename)) {
      const data1 = JSON.parse(readFileSync(filepath1));
      const data2 = JSON.parse(readFileSync(filepath2));
      const data = merge({}, data1, data2);
      data.crawledAt = moment(data.crawledAt).format('YYYY/MM/DD');
      data.imageUrl = data1.imageUrl;
      data.tactics.init.permissions = data1.tactics.init.permissions;
      writeFileSync(destpath, JSON.stringify(data, null, 2));
    } else if (files1.includes(filename)) {
      copyFileSync(filepath1, destpath);
    } else if (files2.includes(filename)) {
      copyFileSync(filepath2, destpath);
    }
  }
};

main();
