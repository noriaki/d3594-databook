const { createHash } = require('crypto');

const humanizeId = ({ name, rarity, special, team, army }) => {
  const nameSuffix = special !== null ? `(${special})` : '';
  return `\u2605${rarity}\u30FB${name}${nameSuffix}\u30FB${team}\u30FB${army}`;
};

const identify = (identifier) => (
  typeof identifier === 'string' ?
    md5(identifier) : md5(humanizeId(identifier))
);

const md5 = (src) => {
  const hash = createHash('md5');
  hash.update(src, 'binary');
  return hash.digest('hex');
};

module.exports = {
  humanizeId,
  identify,
  md5,
};
