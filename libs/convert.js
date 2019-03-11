const { inRange } = require('lodash');

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

const findBy = ({
  rarity,
  cost,
  team,
  army,
  distance,
  status: { delta: { attack, defense, intelligence, siege, velocity } },
}, debug = false) => ({
  quality: zRarity,
  cost: zCost,
  contory: zTeam,
  type: zArmy,
  distance: zDistance,
  attGrow: zAttack,
  defGrow: zDefense,
  ruseGrow: zIntelligence,
  siegeGrow: zSiege,
  speedGrow: zVelocity,
}) => {
  if (debug) {
    console.log({
      rarity, cost, team, army, distance,
      attack, defense, intelligence, siege, velocity,
    }, {
      zRarity, zCost, zTeam, zArmy, zDistance,
      zAttack, zDefense, zIntelligence, zSiege, zVelocity,
    });
  }

  return (
    rarity === zRarity
      && cost === zCost
      && team === teamMap[zTeam]
      && army === armyMap[zArmy]
      && distance === zDistance
      && inRange(Math.abs(attack - zAttack), 0.01)
      && inRange(Math.abs(defense - zDefense), 0.01)
      && inRange(Math.abs(intelligence - zIntelligence), 0.01)
      && inRange(Math.abs(siege - zSiege), 0.01)
      && inRange(Math.abs(velocity - zVelocity), 0.01)
  );
};

module.toText = toText;
module.toRarity = toRarity;
module.compare = compare;
module.sortKey = sortKey;
module.findBy = findBy;
module.exports = {
  toText,
  toRarity,
  compare,
  sortKey,
  findBy,
};
