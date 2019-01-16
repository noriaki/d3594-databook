const { readFileSync } = require('fs');
const { resolve } = require('path');
const { floor } = require('lodash');
const s3 = require('s3');

const s3Options = JSON.parse(readFileSync(resolve('./.aws-s3-creds.json')));

const client = s3.createClient({ s3Options });

const params = {
  localDir: resolve('./imgs/dest'),
  deleteRemoved: true,
  s3Params: {
    Bucket: 'assets.deck.d3594.com',
    Prefix: 'images/commanders/',
    ACL: 'public-read',
  },
};

const uploader = client.uploadDir(params);
uploader.on('error', console.error.bind(console));
uploader.on('progress', () => {
  const amount = parseInt(uploader.progressAmount, 10);
  const total = parseInt(uploader.progressTotal, 10);
  const ratio = total === 0 ? 0 : floor((amount / total) * 100, 1);
  process.stdout.write(`uploading... ${ratio}%   \r`);
});
uploader.on('end', () => console.log('\ndone sync'));
