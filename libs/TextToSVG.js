const opentype = require('opentype.js');

const defaultOptions = { fontSize: 40 };

class TextToSVG {
  constructor(font) {
    this.font = font;
  }

  static loadSync(fontPath) {
    return new this(opentype.loadSync(fontPath));
  }

  getWidth(text, options = defaultOptions) {
    const { fontSize, ...otherOptions } = options;
    return this.font.getAdvanceWidth(text, fontSize, otherOptions);
  }

  getHeight(fontSize = defaultOptions.fontSize) {
    const fontScale = 1 / this.font.unitsPerEm * fontSize;
    return ((this.font.ascender - this.font.descender) * fontScale);
  }

  getGlyphs(text) {
    return this.font.stringToGlyphs(text);
  }

  getPath(text, options = defaultOptions) {
    const { fontSize, ...otherOptions } = options;
    const fontScale = 1 / this.font.unitsPerEm * fontSize;
    // max char height from baseline
    const baselineHeight = Math.max(...this.getGlyphs(text).map((g) => {
      const { y1, y2 } = g.getBoundingBox();
      return (y2 - y1) * fontScale;
    }));
    return this.font.getPath(text, 0, baselineHeight, fontSize, otherOptions);
  }

  toPathData(text, options = defaultOptions) {
    const path = this.getPath(text, options)
    return path.toPathData();
  }

  toPath(text, options = defaultOptions) {
    const path = this.getPath(text, options)
    return path.toSVG();
  }

  toSVG(text, options = defaultOptions) {
    const pathTag = this.toPath(text, options);
    const startTag = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">';
    const endTag = '</svg>';
    return [startTag, pathTag, endTag].join('');
  }
}

module.exports = TextToSVG;
