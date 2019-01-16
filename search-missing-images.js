const { existsSync, readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');

const { logAndExit } = require('./libs/crawl');

const main = async () => {
  const data = JSON.parse(
    readFileSync(resolve('./data/commanders.json'), 'utf8')
  );
  const notExistsImages = data.filter((commander) => {
    const imagePath = resolve('./imgs/dest', commander.image);
    return !existsSync(imagePath);
  }).reduce((obj, notExistsImage) => {
    obj[notExistsImage.image] = notExistsImage.id;
    return obj;
  }, {});
  writeFileSync(
    resolve('./imgs/missings.json'),
    JSON.stringify(notExistsImages, null, 2)
  );
  if (Object.keys(notExistsImages).length > 0) {
    console.log('Found missing image(s):')
    console.log(notExistsImages);
    console.log('-> [next] Store images to ./imgs/missings/');
    console.log('          and exec: `npm run images:missing:adjust`');
  } else {
    console.log('No missing image :)');
  }
};

main().then(() => process.exit()).catch(logAndExit);

// error handling
process.on('unhandledRejection', logAndExit);
