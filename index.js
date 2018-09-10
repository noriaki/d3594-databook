const { writeFileSync } = require('fs');
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');

const {
  logAndExit,
  visitListPage,
  visitItemPage,
  extractMaxPage,
  getCommandersData,
  extractItemIds,
  extractCommanderData,
  extractCommanderImageUrl,
  extractCommanderName,
  matchCommanderName,
  extractCommanderDescription,
  extractCommanderSpecial,
  matchCommanderSpecial,
  retrieveTableDataWithIndex,
  extractCommanderBasicInfo,
  retrieveStatusData,
  extractCommanderStatus,
  retrieveTacticsInfo,
  retrieveTacticsData,
  extractCommanderTactics,
} = require('./libs/crawl');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.emulate(devices['iPhone 7']);

  const type = 'commander';
  await visitListPage(page, { type });
  const maxPage = await extractMaxPage(page);

  console.group(`----- page 1 of ${maxPage}`);
  const commanders = await getCommandersData(page);
  // return; // debug
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
