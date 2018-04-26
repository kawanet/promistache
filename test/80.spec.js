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
  "Delimiters set in a parent template should not affect a partial.": 1,
  "Delimiters set in a partial should not affect the parent template.": 1,
  "Delimiters set outside inverted sections should persist.": 1,
  "Delimiters set outside sections should persist.": 1,
  "Each line of the partial should be indented before rendering.": 1,
  "Indented standalone lines should be removed from the template.": 1,
  "Standalone interpolation should not alter surrounding whitespace.": 1,
  "Standalone tags should not require a newline to follow them.": 1,
  "Standalone tags should not require a newline to precede them.": 1,
  '"\\r\\n" should be considered a newline for standalone tags.': 1
};

describe(TITLE, function() {
  var SPECS_DIR = __dirname + "/spec/specs";

  var options = {trim: true};

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
            t = compile(template, options);
          } catch (e) {
            console.warn(template);
            return assert.fail(e);
          }

          var partial = {};
          if (partials) {
            Object.keys(partials).forEach(function(name) {
              partial[name] = compile(partials[name], options);
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
