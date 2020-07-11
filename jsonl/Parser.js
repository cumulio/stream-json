'use strict';

const Utf8Stream = require('../utils/Utf8Stream');

class JsonlParser extends Utf8Stream {
  static make(options) {
    return new JsonlParser(options);
  }

  constructor(options) {
    super(Object.assign({}, options, {readableObjectMode: true}));
    this._rest = '';
    this._counter = 0;
    this._reviver = options && options.reviver;
  }

  _processBuffer(callback) {
    const lines = this._buffer.split('\n');
    this._rest += lines[0];
    if (lines.length > 1) {
      this._rest && this.push({key: this._counter++, value: JSON.parse(this._rest, this._reviver)});
      this._rest = lines.pop();
      for (let i = 1; i < lines.length; ++i) {
        lines[i] && this.push({key: this._counter++, value: JSON.parse(lines[i], this._reviver)});
      }
    }
    this._buffer = '';
    callback(null);
  }

  _flush(callback) {
    super._flush(error => {
      if (error) return callback(error);
      if (this._rest) {
        this.push({key: this._counter++, value: JSON.parse(this._rest, this._reviver)});
        this._rest = '';
      }
      callback(null);
    });
  }
}
JsonlParser.parser = JsonlParser.make;
JsonlParser.make.Constructor = JsonlParser;

module.exports = JsonlParser;
