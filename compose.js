const { readFileSync, writeFileSync, readdirSync } = require('fs');
const { resolve } = require('path');

const destdir = './data';

const main = () => {
  const basedirname = 'data/dest';
  const filenames = readdirSync(resolve(basedirname));
  const correctFilename = /^[0-9a-f]+\.json$/;
  const data = [];
  for (const filename of filenames) {
    if (!correctFilename.test(filename)) { continue; }
    const filepath = resolve(basedirname, filename);
    data.push(JSON.parse(readFileSync(filepath)));
  }
  writeFileSync(
    resolve(destdir, 'commanders.json'),
    JSON.stringify(data, null, 2)
  );
};

main();
