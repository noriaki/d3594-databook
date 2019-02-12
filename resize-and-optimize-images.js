const { readdirSync, readFileSync, writeFileSync } = require('fs');
const { resolve, extname, basename } = require('path');
const { keyBy } = require('lodash');
const jimp = require('jimp');
const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminMozjpeg = require('imagemin-mozjpeg');

const { logAndExit } = require('./libs/crawl');

const baseimagedir = 'imgs/dest';
const destimagedir = 'imgs/opti';

const resizeMinTargetWidth = 276;
const imageminOptions = {
  [jimp.MIME_JPEG]: {
    quality: '75',
  },
  [jimp.MIME_PNG]: {
    quality: [0.65, 0.8],
    // posterize: 0,
  },
};
const imageminPlugins = {
  [jimp.MIME_JPEG]: imageminMozjpeg,
  [jimp.MIME_PNG]: imageminPngquant,
};

const sizeShortageList = [];
const destShortageListPath = 'imgs/shortage.json';

const main = async () => {
  const commanders = JSON.parse(
    readFileSync(resolve('./data/commanders.json'), 'utf8')
  );
  const commandersKeyByIdentifier = keyBy(commanders, 'identifier');
  const filenames = readdirSync(resolve(baseimagedir));
  const correctFilename = /^[0-9a-f]+\.(jpe?g|png|gif)/;
  const correctContentType = [jimp.MIME_JPEG, jimp.MIME_PNG];

  for (const filename of filenames) {
    if (!correctFilename.test(filename)) { continue; }
    const ext = extname(filename);
    const identifier = basename(filename, ext);
    const inputFilepath = resolve(baseimagedir, filename);
    const outputFiles = [
      { width: 414, path: resolve(destimagedir, `${identifier}@3x.jpg`) },
      { width: 276, path: resolve(destimagedir, `${identifier}@2x.jpg`) },
      { width: 138, path: resolve(destimagedir, `${identifier}.jpg`) },
    ];

    // load image
    const inputImage = await jimp.read(inputFilepath);
    const mime = inputImage.getMIME();
    process.stdout.write(`processing [${filename}](${mime}) ... `);

    // optimize
    let optimizedImageBuffer;
    if (correctContentType.includes(mime)) {
      const imageBuffer = await inputImage.getBufferAsync(mime);
      optimizedImageBuffer = await imagemin.buffer(imageBuffer, {
        plugins: [imageminPlugins[mime](imageminOptions[mime])],
      });
    } else {
      console.log('not expected content-type: %s', mime);
      continue;
    }
    const optimizedImage = await jimp.read(optimizedImageBuffer);

    // export size shortage list
    if (optimizedImage.bitmap.width < resizeMinTargetWidth) {
      const shortageData = {
        identifier,
        commander: commandersKeyByIdentifier[identifier].id,
        filename,
        size: {
          width: optimizedImage.bitmap.width,
          height: optimizedImage.bitmap.height,
        },
      };
      sizeShortageList.push(shortageData);
      const { width: w, height: h } = shortageData.size;
      process.stdout.write(`!shortage (w: ${w}, h: ${h}), `);
    }

    // resize and save
    await Promise.all(outputFiles.map(({ width, path }) => {
      const outputImage = optimizedImage.clone();
      if (outputImage.bitmap.width > width) {
        outputImage.resize(width, jimp.AUTO);
      }
      return outputImage.writeAsync(path);
    }));
    console.log('resized, save.');
  }

  if (sizeShortageList.length > 0) {
    writeFileSync(
      resolve(destShortageListPath),
      JSON.stringify(sizeShortageList, null, 2)
    );
    console.log(`
All done.
Size shortage image(s)
  count:    ${sizeShortageList.length}
  save to:  ${destShortageListPath}`);
  } else {
    console.log(`
All done.
No size shortage image :)`);
  }
};

main().then(() => process.exit()).catch(logAndExit);

// error handling
process.on('unhandledRejection', logAndExit);
