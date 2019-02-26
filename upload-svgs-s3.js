const { readFileSync } = require('fs');
const { resolve: resolvePath } = require('path');
const { floor } = require('lodash');
const s3 = require('s3');

const { logAndExit } = require('./libs/crawl');

const s3Options = JSON.parse(
  readFileSync(resolvePath('./.aws-s3-creds.json'))
);

const client = s3.createClient({ s3Options });

const sync = (localDir, destDir) => new Promise((resolve, reject) => {
  const params = {
    localDir: resolvePath(localDir),
    deleteRemoved: true,
    s3Params: {
      Bucket: 'assets-deck.d3594.com',
      Prefix: destDir.endsWith('/') ? destDir : `${destDir}/`,
      ACL: 'public-read',
      ContentType: 'image/svg+xml',
    },
  };

  console.log(`\nsync... ${localDir} to ${destDir}`);
  const uploader = client.uploadDir(params);
  uploader.on('error', reject);
  uploader.on('progress', () => {
    const amount = parseInt(uploader.progressAmount, 10);
    const total = parseInt(uploader.progressTotal, 10);
    const ratio = total === 0 ? 0 : floor((amount / total) * 100, 1);
    process.stdout.write(`uploading... ${ratio}%   \r`);
  });
  uploader.on('end', () => {
    console.log('\ndone.');
    resolve();
  });
});

const main = async () => {
  await sync('./imgs/svgs/commanders', 'svgs/commanders/').catch(logAndExit);
  await sync('./imgs/svgs/tactics', 'svgs/tactics/').catch(logAndExit);
  await sync('./imgs/svgs/assets', 'svgs/assets/').catch(logAndExit);
};

main().then(() => process.exit()).catch(logAndExit);

// error handling
process.on('unhandledRejection', logAndExit);
