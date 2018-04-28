"use strict";

var parse = exports.parse = require("./lib/parse").parse;

var runtimeAsync = require("./lib/runtime-async").runtime;
var runtimeSync = require("./lib/runtime-sync").runtime;

var compileAsync = compile.async = wrap(runtimeAsync);
var compileSync = compile.sync = wrap(runtimeSync);

exports.compile = compile;

function compile(source, options) {
  return (options && options.async ? compileAsync : compileSync)(source, options);
}

/**
 * @private
 */

function wrap(runtime) {
  return function(source, options) {

    if ("function" !== typeof source) {
      /*jshint -W061 */
      source = Function("G", "I", "S", "U", "V", "return " + parse(source, options));
    }

    return runtime(source);
  };
}
