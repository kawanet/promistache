#!/usr/bin/env node

"use strict";

var fs = require("fs");
var argv = require("process.argv")(process.argv.slice(2));

var Promistache = require("../index");

var CONF = {variable: "templates"};

var SRC = {
  header: 'if (!!![[variable]]) var [[variable]] = {};\n',
  runtime: '\n!function(r,t){' +
  '!function(exports){[[>loadRuntime]]}(r);' +
  'Object.keys(t).forEach(function(k){var o=t[k];t[k]=function(c,a){return(t[k]=r.runtime(o))(c,a)}})' +
  '}({},[[variable]]);\n',
  line: '[[variable]]["[[namespace]][[name]]"] = function(G,I,S,U,V){return [[&code]]};\n',
  footer: ''
};

CLI(argv(CONF));

function CLI(context) {
  var options = {tag: "[[ ]]"};
  var renders = {};

  Object.keys(SRC).forEach(function(key) {
    renders[key] = Promistache.compile(SRC[key], options);
  });

  context.package = require("../package.json");

  var args = context["--"];
  var count = args && args.length;

  if (!count || context.help) {
    var templates = require("./files/templates");
    process.stderr.write(templates.help(context, renders));
    process.exit(1);
  }

  var result = [];
  result.push(renders.header(context));

  args.forEach(function(file) {
    var source = fs.readFileSync(file, "utf-8");

    context.name = file.split("/").pop().split(".").shift();
    context.code = Promistache.parse(source, context);

    result.push(renders.line(context));
  });

  var runtime = context.runtime;
  if (runtime) {
    var file = __dirname + "/files/runtime-" + runtime + ".min.js";
    renders.loadRuntime = lazyLoader(file);
    result.push(renders.runtime(context, renders));
  }

  result.push(renders.footer(context));

  var text = result.join("");

  if (context.output) {
    fs.writeFileSync(context.output, text);
  } else {
    process.stdout.write(text);
  }

  function lazyLoader(file) {
    return function() {
      return fs.readFileSync(file, "utf-8");
    };
  }
}
