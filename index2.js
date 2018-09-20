const { writeFileSync } = require('fs');
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');

const { logAndExit } = require('./libs/crawl');
const {
  visitListPage,
  getCommandersData,
} = require('./libs/crawl2');

const { identify } = require('./libs/identify');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.emulate(devices['iPhone 7']);

  await visitListPage(page);

  const commanders = await getCommandersData(page);
  for (const commander of commanders) {
    writeFileSync(jsonFilePath(commander), JSON.stringify(commander, null, 2));
  }

  await browser.close();
})().then(() => process.exit()).catch(logAndExit);

// error handling
process.on('unhandledRejection', logAndExit);

const jsonFilePath = (data) => {
  const fileName = `${identify(data)}.json`;
  return `./data/2/${fileName}`;
};
