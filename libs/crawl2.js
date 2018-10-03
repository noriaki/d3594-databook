const { patchCommanderData } = require('./patch');

const visitListPage = async (page) => {
  await page.goto('https://flash-onlinegames.net/daisangokushi/page-1157/', {
    waitUntil: 'networkidle2',
  });
  return page;
};

const visitItemPage = async (page, itemId) => {
  await page.goto(
    `https://flash-onlinegames.net/daisangokushi/${itemId}/`, {
      waitUntil: 'networkidle2',
    }
  );
  return page;
};

const getCommandersData = async (page) => {
  const rets = [];
  const ids = await extractItemIds(page);
  const idCount = ids.length;
  const windowSize = 10;
  const pageCount = Math.floor(idCount / windowSize);
  for (let pageIndex = 0; pageIndex <= pageCount; pageIndex++) {
    console.group(`----- page ${pageIndex + 1} of ${pageCount}`);
    const offset = pageIndex * windowSize;
    const currentIds = ids.slice(offset, offset + windowSize);
    for (const id of currentIds) {
      const itemPage = await visitItemPage(page, id);
      const d = await extractCommanderData(itemPage);
      const data = patchCommanderData(d, '2');
      rets.push(data);
      console.log(`${data.id}: ${data.name}`);
    }
    console.groupEnd();
  }
  return rets;
};

const extractItemIds = async (page) => {
  const linksHandle = await page.$$('main > article table tr > td a');
  const ids = [];
  for (const linkHandle of linksHandle) {
    const href = await page.evaluate(l => l.getAttribute('href'), linkHandle);
    linkHandle.dispose();
    if (href != null) {
      const id = extractItemId(href);
      if (id != null) { ids.push(id); }
    }
  }
  return ids;
};

const extractItemId = (url) => {
  const regexp = /\/daisangokushi\/(post-\d+|[-\d]+)\/$/;
  const m = url.match(regexp);
  if (m && m[1]) { return m[1]; }
  return null;
};

const extractCommanderData = async (page) => {
  const data = {};
  try {
    data.url = page.url();
    data.id = extractItemId(data.url);
    data.imageUrl = await extractCommanderImageUrl(page);
    data.name = await extractCommanderName(page);
    data.special = await extractCommanderSpecial(page);
    data.description = await extractCommanderDescription(page);
    const {
      rarity,
      cost,
      team,
      army,
      distance,
    } = await extractCommanderBasicInfo(page);
    data.rarity = rarity;
    data.cost = cost;
    data.team = team;
    data.army = army;
    data.distance = distance;
    data.status = await extractCommanderStatus(page);
    data.tactics = await extractCommanderTactics(page);
    data.crawledAt = new Date();
  } catch (error) {
    error.data = data;
    error.url = page.url();
    console.log(data.status, data.tactics);
    throw error;
  }
  return data;
};

const extractCommanderImageUrl = async (page) => {
  const imageUrlHandle = await page.$('.eyecatch > img');
  let imageUrl;
  if (imageUrlHandle !== null) {
    imageUrl = await page.evaluate(
      img => img.getAttribute('src'), imageUrlHandle
    );
    imageUrlHandle.dispose();
  }
  return imageUrl;
};

const extractCommanderName = async (page) => {
  const titleHandle = await page.$('main > article > section > h1');
  let name;
  if (titleHandle !== null) {
    const title = await page.evaluate(h1 => h1.innerText.trim(), titleHandle);
    name = matchCommanderName(title);
    titleHandle.dispose();
  }
  return name;
};

const matchCommanderName = (text) => {
  const regexp = /\u661F\d\s?(?:SP|XP)?(.+?)\s?[\u7FA4\u6F22\u9B4F\u5449\u8700\u5F13\u9A0E\u6B69]/;
  const m = text.match(regexp);
  if (m && m[1]) { return m[1]; }
  return null;
};

const extractCommanderDescription = async (page) => {
  const descriptionHandle = await page.$('#outline__1 + p, #outline__0_1 + p');
  let description;
  if (description !== null) {
    description = await page.evaluate(p => p.innerText.trim(), descriptionHandle);
    descriptionHandle.dispose();
  }
  return description;
};

const extractCommanderSpecial = async (page) => {
  const titleHandle = await page.$('main > article > section > h1');
  let special;
  if (titleHandle !== null) {
    const title = await page.evaluate(h1 => h1.innerText.trim(), titleHandle);
    special = matchCommanderSpecial(title);
    titleHandle.dispose();
  }
  return special;
};

const matchCommanderSpecial = (text) => {
  const regexp = /^(?:(S\d)\s+)?\u661F\d\s?(SP|XP)?.+?\s?[\u7FA4\u6F22\u9B4F\u5449\u8700\u5F13\u9A0E\u6B69]/;
  const m = text.match(regexp);
  if (m != null) { return m[1] || m[2] || null; }
  return null;
};

// @async (return Promise)
const retrieveTableDataWithIndex = (page, handle, index) => (
  page.evaluate((table, i) => (
    table.querySelectorAll('td')[i].innerText.trim()
  ), handle, index)
);

const extractCommanderBasicInfo = async (page) => {
  const data = {};
  const titleHandle = await page.$('main > article > section > h1');
  if (titleHandle != null) {
    const title = await page.evaluate(h1 => h1.innerText.trim(), titleHandle);
    data.rarity = parseInt(matchCommanderRarity(title), 10);
    titleHandle.dispose();
  }
  const tableHandle = await page.$('main > article > section > table');
  if (tableHandle === null) { return {}; }
  data.team = matchCommanderTeam(
    await retrieveTableDataWithIndex(page, tableHandle, 0)
  );
  data.army = formattedArmy(
    await retrieveTableDataWithIndex(page, tableHandle, 1)
  );
  data.cost = parseFloat(formattedCost(
    await retrieveTableDataWithIndex(page, tableHandle, 2)
  ));
  data.distance = parseInt(formattedDistance(
    await retrieveTableDataWithIndex(page, tableHandle, 3)
  ), 10);
  tableHandle.dispose();
  return data;
};

const matchCommanderRarity = (text) => {
  const regexp = /\u661F(\d)\s?.+?\s?[\u7FA4\u6F22\u9B4F\u5449\u8700\u5F13\u9A0E\u6B69]/;
  const m = text.match(regexp);
  if (m && m[1]) { return m[1]; }
  return null;
};

const matchCommanderTeam = (text) => {
  const regexp = /^[\u7FA4\u6F22\u9B4F\u5449\u8700]$/;
  return text.split('').find(t => regexp.test(t)) || null;
};

const formattedArmy = (army) => army.replace('\u5175', '');
const formattedCost = (cost) => cost.replace('\u30B3\u30B9\u30C8', '');
const formattedDistance = (distance) => (
  distance.replace('\u653B\u6483\u8DDD\u96E2', '')
);

const retrieveStatusData = async (page, handle) => {
  const r = retrieveTableDataWithIndex;
  const formatAndParseFloat = (t) => parseFloat(t.split('+').pop());
  let idx = 4;
  if (/^\u6210\u9577\u5024/.test(await r(page, handle, idx))) { idx += 1; }
  const attack = formatAndParseFloat(await r(page, handle, idx + 0));
  const defense = formatAndParseFloat(await r(page, handle, idx + 1));
  const intelligence = formatAndParseFloat(await r(page, handle, idx + 2));
  const siege = formatAndParseFloat(await r(page, handle, idx + 3));
  const velocity = formatAndParseFloat(await r(page, handle, idx + 4));
  return {
    attack,
    defense,
    intelligence,
    siege,
    velocity,
  };
};

const extractCommanderStatus = async (page) => {
  const tableHandle = await page.$('main > article > section > table');
  const status = {};
  if (tableHandle !== null) {
    status.delta = await retrieveStatusData(page, tableHandle);
    tableHandle.dispose();
  }
  return status;
};

const retrieveTacticsData = (data, index) => {
  if (index === null) { return null; }
  const tactics = {};
  tactics.name = data[index];
  const typeAndRate = data[index + 1].split(/\s+/);
  tactics.type = typeAndRate[0];
  const distanceText = extractNumber(data[index + 2]);
  tactics.distance = distanceText && parseInt(distanceText, 10);
  tactics.permissions = [...data[index + 4]]
    .filter(s => /^[\u9A0E\u6B69\u5F13]$/.test(s)).sort();
  tactics.rate = typeAndRate[1] || null;
  tactics.target = data[index + 3];
  tactics.description = data[index + 5];
  return tactics;
};

const extractNumber = (text) => {
  const regexp = /[\d.]+/;
  const m = text.match(regexp);
  if (m != null) { return m[0]; }
  return null;
};

const extractCommanderTactics = async (page) => {
  const tableHandle = await page.$('main > article > section > table');
  const tactics = {};
  if (tableHandle !== null) {
    const dataArray = await tableHandle.$$eval(
      'td, th', nodes => nodes.map(n => n.innerText.trim())
    );
    const initTacticsIndex = findIndexOfTactics(dataArray, 'init');
    tactics.init = retrieveTacticsData(dataArray, initTacticsIndex);
    const analyzableTacticsIndex = findIndexOfTactics(dataArray, 'analyzable');
    const analyzable2TacticsIndex = findIndexOfTactics(dataArray, 'analyzable2');
    tactics.analyzables = [
      retrieveTacticsData(dataArray, analyzableTacticsIndex),
      retrieveTacticsData(dataArray, analyzable2TacticsIndex),
    ];
    tableHandle.dispose();
  }
  return tactics;
};

const findIndexOfTactics = (data, key) => {
  const keys = {
    init: '\u56FA\u6709\u6226\u6CD5',
    analyzable: '\u5206\u6790\u53EF\u80FD\u6226\u6CD5',
    analyzable2: '\u5206\u6790\u53EF\u80FD\u6226\u6CD5',
  };
  const value = keys[key];
  let index = data.findIndex(d => d === value);
  if (key === 'analyzable2') {
    index += 7;
    if (data[index] == null || data[index] === '\u6B66\u5C06\u9023\u643A') {
      index = -1;
    } else { index -= 1; }
  }
  return index !== -1 ? index + 1 : null;
};

module.exports = {
  visitListPage,
  visitItemPage,
  extractItemIds,
  getCommandersData,
  extractCommanderData,
};
