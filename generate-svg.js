const { readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');

const TextToSVG = require('./libs/TextToSVG');
const textToSVG = TextToSVG.loadSync('./fonts/SourceHanSans-Regular.otf');

const generateSvgAndSave = dir => ({ name, identifier }) => {
  const data = textToSVG.toSVG(name, identifier);
  writeFileSync(resolve(dir, `${identifier}.svg`), data);
};

const commanders = JSON.parse(
  readFileSync(resolve('./data/commanders.json'), 'utf8')
);
[{ name: '未配置', identifier: 'default' }, ...commanders]
  .forEach(generateSvgAndSave('./imgs/svgs/commanders'));

const tactics = JSON.parse(
  readFileSync(resolve('./data/tactics.json'), 'utf8')
);
[{ name: '未習得', identifier: 'default' }, ...tactics]
  .forEach(generateSvgAndSave('./imgs/svgs/tactics'));

const armies = [
  { name: '弓', identifier: 'army-archer' },
  { name: '歩', identifier: 'army-infantry' },
  { name: '騎', identifier: 'army-cavalry' },
];
const teams = [
  { name: '群', identifier: 'team-gun' },
  { name: '魏', identifier: 'team-gi' },
  { name: '蜀', identifier: 'team-shoku' },
  { name: '呉', identifier: 'team-go' },
  { name: '漢', identifier: 'team-kan' },
];
[...armies, ...teams]
  .forEach(generateSvgAndSave('./imgs/svgs/assets'));
