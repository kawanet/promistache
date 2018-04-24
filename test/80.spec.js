#!/usr/bin/env mocha -R spec

"use strict";

/*jshint -W061 */

var assert = require("assert");
var fs = require("fs");
var Promistache = require("../lib/promistache");
var TITLE = __filename.replace(/^.*\//, "");

var SKIP_NAME = {
  // this is an evil spec
  "Deeply Nested Contexts": 1,
  // this needs standalone line support
  "Doubled": 1,
  // this needs parser in runtime
  "Interpolation - Expansion": 1
};

describe(TITLE, function() {
  var SPECS_DIR = __dirname + "/spec/specs";

  var files = fs.readdirSync(SPECS_DIR).filter(function(f) {
    return f.indexOf(".json") > 0;
  });

  if (!files.length) {
    return it.skip("npm run fetch-spec");
  }

  files.forEach(function(file) {
    describe(file, function() {
      var path = SPECS_DIR + "/" + file;
      var json = fs.readFileSync(path);
      var test = JSON.parse(json);

      test.tests.forEach(function(test) {
        var name = test.name;
        var desc = test.desc;
        var context = test.data;
        var partials = test.partials;
        var template = test.template;
        var lambda = context.lambda && context.lambda.js;

        if (SKIP_NAME[name] ||
          // standalone line not supported
          name.indexOf("Standalone") > -1 ||
          // delimiter change not supported
          template.indexOf("{{=") > -1 ||
          // partial not supported
          template.indexOf("{{>") > -1 ||
          // this needs parser in runtime
          (lambda && lambda.indexOf("function(txt)") > -1)) {

          return it.skip(name + ": " + desc);
        }

        it(name, function() {
          var p, b, t;
          try {
            p = Promistache.parse(template);
            b = Function("G", "I", "S", "U", "V", "return " + p);
            t = Promistache.runtimeSync(b);
          } catch (e) {
            if (p) console.warn(p);
            return assert.fail(e);
          }

          var partial = {};
          if (partials) {
            Object.keys(partials).forEach(function(name) {
              partial[name] = Promistache.compile(partials[name]);
            });
          }

          if (lambda) {
            context.lambda = (Function("return " + lambda)());
          }

          var result = t(context, partial);
          assert.equal(result, test.expected, desc);
        });
      });
    });
  });
});
