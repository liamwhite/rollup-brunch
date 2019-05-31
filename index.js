'use strict';
const rollup = require('rollup');
const buble = require('rollup-plugin-buble');
const virtual = require('rollup-plugin-virtual');
const includePaths = require('rollup-plugin-includepaths');
const multiEntry = require('rollup-plugin-multi-entry');

class RollupCompiler {
  constructor(config) {
    if (config == null) config = {};
    const pluginConfig = config.plugins && config.plugins.rollup || {};
    this.plugins = [
      multiEntry(pluginConfig.multiEntry || config.multiEntry || {}),
      includePaths(pluginConfig.includePaths || config.includePaths || {}),
      buble(pluginConfig.buble || config.buble || {})
    ];
    this.map = !!config.sourceMaps;
  }

  compile(params) {
    const path = params.path;
    const data = params.data;
    const plugins = this.plugins.slice();

    plugins.push(virtual({
      [path]: data
    }));

    return rollup.rollup({
      input: path,
      plugins: plugins
    })
    .then(bundle => bundle.generate({
      format: 'iife',
      sourcemap: this.map
    }))
    .then(({ output }) => {
      const compiled = output[0];
      let code;

      if (this.map === 'linked') {
        code = compiled.code.replace('//# sourceMappingURL=undefined.map\n', '');
      } else {
        code = compiled.code;
      }

      return {
        data: code,
        map: compiled.map ? compiled.map.toString() : null
      };
    });
  }
}

RollupCompiler.prototype.brunchPlugin = true;
RollupCompiler.prototype.type = 'javascript';
RollupCompiler.prototype.extension = 'js';

module.exports = RollupCompiler;
