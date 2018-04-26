"use strict";

var Promistache = exports;

Promistache.build = build;
Promistache.compile = compile;
Promistache.compileSync = compileSync;
Promistache.parse = require("./lib/parse").parse;
Promistache.runtime = require("./lib/runtime").runtime;
Promistache.runtimeSync = require("./lib/runtime-sync").runtimeSync;

function build(source, options) {
  /*jshint -W061 */
  return Function("G", "I", "P", "S", "U", "V", "return " + Promistache.parse(source, options));
}

function compile(source, options) {
  return Promistache.runtime(build(source, options));
}

function compileSync(source, options) {
  return Promistache.runtimeSync(build(source, options));
}
