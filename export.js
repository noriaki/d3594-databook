const { readdirSync, readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');
const moment = require('moment');
const stringify = require('csv-stringify/lib/sync');

/**
 * PRIVATE
 * Flatten a deep object into a one level object with it’s path as key
 *
 * @param  {object} object - The object to be flattened
 * @return {object}        - The resulting flat object
 *
 */
const flatten = object => (
  Object.assign({}, ...(function _flatten(objectBit, path) {
    return [].concat(
      ...Object.keys(objectBit).map(key => {
        const newPath = path !== undefined ? `${path}/${key}` : key;
        return (
          typeof objectBit[key] === 'object' && objectBit[key] !== null ?
            _flatten(objectBit[key], newPath) : { [newPath]: objectBit[key] }
        );
      })
    );
  })(object))
);

(() => {
  const basedirname = 'data';
  const filenames = readdirSync(resolve(basedirname));
  const correctFilename = /^\d+\.json$/;
  const commanders = [];
  for (const filename of filenames) {
    if (!correctFilename.test(filename)) { continue; }
    const filepath = resolve(basedirname, filename);
    const data = flatten(JSON.parse(readFileSync(filepath)));
    data.crawledAt = moment(data.crawledAt).format('YYYY/MM/DD');
    commanders.push(data);
  }
  const columns = Object.keys(commanders[0]);
  const options = { quoted: true, header: true, columns };
  writeFileSync('./output/output.csv', stringify(commanders, options));
})();
