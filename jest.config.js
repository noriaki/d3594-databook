const pathIgnorePatterns = [
  '<rootDir>/.git/',
  '<rootDir>/node_modules/',
];

module.exports = {
  testPathIgnorePatterns: pathIgnorePatterns,
  watchPathIgnorePatterns: pathIgnorePatterns,
};
