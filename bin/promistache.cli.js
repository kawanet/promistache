#!/usr/bin/env node

"use strict";

var fs = require("fs");
var argv = require("process.argv")(process.argv.slice(2));

var Promistache = require("../lib/promistache");

var CONF = {variable: "templates"};
var USAGE = 'USAGE:\t{{cmd}} --variable="templates" --namespace="" --output="templates.js" FILES\n';
var PREFIX = 'if (!!!{{variable}}) var {{variable}} = {};\n';
var LINE = '{{variable}}["{{namespace}}{{name}}"] = function(G,I,P,S,U,V){return {{{code}}};\n';
var SUFFIX = '';

CLI(argv(CONF));

function compile(source) {
  return Promistache.runtimeSync(Promistache.build(source));
}

function CLI(context) {
  var usageRender = compile(USAGE);
  var prefixRender = compile(PREFIX);
  var lineRender = compile(LINE);
  var suffixRender = compile(SUFFIX);

  var files = context["--"];
  var count = files && files.length;

  if (!count || context.help) {
    context.cmd = process.argv[1].split("/").pop();
    process.stderr.write(usageRender(context));
    process.exit(1);
  }

  var result = [];
  result.push(prefixRender(context));

  files.forEach(function(file) {
    var source = fs.readFileSync(file, "utf-8");

    context.name = file.split("/").pop().split(".").shift();
    context.code = Promistache.parse(source);
    result.push(lineRender(context));
  });

  result.push(suffixRender(context));

  var text = result.join("");

  if (context.output) {
    fs.writeFileSync(context.output, text);
  } else {
    process.stdout.write(text);
  }
}
