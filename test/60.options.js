#!/usr/bin/env mocha -R spec

"use strict";

var fs = require("fs");
var assert = require("assert");
var compile = require("../lib/promistache").compileSync;
var TITLE = __filename.replace(/^.*\//, "");

describe(TITLE, function() {
  var sample1 = fs.readFileSync(__dirname + "/sample/sample1.html");
  var sample2 = fs.readFileSync(__dirname + "/sample/sample2.html");

  var context1 = {list: [{name: "foo"}, {name: "bar"}]};
  var context2 = {list: {name: "foo"}};
  var context3 = {list: true, name: "foo"};

  var expect1 = '<ul>\n  <li>foo</li>\n  <li>bar</li>\n</ul>';
  var expect2 = '<ul>\n  <li>foo</li>\n</ul>';
  var expect3 = '<ul>\n</ul>';

  it("{{ tag }}", function() {
    var render = compile(sample1);
    assert.equal(render(context1), expect1);
    assert.equal(render(context2), expect2);
    assert.equal(render(context3), expect2);
    assert.equal(render(), expect3);
  });

  it('<% tag %>', function() {
    var render = compile(sample2, {tag: "<% %>"});
    assert.equal(render(context1), expect1);
    assert.equal(render(context2), expect2);
    assert.equal(render(context3), expect2);
    assert.equal(render(), expect3);
  });

  it("{{= <% %> =}} <% tag %>", function() {
    var render = compile("{{= <% %> =}}" + sample2);
    assert.equal(render(context1), expect1);
    assert.equal(render(context2), expect2);
    assert.equal(render(context3), expect2);
    assert.equal(render(), expect3);
  });

  it("{{ tag }} {{= <% %> =}} <% tag %>", function() {
    var render = compile(sample1 + "{{= <% %> =}}" + sample2);
    assert.equal(render(context1), expect1 + expect1);
    assert.equal(render(context2), expect2 + expect2);
    assert.equal(render(context3), expect2 + expect2);
    assert.equal(render(), expect3 + expect3);
  });

  it("<% tag %> {{= <% %> =}} {{ tag }}", function() {
    var render = compile(sample2 + "{{= <% %> =}}" + sample1);
    assert.equal(render(context1), sample2 + sample1);
    assert.equal(render(context2), sample2 + sample1);
    assert.equal(render(context3), sample2 + sample1);
    assert.equal(render(), sample2 + sample1);
  });
});
