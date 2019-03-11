const { writeFileSync } = require('fs');
const { resolve } = require('path');
const axios = require('axios');

const endpoint = 'https://stzb.163.com/json';
const commandersDataUri = `${endpoint}/g10_all.json`;
const tacticsDataUri = `${endpoint}/jineng_list.json`;

const p1 = axios.get(
  commandersDataUri,
  { headers: { 'Content-Type': 'application/json' } }
).then(({ data }) => {
  console.log('commanders count:', data.length);
  writeFileSync(
    resolve('./data/stzb/commanders-raw.json'),
    JSON.stringify(data, null, 2),
    'utf8'
  );
});

const p2 = axios.get(
  tacticsDataUri,
  { headers: { 'Content-Type': 'application/json' } }
).then(({ data }) => {
  console.log('tactics count:', data.length);
  writeFileSync(
    resolve('./data/stzb/tactics-raw.json'),
    JSON.stringify(data, null, 2),
    'utf8'
  );
});

Promise.all([p1, p2]).then(() => process.exit());
