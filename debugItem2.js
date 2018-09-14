const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');

const { logAndExit } = require('./libs/crawl');
const {
  visitItemPage,
  extractCommanderData,
} = require('./libs/crawl2');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.emulate(devices['iPhone 7']);

  const id = '2295';
  const itemPage = await visitItemPage(page, id);
  const data = await extractCommanderData(itemPage);
  console.log(`${data.id}: ${data.name}`);
  console.log(data, data.tactics, data.status); // debug
})().then(() => process.exit()).catch(logAndExit);

// error handling
process.on('unhandledRejection', logAndExit);
