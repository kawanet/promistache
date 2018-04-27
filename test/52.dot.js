#!/usr/bin/env mocha -R spec

"use strict";

var assert = require("assert");
var Promistache = require("../index");
var TITLE = __filename.replace(/^.*\//, "");

describe(TITLE, function() {
  describe("compileSync", function() {
    runTest(Promistache.compileSync);
  });

  describe("compile", function() {
    runTest(Promistache.compile);
  });
});

function runTest(compile) {
  var context = {
    foo: {foo: "FOO", bar: ["B", "A", "R"], buz: "BUZ"},
    qux: "QUX",
    "": {bar: "bar"}
  };

  var alt = {
    foo: {foo: "111", bar: "222", buz: "333", qux: "444"},
    bar: "555",
    buz: "666",
    qux: "777",
    "": {bar: "888"}
  };

  testAsync("{{#foo}}[{{buz}}]{{/foo}}", "[BUZ]"); // look both
  testAsync("{{#foo}}[{{.buz}}]{{/foo}}", "[BUZ]"); // look local context only
  testAsync("{{#foo}}[{{>buz}}]{{/foo}}", "[666]"); // look alt only

  testAsync("{{#foo}}[{{foo.buz}}]{{/foo}}", "[333]");

  testAsync("{{#foo}}[{{qux}}]{{/foo}}", "[777]");
  testAsync("{{#foo}}[{{.qux}}]{{/foo}}", "[]");
  testAsync("{{#foo}}[{{>qux}}]{{/foo}}", "[777]");

  testAsync("{{#foo}}[{{foo.foo}}]{{/foo}}", "[111]");
  testAsync("{{#foo}}[{{.foo}}]{{/foo}}", "[FOO]");
  testAsync("{{#foo}}[{{>foo.foo}}]{{/foo}}", "[111]");

  testAsync("{{#foo}}[{{#.}}[{{buz}}]{{/.}}]{{/foo}}", "[[BUZ]]");
  testAsync("{{#foo}}[{{#.}}[{{qux}}]{{/.}}]{{/foo}}", "[[777]]");

  testAsync("{{#foo.bar}}[{{.}}]{{/foo.bar}}", "[B][A][R]");
  testAsync("{{#foo}}[{{#bar}}[{{.}}]{{/bar}}]{{/foo}}", "[[B][A][R]]");
  testAsync("{{#foo}}[{{#qux}}[{{foo}}]{{/qux}}]{{/foo}}", "[[FOO]]");

  function testAsync(template, expected) {
    it(template, function() {
      return Promise.resolve().then(function() {
        var t = compile(template);
        return t(context, alt);
      }).then(function(result) {
        assert.equal(result, expected);
      });
    });
  }
}
