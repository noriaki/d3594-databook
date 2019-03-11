const toText = text => (
  text && text.replace(/&#(\d+);/ig, (_, s) => String.fromCodePoint(s))
);
const toRarity = quality => parseInt(quality, 10) + 1;

const teamMap = {
  群: '群',
  魏: '魏',
  蜀: '蜀',
  吴: '呉',
  汉: '漢',
};
const armyMap = {
  弓: '弓',
  步: '歩',
  骑: '騎',
};

const compare = (a, b) => (sortKey(a) - sortKey(b));
const sortKey = ({ quality, cost, contory, type, id }) => [
  5 - toRarity(quality),
  100 - Math.floor(cost * 10),
  Object.keys(teamMap).indexOf(contory),
  Object.keys(armyMap).indexOf(type),
  id,
].join('/');

const matchTeam = (team) => {};
const matchArmy = (army) => {};

module.toText = toText;
module.toRarity = toRarity;
module.compare = compare;
module.sortKey = sortKey;
module.exports = {
  toText,
  toRarity,
  compare,
  sortKey,
};
