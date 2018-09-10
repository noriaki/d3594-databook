const { readdirSync, readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');
const axios = require('axios');

const { identify } = require('./libs/identify');

(async () => {
  const basedirname = 'data';
  const distdirname = 'imgs';
  const filenames = readdirSync(resolve(basedirname));
  const correctFilename = /^[0-9a-f]+\.json$/;
  for (const filename of filenames) {
    if (!correctFilename.test(filename)) { continue; }
    const filepath = resolve(basedirname, filename);
    const data = JSON.parse(readFileSync(filepath));
    if (data.imageUrl == null) { continue; }
    console.log(`${data.name}: ${data.imageUrl}`);
    const response = await axios.get(
      data.imageUrl, { responseType: 'arraybuffer' }
    );
    if (response) {
      const extension = data.imageUrl.split('.').pop();
      const imageFileName = `${identify(data)}.${extension}`;
      const imageFilePath = resolve(distdirname, imageFileName);
      writeFileSync(imageFilePath, new Buffer(response.data), 'binary');
    }
  }
})();
