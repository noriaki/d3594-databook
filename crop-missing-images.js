const { readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');
const jimp = require('jimp');

const { logAndExit } = require('./libs/crawl');

const main = async () => {
  const missingImages = JSON.parse(
    readFileSync(resolve('./imgs/missings.json'), 'utf8')
  );
  const filenames = Object.keys(missingImages);
  for (const filename of filenames) {
    const image = await jimp.read(resolve('./imgs/missings', filename));
    image
      .crop(425, 146, 618, 846) // cropping for iPhoneX screenshot size
      .write(resolve('./imgs/dest', filename));
    delete missingImages[filename];
  }
  writeFileSync(
    resolve('./imgs/missings.json'),
    JSON.stringify(missingImages, null, 2)
  );
};

main().then(() => process.exit()).catch(logAndExit);

// error handling
process.on('unhandledRejection', logAndExit);
