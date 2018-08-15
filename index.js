const { writeFileSync } = require('fs');
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');

const logAndExit = (error) => { console.error(error); process.exit(1); };

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.emulate(devices['iPhone 7']);

  const type = 'commander';
  await visitListPage(page, { type });
  const maxPage = await extractMaxPage(page);

  console.group(`----- page 1 of ${maxPage}`);
  const commanders = await getCommandersData(page);
  console.log('-> write to files');
  for (const commander of commanders) {
    writeFileSync(`./data/${commander.id}.json`, JSON.stringify(commander, null, 2));
  }
  console.groupEnd();

  for (let pageIndex = 2; pageIndex <= maxPage; pageIndex++) {
    await visitListPage(page, { type, index: pageIndex });
    console.group(`----- page ${pageIndex} of ${maxPage}`);
    const commanders = await getCommandersData(page);
    console.log('-> write to files');
    for (const commander of commanders) {
      writeFileSync(`./data/${commander.id}.json`, JSON.stringify(commander, null, 2));
    }
    console.groupEnd();
  }

  await browser.close();
})().then(() => process.exit()).catch(logAndExit);

// error handling
process.on('unhandledRejection', logAndExit);

const visitListPage = async (page, { type, index }) => {
  const types = {
    commander: 's2%5B%5D=7270&s2%5B%5D=7271&s2%5B%5D=7272',
    tactics: 's6%5B%5D=7331&s6%5B%5D=7332',
  };
  const params = type != null ? `?${types[type]}` : '';
  await page.goto(
    `https://expi-games.jp/d3/object/list/${index || 1}${params}`, {
      waitUntil: 'networkidle2',
    });
  return page;
};

const visitItemPage = async (page, itemId) => {
  await page.goto(
    `https://expi-games.jp/d3/object/detail/${itemId}`, {
      waitUntil: 'networkidle2',
    }
  );
  return page;
};

const extractMaxPage = async (page) => {
  const paginationHandle = await page.$('.page');
  if (paginationHandle !== null) {
    const pagination = await page.evaluate(p => p.innerText, paginationHandle);
    await paginationHandle.dispose();
    if (pagination != null) {
      return pagination.split('/').pop().trim();
    }
  }
  return null;
};

const getCommandersData = async (page) => {
  const rets = [];
  const ids = await extractItemIds(page);
  for (const id of ids) {
    const itemPage = await visitItemPage(page, id);
    const data = await extractCommanderData(itemPage);
    rets.push(data);
    console.log(`${data.id}: ${data.name}`);
  }
  return rets;
};

const extractItemIds = async (page) => {
  const linksHandle = await page.$$('#unitInfo article > a');
  const ids = [];
  for (const linkHandle of linksHandle) {
    const href = await page.evaluate(l => l.getAttribute('href'), linkHandle);
    linkHandle.dispose();
    if (href != null) { ids.push(href.split('/').pop()); }
  }
  return ids;
};

const extractCommanderData = async (page) => {
  const data = {};
  try {
    data.url = page.url();
    data.id = data.url.split('/').pop();
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
    const { statusMin, statusMax, statusDelta } = await extractCommanderStatus(page);
    data.statusMin = statusMin;
    data.statusMax = statusMax;
    data.statusDelta = statusDelta;
    const { tacticsInit, tacticsAnalyzable } = await extractCommanderTactics(page);
    data.tacticsInit = tacticsInit;
    data.tacticsAnalyzable = tacticsAnalyzable;
    data.crawledAt = new Date();
  } catch (error) {
    error.data = data;
    throw error;
  }
  return data;
};

const extractCommanderImageUrl = async (page) => {
  const imageUrlHandle = await page.$('.unit-status .status-wrap img');
  let imageUrl;
  if (imageUrlHandle !== null) {
    imageUrl = await page.evaluate(img => img.getAttribute('src'), imageUrlHandle);
    imageUrlHandle.dispose();
  }
  return imageUrl;
};

const extractCommanderName = async (page) => {
  const titleHandle = await page.$('main h1');
  let name;
  if (titleHandle !== null) {
    const title = await page.evaluate(h1 => h1.innerText.trim(), titleHandle);
    name = matchCommanderName(title);
    titleHandle.dispose();
  }
  return name;
};

const matchCommanderName = (text) => {
  const regexp = /\u2605\d\s?(.+?)\s?[(\uFF08].+[)\uFF09]/;
  const m = text.match(regexp);
  if (m && m[1]) { return m[1]; }
  return null;
};

const extractCommanderDescription = async (page) => {
  const descriptionHandle = await page.$('main p.review');
  let description;
  if (descriptionHandle !== null) {
    description = await page.evaluate(p => p.innerText.trim(), descriptionHandle);
    descriptionHandle.dispose();
  }
  return description;
};

const extractCommanderSpecial = async (page) => {
  const titleHandle = await page.$('main h1');
  let special;
  if (titleHandle !== null) {
    const title = await page.evaluate(h1 => h1.innerText.trim(), titleHandle);
    special = matchCommanderSpecial(title);
    titleHandle.dispose();
  }
  return special;
};

const matchCommanderSpecial = (text) => {
  const regexp = /\u2605\d\s?.+?\s?[(\uFF08].+?(SP|S\d|XP)?[)\uFF09]/;
  const m = text.match(regexp);
  if (m && m[1]) { return m[1]; }
  return null;
};

// @async (return Promise)
const retrieveTableDataWithIndex = (page, handle, index) => (
  page.evaluate((table, i) => (
    table.querySelectorAll('td')[i].innerText.trim()
  ), handle, index)
);

const extractCommanderBasicInfo = async (page) => {
  const tableHandle = await page.$('#unitDetail table:nth-of-type(1)');
  if (tableHandle === null) { return {}; }
  const rarityText = await retrieveTableDataWithIndex(page, tableHandle, 0);
  const rarity = parseInt(rarityText.replace('\u2605', ''), 10);
  const cost = parseFloat(await retrieveTableDataWithIndex(page, tableHandle, 2));
  const team = await retrieveTableDataWithIndex(page, tableHandle, 4);
  const army = await retrieveTableDataWithIndex(page, tableHandle, 1);
  const distance = parseInt(await retrieveTableDataWithIndex(page, tableHandle, 3), 10);
  tableHandle.dispose();
  return {
    rarity,
    cost,
    team,
    army,
    distance,
  };
};

const retrieveStatusData = async (page, handle, index) => {
  // index: 0(min), 1(max), 2(delta)
  const r = retrieveTableDataWithIndex;
  const attack = parseFloat(await r(page, handle, 3 * 0 + index));
  const defense = parseFloat(await r(page, handle, 3 * 1 + index));
  const intelligence = parseFloat(await r(page, handle, 3 * 2 + index));
  const siege = parseFloat(await r(page, handle, 3 * 3 + index));
  const velocity = parseFloat(await r(page, handle, 3 * 4 + index));
  return {
    attack,
    defense,
    intelligence,
    siege,
    velocity,
  };
};

const extractCommanderStatus = async (page) => {
  const tableHandle = await page.$('#unitDetail table:nth-of-type(2)');
  let statusMin, statusMax, statusDelta;
  if (tableHandle !== null) {
    statusMin = await retrieveStatusData(page, tableHandle, 0);
    statusMax = await retrieveStatusData(page, tableHandle, 1);
    statusDelta = await retrieveStatusData(page, tableHandle, 2);
  }
  return { statusMin, statusMax, statusDelta };
};

// @async (return Promise)
const retrieveTacticsInfo = (page, handle) => (
  page.evaluate((table) => {
    const th = table.querySelector('th');
    const name = th.innerText.trim();
    const a = th.querySelector('a');
    const url = a.getAttribute('href');
    const id = url.split('/').pop();
    return { id, url, name };
  }, handle)
);

const retrieveTacticsData = async (page, handle) => {
  const tactics = await retrieveTacticsInfo(page, handle);
  tactics.type = await retrieveTableDataWithIndex(page, handle, 0);
  tactics.distance = await retrieveTableDataWithIndex(page, handle, 2);
  const permissionText = await retrieveTableDataWithIndex(page, handle, 1);
  tactics.permissions = [...permissionText]
    .filter(s => /^[\u9A0E\u6B69\u5F13]$/.test(s)).sort();
  return tactics;
  p};

const extractCommanderTactics = async (page) => {
  const tableInitHandle = await page.$('#unitDetail div table');
  let tacticsInit;
  if (tableInitHandle !== null) {
    tacticsInit = await retrieveTacticsData(page, tableInitHandle);
    tableInitHandle.dispose();
  }

  const tableAnalyzableHandle = await page.$('#unitDetail table:nth-of-type(4)');
  let tacticsAnalyzable;
  if (tableAnalyzableHandle !== null) {
    tacticsAnalyzable = await retrieveTacticsData(page, tableAnalyzableHandle);
    tableAnalyzableHandle.dispose();
  }

  return { tacticsInit, tacticsAnalyzable };
};
