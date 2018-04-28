#!/usr/bin/env mocha -R spec

"use strict";

var assert = require("assert");
var compile = require("../index").compile.async;
var TITLE = __filename.replace(/^.*\//, "");

describe(TITLE, function() {

  it("text", function() {
    var t = compile("foo");

    return t().then(function(result) {
      assert.equal(result, "foo");
    });
  });

  it("special characters", function() {
    var t = compile("\x00\t\r\n\"\\\x7f");

    return t().then(function(result) {
      assert.equal(result, "\x00\t\r\n\"\\\x7f");
    });
  });

  it("variable", function() {
    var t = compile("foo:{{bar}}:{{baz}}:quz");

    return t({bar: "BAR"}).then(function(result) {
      assert.equal(result, "foo:BAR::quz");

      return t({baz: "BAZ"}).then(function(result) {
        assert.equal(result, "foo::BAZ:quz");
      });
    });
  });

  it("section", function() {
    var t = compile("foo:{{#bar}}:baz:{{/bar}}:quz");

    return t({bar: "BAR"}).then(function(result) {
      assert.equal(result, "foo::baz::quz");

      return t().then(function(result) {
        assert.equal(result, "foo::quz");

        return t({bar: [1, 2, 3]}).then(function(result) {
          assert.equal(result, "foo::baz::baz::baz::quz");
        });
      });
    });
  });

  it("section with variable", function() {
    var t = compile("foo:{{#bar}}:{{baz}}:{{/bar}}:quz");

    return t({bar: "BAR", baz: "BAZ"}).then(function(result) {
      assert.equal(result, "foo::BAZ::quz");

      return t({bar: [{baz: "BAZ1"}, {baz: "BAZ2"}, {baz: "BAZ3"}]}).then(function(result) {
        assert.equal(result, "foo::BAZ1::BAZ2::BAZ3::quz");
      });
    });
  });

  it("empty section", function() {
    var t = compile("foo:{{#bar}}{{/bar}}:quz");

    return t({bar: "BAR"}).then(function(result) {
      assert.equal(result, "foo::quz");

      return t().then(function(result) {
        assert.equal(result, "foo::quz");
      });
    });
  });

  it("inverted section", function() {
    var t = compile("foo:{{^bar}}:baz:{{/bar}}:quz");

    return t({bar: "BAR"}).then(function(result) {
      assert.equal(result, "foo::quz");

      return t().then(function(result) {
        assert.equal(result, "foo::baz::quz");
      });
    });
  });

  it("nested section", function() {
    var t = compile("foo{{#bar}}[{{#baz}}[quz]{{/baz}}]{{/bar}}qux");

    return t({bar: "BAR", baz: "BAZ"}).then(function(result) {
      assert.equal(result, "foo[[quz]]qux");

      return t({bar: [{baz: [1]}, {baz: [2, 3]}]}).then(function(result) {
        assert.equal(result, "foo[[quz]][[quz][quz]]qux");

        return t().then(function(result) {
          assert.equal(result, "fooqux");
        });
      });
    });
  });

  it("unescaped", function() {
    var t = compile("foo:{{&bar}}:{{bar}}:{{{bar}}}:baz");

    return t({bar: '<"&>'}).then(function(result) {
      assert.equal(result, 'foo:<"&>:&lt;&quot;&amp;&gt;:<"&>:baz');

      return t().then(function(result) {
        assert.equal(result, "foo::::baz");
      });
    });
  });

  it("deep variable", function() {
    var t = compile("[{{foo.bar.baz}}]");

    return t({foo: {bar: {baz: "BAZ"}}}).then(function(result) {
      assert.equal(result, "[BAZ]");

      return t().then(function(result) {
        assert.equal(result, "[]");
      });
    });
  });

  it("deep variable section", function() {
    var t = compile("[{{#foo.bar.baz}}quz{{/foo.bar.baz}}]");

    return t({foo: {bar: {baz: "BAZ"}}}).then(function(result) {
      assert.equal(result, "[quz]");

      return t({foo: {bar: {baz: false}}}).then(function(result) {
        assert.equal(result, "[]");

        return t().then(function(result) {
          assert.equal(result, "[]");
        });
      });
    });
  });
});