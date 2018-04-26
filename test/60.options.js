#!/usr/bin/env mocha -R spec

"use strict";

var fs = require("fs");
var assert = require("assert");
var compile = require("../lib/promistache").compileSync;
var TITLE = __filename.replace(/^.*\//, "");

describe(TITLE, function() {
  var sample1 = fs.readFileSync(__dirname + "/sample/sample1.html");
  var sample2 = fs.readFileSync(__dirname + "/sample/sample2.html");

  it("trim", function() {
    var render = compile(sample1, {trim: true});
    assert.equal(render({list: [{name: "foo"}, {name: "bar"}]}), '<ul>\n  <li>foo</li>\n  <li>bar</li>\n</ul>');
    assert.equal(render({list: {name: "foo"}}), '<ul>\n  <li>foo</li>\n</ul>');
    assert.equal(render({list: true, name: "foo"}), '<ul>\n  <li>foo</li>\n</ul>');
    assert.equal(render(), '<ul>\n</ul>');
  });

  it("tag", function() {
    var render = compile(sample2, {tag: "<% %>", trim: true});
    assert.equal(render({list: [{name: "foo"}, {name: "bar"}]}), '<ul>\n  <li>foo</li>\n  <li>bar</li>\n</ul>');
    assert.equal(render({list: {name: "foo"}}), '<ul>\n  <li>foo</li>\n</ul>');
    assert.equal(render({list: true, name: "foo"}), '<ul>\n  <li>foo</li>\n</ul>');
    assert.equal(render(), '<ul>\n</ul>');
  });
});
