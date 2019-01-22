const {
  chunk,
  isEmpty,
  negate,
  set,
  keyBy,
  maxBy,
  compact,
} = require('lodash');
const { writeFileSync } = require('fs');
const { resolve } = require('path');
const moment = require('moment');
moment.locale('ja');
const today = moment().format('l');

const GoogleSpreadsheets = require('google-spreadsheet-as-promised');
const CREDS = require('./.google-generated-creds.json');
const SHEETID = '1VTiHmW8DtF7NvSoAacznWTvEJSev75YyRuEbn9fLh3I';

const { logAndExit } = require('./libs/crawl');
const { identify, isIdentifier, md5 } = require('./libs/identify');
const { toCellName } = require('./libs/spreadsheets');

const maxDataRow = 500;
const maxColumnAddress = 'AE';

const main = async () => {
  const sheet = new GoogleSpreadsheets();
  await sheet.load(SHEETID, CREDS);

  // prepare data
  const commanderUpdates = await prepareCommanderData(sheet);
  await updateSheetData(sheet, 'commanders', commanderUpdates);
  const spTacticsUpdates = await prepareTacticsData(sheet, 'specificTactics');
  await updateSheetData(sheet, 'specificTactics', spTacticsUpdates);
  const anTacticsUpdates = await prepareTacticsData(sheet, 'analyzablesTactics');
  await updateSheetData(sheet, 'analyzablesTactics', anTacticsUpdates);

  // store json
  const data = await getData(sheet, 'commanders');
  const spTactics = await getData(sheet, 'specificTactics');
  const spTacticsTable = keyBy(
    spTactics.map(compactPermissions), 'identifier'
  );
  const adTactics = await getData(sheet, 'analyzablesTactics');
  const adTacticsTable = keyBy(
    adTactics.map(compactPermissions), 'identifier'
  );
  const finalData = data.map(replaceTactics(spTacticsTable, adTacticsTable));
  writeFileSync(
    resolve('./data/commanders.json'),
    JSON.stringify(finalData, null, 2)
  );
};

main().then(() => process.exit()).catch(logAndExit);

// error handling
process.on('unhandledRejection', logAndExit);

// store json
const getData = async (sheet, name) => {
  const worksheet = await sheet.getWorksheetByName(name);
  const headers = await getHeaders(worksheet);
  const paths = convertObjectPaths(headers);
  const cellsRange = `A2:${toCellName(maxDataRow - 1, headers.length - 1)}`;
  const cells = await worksheet.getCells(cellsRange);
  const rows = chunk(cells.getAllValues(), cells.getWidth());
  return compactData(rows).map(columns => columns.reduce((obj, cell, i) => {
    const path = paths[i];
    set(obj, path, convertData(cell));
    return obj;
  }, {}));
};

const getHeaders = async (worksheet) => {
  const cells = await worksheet.getCells(`A1:${maxColumnAddress}1`);
  return cells.getAllValues().filter(negate(isEmpty));
};

const convertObjectPaths = headers => headers.map(h => h.split('/'));

const compactData = rows => (
  rows.slice(0, rows.findIndex(columns => columns.every(isEmpty)))
);

const getColumnsIndexes = headers => headers.reduce(
  (current, header, index) => {
    current[header] = parseInt(index, 10);
    return current;
  }, {}
);

const isFloatRegexp = /^\d+\.\d+$/;
const isIntRegexp = /^\d+$/;
const convertData = (data) => {
  if (data === '') { return null; }
  if (isFloatRegexp.test(data)) { return parseFloat(data); }
  if (isIntRegexp.test(data)) { return parseInt(data, 10); }
  return data;
};

const compactPermissions = (tactics) => {
  set(tactics, 'permissions', compact(tactics.permissions));
  return tactics;
}

const replaceTactics = (spTacticsTable, adTacticsTable) => (commander) => {
  const {
    specificTacticsId,
    analyzableTacticsIds,
    ...data
  } = commander;
  set(data, 'tactics.init', spTacticsTable[specificTacticsId]);
  set(data, 'tactics.analyzables', analyzableTacticsIds.map(
    identifier => identifier && adTacticsTable[identifier]
  ));
  return data;
};

// prepare data
const updateSheetData = async (sheet, name, updates) => {
  const worksheet = await sheet.getWorksheetByName(name);
  const cells = await worksheet.getCells(`A2:${maxColumnAddress}${maxDataRow}`);
  for (const [address, value] of Object.entries(updates)) {
    await cells.setValue(address, value);
  }
};

const prepareCommanderData = async (sheet) => {
  // commanders
  const worksheet = await sheet.getWorksheetByName('commanders');
  const table = await worksheet.getCells(`A2:${maxColumnAddress}${maxDataRow}`);
  const data = chunk(table.getAllValues(), table.getWidth());
  const fieldIndexes = getColumnsIndexes(await getHeaders(worksheet));
  return compactData(data).reduce((change, row, index) => {
    const rowIndex = index + 1; // add headers row
    let isChange = false;
    // commander identifier
    const id = row[fieldIndexes.identifier];
    if (!isEmpty(id) && !isIdentifier(id)) {
      const commander = {
        name: row[fieldIndexes.name],
        special: row[fieldIndexes.special],
        rarity: parseFloat(row[fieldIndexes.rarity]),
        team: row[fieldIndexes.team],
        army: row[fieldIndexes.army],
      };
      if (isEmpty(commander.special)) { commander.special = null; }
      const identifier = identify(commander);
      change[toCellName(rowIndex, fieldIndexes.identifier)] = identifier;
      isChange = true;
    }

    // specific tactics identifier
    const stid = row[fieldIndexes.specificTactics];
    if (!isEmpty(stid) && !isIdentifier(stid)) {
      change[toCellName(rowIndex, fieldIndexes.specificTactics)] = md5(stid);
      isChange = true;
    }

    // additional tactics identifiers
    const atid0 = row[fieldIndexes['analyzableTacticsIds/0']];
    if (!isEmpty(atid0) && !isIdentifier(atid0)) {
      const k0 = toCellName(rowIndex, fieldIndexes['analyzableTacticsIds/0']);
      change[k0] = md5(atid0);
      isChange = true;
    }
    const atid1 = row[fieldIndexes['analyzableTacticsIds/1']];
    if (!isEmpty(atid1) && !isIdentifier(atid1)) {
      const k1 = toCellName(rowIndex, fieldIndexes['analyzableTacticsIds/1']);
      change[k1] = md5(atid1);
      isChange = true;
    }
    if (isChange) {
      change[toCellName(rowIndex, fieldIndexes.crawledAt)] = today;
    }
    return change;
  }, {});
};

// specificTactics
// analyzablesTactics
const prepareTacticsData = async (sheet, name) => {
  const worksheet = await sheet.getWorksheetByName(name);
  const table = await worksheet.getCells(`A2:${maxColumnAddress}${maxDataRow}`);
  const data = chunk(table.getAllValues(), table.getWidth());
  const fieldIndexes = getColumnsIndexes(await getHeaders(worksheet));
  const commanderStages = mapCommanderStagesKeyByTacticsId(
    await getData(sheet, 'commanders')
  );
  return compactData(data).reduce((change, row, index) => {
    const rowIndex = index + 1; // add headers row
    const id = row[fieldIndexes.identifier];
    if (!isEmpty(id) && !isIdentifier(id)) {
      const name = row[fieldIndexes.name];
      const identifier = md5(name);
      change[toCellName(rowIndex, fieldIndexes.identifier)] = identifier;
    }
    if (isEmpty(row[fieldIndexes.stage])) {
      const stage = maxBy(commanderStages[id], 'length');
      if (stage != null) {
        change[toCellName(rowIndex, fieldIndexes.stage)] = stage;
      }
    }
    return change;
  }, {});
};

const mapCommanderStagesKeyByTacticsId = commanders => commanders.reduce(
  (ret, commander) => {
    compact(commander.analyzableTacticsIds).forEach((tacticsId) => {
      ret[tacticsId] = (ret[tacticsId] || []).concat([commander.stage]);
    });
    return ret;
  }, {}
);
