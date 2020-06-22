#!/usr/bin/env mocha -R spec

"use strict";

var assert = require("assert");
var compile = require("../index").compile;
var TITLE = __filename.replace(/^.*\//, "");

describe(TITLE, function() {

  it("text", function() {
    var t = compile("foo");

    assert.equal(t(), "foo");
  });

  it("special characters", function() {
    var t = compile("\x00\t\r\n\"\\\x7f");

    assert.equal(t(), "\x00\t\r\n\"\\\x7f");
  });

  it("variable", function() {
    var t = compile("foo:{{bar}}:{{baz}}:quz");

    assert.equal(t({bar: "BAR"}), "foo:BAR::quz");
    assert.equal(t({baz: "BAZ"}), "foo::BAZ:quz");
  });

  it("section", function() {
    var t = compile("foo:{{#bar}}:baz:{{/bar}}:quz");

    assert.equal(t({bar: "BAR"}), "foo::baz::quz");
    assert.equal(t(), "foo::quz");
    assert.equal(t({bar: [1, 2, 3]}), "foo::baz::baz::baz::quz");
  });

  it("section with variable", function() {
    var t = compile("foo:{{#bar}}:{{baz}}:{{/bar}}:quz");

    assert.equal(t({bar: "BAR", baz: "BAZ"}), "foo::BAZ::quz");
    assert.equal(t({bar: [{baz: "BAZ1"}, {baz: "BAZ2"}, {baz: "BAZ3"}]}), "foo::BAZ1::BAZ2::BAZ3::quz");
  });

  it("empty section", function() {
    var t = compile("foo:{{#bar}}{{/bar}}:quz");

    assert.equal(t({bar: "BAR"}), "foo::quz");
    assert.equal(t(), "foo::quz");
  });

  it("inverted section", function() {
    var t = compile("foo:{{^bar}}:baz:{{/bar}}:quz");

    assert.equal(t({bar: "BAR"}), "foo::quz");
    assert.equal(t(), "foo::baz::quz");
  });

  it("nested section", function() {
    var t = compile("foo{{#bar}}[{{#baz}}[quz]{{/baz}}]{{/bar}}qux");

    assert.equal(t({bar: "BAR", baz: "BAZ"}), "foo[[quz]]qux");
    assert.equal(t({bar: [{baz: [1]}, {baz: [2, 3]}]}), "foo[[quz]][[quz][quz]]qux");
    assert.equal(t(), "fooqux");
  });

  it("unescaped", function() {
    var t = compile("foo:{{&bar}}:{{bar}}:{{{bar}}}:baz");

    assert.equal(t({bar: '<"&>'}), 'foo:<"&>:&lt;&quot;&amp;&gt;:<"&>:baz');
    assert.equal(t(), "foo::::baz");
  });

  it("deep variable", function() {
    var t = compile("[{{foo.bar.baz}}]");

    assert.equal(t({foo: {bar: {baz: "BAZ"}}}), "[BAZ]");
    assert.equal(t(), "[]");
  });

  it("deep variable section", function() {
    var t = compile("[{{#foo.bar.baz}}quz{{/foo.bar.baz}}]");

    assert.equal(t({foo: {bar: {baz: "BAZ"}}}), "[quz]");
    assert.equal(t({foo: {bar: {baz: false}}}), "[]");
    assert.equal(t(), "[]");
  });

  it("white space", function() {
    var t = compile("[{{# foo }}{{ bar }}{{/ foo }}]");

    assert.equal(t({foo: "FOO", bar: "BAR"}), "[BAR]");
    assert.equal(t(), "[]");
  });

  it("comment", function() {
    var t = compile("[{{! foo }}][{{! foo \n bar }}][{{! bar }}]");

    assert.equal(t(), "[][][]");
  });

  it("falsy values", function() {
    var t = compile("[{{ zero }}][{{ null }}][{{ undef }}][{{ false }}]");
    var c = {"zero": 0, "null": null, "false": false};

    assert.equal(t(c), "[0][][][false]");
  });
});