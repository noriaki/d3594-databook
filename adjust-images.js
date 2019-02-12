const { readdirSync } = require('fs');
const { resolve } = require('path');
const jimp = require('jimp');

const baseimagedir = 'imgs/2.org';
const destimagedir = 'imgs/2';

const aspectRatio = 0.729211087420043;
const margin = { top: 11, bottom: 16 };

const main = async () => {
  const filenames = readdirSync(resolve(baseimagedir));
  const correctFilename = /^[0-9a-f]+\.(jpe?g|png|gif)/;
  for (const filename of filenames) {
    if (!correctFilename.test(filename)) { continue; }
    const filepath = resolve(baseimagedir, filename);
    const outputfilepath = resolve(destimagedir, filename);
    const image = await jimp.read(filepath);
    const height = image.bitmap.height - (margin.top + margin.bottom);
    const width = Math.round(height * aspectRatio);
    console.log(`processing... ${filename}`);
    image
      .crop(0, margin.top, width, height)
      .write(outputfilepath);
  }
};

main();
