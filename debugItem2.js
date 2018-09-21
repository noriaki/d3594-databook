const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');

const { logAndExit } = require('./libs/crawl');
const {
  visitItemPage,
  extractCommanderData,
} = require('./libs/crawl2');
const { patchCommanderData } = require('./libs/patch');
const {
  identify,
  humanizeId,
} = require('./libs/identify');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.emulate(devices['iPhone 7']);

  const id = '780';
  const itemPage = await visitItemPage(page, id);
  const d = await extractCommanderData(itemPage);
  const data = patchCommanderData(d, '2');
  console.log(`${data.id}:${humanizeId(data)}: ${data.name} (${identify(data)})`);
  console.log(data, data.tactics, data.status); // debug
})().then(() => process.exit()).catch(logAndExit);

// error handling
process.on('unhandledRejection', logAndExit);
