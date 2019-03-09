const toText = text => (
  text && text.replace(/&#(\d+);/ig, (_, s) => String.fromCodePoint(s))
);
const toRarity = quality => parseInt(quality, 10) + 1;

const compare = (a, b) => (sortKey(a) - sortKey(b));
const sortKey = ({ quality, cost, contory, type, id }) => [
  5 - toRarity(quality),
  100 - Math.floor(cost * 10),
  ['群', '魏', '蜀', '吴', '汉'].indexOf(contory),
  ['弓', '步', '骑'].indexOf(type),
  id,
].join('/');

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
