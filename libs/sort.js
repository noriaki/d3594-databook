// sort commanders
const baseRarity = [5, 4, 3, 2, 1];
const baseTeam = ['群', '魏', '蜀', '呉', '漢'];
const baseArmy = ['弓', '歩', '騎'];
/*
 * sort by:
 *   1. rarity(desc)
 *   2. cost(desc)
 *   3. team['群', '魏', '蜀', '呉', '漢']
 *   4. army['弓', '歩', '騎']
 *   5. originalId(asc)
 *   6. identifier(asc)
 */
const commanderSortKey = ({
  rarity: rawRarity,
  cost: rawCost,
  team: rawTeam,
  army: rawArmy,
  originalId,
  identifier,
}) => {
  const rarity = baseRarity.indexOf(rawRarity);
  const cost = 100 - Math.floor(rawCost * 10);
  const team = baseTeam.indexOf(rawTeam);
  const army = baseArmy.indexOf(rawArmy);
  const orgId = originalId != null ? originalId : '999999';
  return [
    rarity > -1 ? rarity : baseRarity.length,
    cost,
    team > -1 ? team : baseTeam.length,
    army > -1 ? army : baseArmy.length,
    orgId,
    identifier.slice(0, 6),
  ].join('/');
};

// sort tacitcs
const baseTypes = ['指揮', '主動', '追撃', '受動'];
const baseOrigin = ['典蔵', '典籍', '季専用', '分析', '固有(初期)'];
/*
 * sort by:
 *   1. type['指揮', '主動', '追撃', '受動']
 *   2. origin['典蔵', '典籍', '季専用', '分析', '固有(初期)']
 *   3. stock(asc)
 *   4. stage.length(desc)
 *   5. originalId(asc)
 *   6. identifier(asc)
 */
const tacticsSortKey = ({
  type: rawType,
  origin: rawOrigin,
  stock: rawStock,
  stage: rawStage,
  originalId,
  identifier,
}) => {
  const type = baseTypes.indexOf(rawType);
  const origin = baseOrigin.indexOf(rawOrigin);
  const stock = rawStock != null ? rawStock : 9;
  const stage = rawStage.split(/,\s*/).length;
  const orgId = originalId != null ? originalId : '999999';
  return [
    type,
    origin,
    stock,
    stage,
    orgId,
    identifier.slice(0, 6),
  ].join('/');
}

const buildCompareFunc = sortKeyFunc => (prev, next) => (
  sortKeyFunc(prev).localeCompare(sortKeyFunc(next))
);

const compareCommanders = buildCompareFunc(commanderSortKey);
const compareTactics = buildCompareFunc(tacticsSortKey);

module.commanderSortKey = commanderSortKey;
module.compareCommanders = compareCommanders;
module.tacticsSortKey = tacticsSortKey;
module.compareTactics = compareTactics;

module.exports = {
  commanderSortKey,
  compareCommanders,
  tacticsSortKey,
  compareTactics,
};
