const { readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');
const jimp = require('jimp');

const { identify } = require('./libs/identify');

const destdir = './data/dest';

const main = async () => {
  const filepath = resolve('./data/new.json');
  const commanders = JSON.parse(readFileSync(filepath));
  for (let commander of commanders) {
    const id = identify(commander);
    commander = setCommanderStatus(commander);
    commander = await preprocessImage(commander);
    const destpath = resolve(destdir, `${id}.json`);
    writeFileSync(destpath, JSON.stringify(commander, null, 2));
    console.log(`import... ${id}`);
  }
};

const setCommanderStatus = (data) => {
  const { current, delta } = data.status;
  delete data.status.current;
  data.status.min = calcStatusMin(current, delta);
  data.status.max = calcStatusMax(current, delta);
  return data;
};

const calcStatusMin = (current, delta) => {
  const ret = {};
  Object.keys(delta).forEach((key) => {
    ret[key] = Math.round(current[key] - ((current.level - 1) * delta[key]));
  });
  return ret;
};
const calcStatusMax = (current, delta) => {
  const ret = {};
  const maxLevel = 50;
  Object.keys(delta).forEach((key) => {
    ret[key] = Math.round(
      current[key] + ((maxLevel - current.level) * delta[key])
    );
  });
  return ret;
};

const baseImgsDir = './imgs/new';
const destImgsDir = './imgs/dest';

const preprocessImage = async (data) => {
  const source = resolve(baseImgsDir, data.image);
  const id = identify(data);
  const image = await jimp.read(source);
  const destfilename = `${id}.${image.getExtension()}`;
  await image
    .crop(425, 146, 618, 846) // cropping for iPhoneX screenshot size
    .writeAsync(resolve(destImgsDir, destfilename));
  data.image = destfilename;
  return data;
};

main();
