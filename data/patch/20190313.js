module.exports = {
  indexFinder (data) {
    return data.identifier === '650f5b42c1b4dc51c467cc630d6ab56a';
  },
  dataReplacer (data) {
    const clone = Object.assign({}, data);
    clone.status.min.intelligence = 42;
    clone.status.max.intelligence = 61;
    clone.status.delta.intelligence = 0.39;
    return clone;
  },
};
