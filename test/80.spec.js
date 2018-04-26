#!/usr/bin/env mocha -R spec

"use strict";

/*jshint -W061 */

var assert = require("assert");
var fs = require("fs");
var compile = require("../lib/promistache").compileSync;
var TITLE = __filename.replace(/^.*\//, "");

var SKIP_NAME = {
  //
};

var SKIP_DESC = {
  "A lambda's return value should be parsed.": 1, // evil
  "A lambda's return value should parse with the default delimiters.": 1,
  "All elements on the context stack should be accessible.": 1, // evil
  "Each line of the partial should be indented before rendering.": 1,
  "Standalone tags should not require a newline to follow them.": 1,
  "Standalone tags should not require a newline to precede them.": 1
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

        if (SKIP_NAME[name] || SKIP_DESC[desc] ||
          // delimiter change not supported
          //template.indexOf("{{=") > -1 ||
          // this needs parser in runtime
          (lambda && lambda.indexOf("function(txt)") > -1)) {

          return it.skip(name + ": " + desc);
        }

        it(name, function() {
          var t;
          try {
            t = compile(template);
          } catch (e) {
            console.warn(template);
            return assert.fail(e);
          }

          var partial = {};
          if (partials) {
            Object.keys(partials).forEach(function(name) {
              partial[name] = compile(partials[name]);
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
