const { readdirSync, readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');
const axios = require('axios');

const { identify } = require('./libs/identify');

const main = async () => {
  await Promise.all([
    downloadImages('data/1', 'imgs/1'),
    downloadImages('data/2', 'imgs/2.org'),
  ]);
};

const downloadImages = async (basedir, destdir) => {
  const filenames = readdirSync(resolve(basedir));
  const correctFilename = /^[0-9a-f]+\.json$/;
  for (const filename of filenames) {
    if (!correctFilename.test(filename)) { continue; }
    const filepath = resolve(basedir, filename);
    const data = JSON.parse(readFileSync(filepath));
    if (data.imageUrl == null) { continue; }
    console.log(`${data.name}: ${data.imageUrl}`);
    const response = await axios.get(
      data.imageUrl, { responseType: 'arraybuffer' }
    );
    if (response) {
      const extension = data.imageUrl.split('.').pop();
      const imageFileName = `${identify(data)}.${extension}`;
      const imageFilePath = resolve(destdir, imageFileName);
      writeFileSync(imageFilePath, new Buffer(response.data), 'binary');
    }
  }
};

main();
