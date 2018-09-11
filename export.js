const { readdirSync, readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');
const moment = require('moment');
const stringify = require('csv-stringify/lib/sync');

const {
  humanizeId,
  identify,
  md5,
} = require('./libs/identify');

const main = () => {
  const basedirname = 'data';
  const filenames = readdirSync(resolve(basedirname));
  const correctFilename = /^[0-9a-f]+\.json$/;
  const commanders = [];
  const specificTacticsList = [];
  const analyzablesTacticsList = [];
  for (const filename of filenames) {
    if (!correctFilename.test(filename)) { continue; }
    const filepath = resolve(basedirname, filename);
    const data = JSON.parse(readFileSync(filepath));
    data.crawledAt = moment(data.crawledAt).format('YYYY/MM/DD');
    const {
      commander,
      specificTactics,
      analyzablesTactics,
    } = shapeData(data);
    commanders.push(flatten(commander));
    if (specificTactics != null) {
      specificTacticsList.push(flatten(specificTactics));
    }
    analyzablesTactics.forEach((tactics) => {
      if (analyzablesTacticsList.every(notEqual(tactics))) {
        analyzablesTacticsList.push(flatten(tactics));
      }
    });
  }
  writeCsvFile('./output/commanders.csv', commanders);
  writeCsvFile('./output/specificTactics.csv', specificTacticsList);
  writeCsvFile('./output/analyzablesTactics.csv', analyzablesTacticsList);
};

const writeCsvFile = (filepath, data) => {
  const columns = Object.keys(data[0]);
  const options = { quoted: true, header: true, columns };
  writeFileSync(filepath, stringify(data, options));
}

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

const notEqual = ({ identifier }) => tactics => identifier !== tactics.identifier;

const shapeData = (data) => {
  const { tactics, ...commander } = data;
  const finalCommander = shapeCommander(commander);
  let specificTactics;
  if (tactics.init != null) {
    specificTactics = shapeTactics(tactics.init);
    finalCommander.specificTacticsId = specificTactics.identifier;
  }
  const analyzablesTactics = tactics.analyzables.map(shapeTactics);
  finalCommander.analyzableTacticsIds = fillArray(
    2, analyzablesTactics.map(t => t.identifier)
  );
  return {
    commander: finalCommander,
    specificTactics,
    analyzablesTactics,
  };
};

const shapeCommander = (commander) => {
  commander.id = humanizeId(commander);
  commander.identifier = identify(commander);
  delete commander.url;
  delete commander.imageUrl;
  return commander;
};

const shapeTactics = (tactics) => {
  tactics.identifier = md5(tactics.name);
  tactics.permissions = fillArray(3, tactics.permissions);
  delete tactics.id;
  delete tactics.url;
  return tactics;
};

const fillArray = (maxSize, fillerArray, defaultValue = null) => (
  Array.from(new Array(maxSize), (_, i) => fillerArray[i] || defaultValue)
);

main();
