"use strict";

var parse = exports.parse = require("./lib/parse").parse;

var runtimeAsync = require("./lib/runtime-async").runtime;
var runtimeSync = require("./lib/runtime-sync").runtime;

exports.compileAsync = compileAsync;
exports.compile = compile;

function compileAsync(source, options) {
  return runtimeAsync(prepare(source, options));
}

function compile(source, options) {
  return runtimeSync(prepare(source, options));
}

/**
 * @private
 */

function prepare(source, options) {
  /* jshint -W061 */

  if ("function" !== typeof source) {
    var js = parse(source, options);
    source = Function("G", "I", "S", "U", "V", "return " + js);
  }

  return source;
}
