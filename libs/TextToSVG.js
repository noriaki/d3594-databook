const { round } = require('lodash');
const opentype = require('opentype.js');

const defaultOptions = {
  fontSize: 40,
  decimalPlaces: 2,
};

class TextToSVG {
  constructor(font) {
    this.font = font;
  }

  static loadSync(fontPath) {
    return new this(opentype.loadSync(fontPath));
  }

  getWidth(text, options = defaultOptions) {
    return this.getDimensions(text, options).width;
  }

  getHeight(text, options = defaultOptions) {
    return this.getDimensions(text, options).height;
  }

  getGlyphs(text) {
    return this.font.stringToGlyphs(text);
  }

  getDimensions(text, options = defaultOptions) {
    const { decimalPlaces, ...others } = options;
    const { x1, x2, y1, y2 } = this.getPath(text, others).getBoundingBox();
    return {
      x: round(x1, decimalPlaces),
      y: round(y1, decimalPlaces),
      width: round(x2 - x1, decimalPlaces),
      height: round(y2 - y1, decimalPlaces),
    };
  }

  getPath(text, options = defaultOptions) {
    const { fontSize, decimalPlaces, ...otherOptions } = options;
    const fontScale = 1 / this.font.unitsPerEm * fontSize;
    // max char height from baseline
    const baselineHeight = Math.max(...this.getGlyphs(text).map((g) => {
      const { y1, y2 } = g.getBoundingBox();
      return round((y2 - y1) * fontScale, decimalPlaces);
    }));
    return this.font.getPath(text, 0, baselineHeight, fontSize, otherOptions);
  }

  toPathData(text, options = defaultOptions) {
    const { decimalPlaces, ...otherOptions } = options;
    const path = this.getPath(text, otherOptions);
    return path.toPathData(decimalPlaces);
  }

  toPath(text, options = defaultOptions) {
    const { decimalPlaces, ...otherOptions } = options;
    const path = this.getPath(text, otherOptions);
    return path.toSVG(decimalPlaces);
  }

  toSVG(text, id, options = defaultOptions) {
    const pathTag = this.toPath(text, options);
    const dimensions = this.getDimensions(text, options)
    const startTag = generateSvgStartTag(id, dimensions);
    const endTag = '</svg>';
    return [startTag, pathTag, endTag].join('');
  }
}

module.exports = TextToSVG;

const generateSvgStartTag = (id, { x, y, width, height }) => (
  [
    '<svg',
    `id="${id}"`,
    `viewBox="${x} ${y} ${width} ${height}"`,
    'xmlns="http://www.w3.org/2000/svg"',
    'xmlns:xlink="http://www.w3.org/1999/xlink">',
  ].join(' ')
);
