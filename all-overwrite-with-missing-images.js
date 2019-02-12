const { readdirSync, readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');

const baseimagedir = 'imgs/missings';

const main = () => {
  const missingImages = JSON.parse(
    readFileSync(resolve('./imgs/missings.json'), 'utf8')
  );
  const filenames = readdirSync(resolve(baseimagedir));
  const correctFilename = /^[0-9a-f]+\.(jpe?g|png|gif)/;

  for (const filename of filenames) {
    if (!correctFilename.test(filename)) { continue; }
    if (missingImages[filename] != null) { continue; }
    missingImages[filename] = '@overwrite';
  }

  writeFileSync(
    resolve('./imgs/missings.json'),
    JSON.stringify(missingImages, null, 2)
  );
};

main();
