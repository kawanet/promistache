#!/usr/bin/env mocha -R spec

"use strict";

/* jshint unused:false */

var assert = require("assert");
var runtime = require("../lib/promistache").runtimeSync;
var TITLE = __filename.replace(/^.*\//, "");

describe(TITLE, function() {
  runtime(function(G, I, P, S, U, V) {

    it("text", function() {
      var t = G("Hello, Promistache!");

      assert.equal(t(), "Hello, Promistache!");
    });

    it("text fragment", function() {
      var t = G(["Hello, ", null, undefined, "Promistache!"]);

      assert.equal(t(), "Hello, Promistache!");
    });

    it("variable", function() {
      var t = V("name");

      assert.equal(t({"name": "Promistache"}), "Promistache");
    });

    it("text and variable", function() {
      var t = G(["Hello, ", V("name"), "!"]);

      assert.equal(t({"name": "Promistache"}), "Hello, Promistache!");
      assert.equal(t(), "Hello, !");
    });

    it("section", function() {
      var t = G([S("foo", "FOO"), S("bar", "BAR")]);

      assert.equal(t({"foo": true, "bar": false}), "FOO");
      assert.equal(t(), "");
    });

    it("inverted section", function() {
      var t = G([I("foo", "FOO"), I("bar", "BAR")]);

      assert.equal(t({"foo": true, "bar": false}), "BAR");
      assert.equal(t(), "FOOBAR");
    });

    it("escape", function() {
      var t = G([V("amp"), "<&>", U("amp")]);

      assert.equal(t({"amp": "<&>"}), "&lt;&amp;&gt;<&><&>");
      assert.equal(t(), "<&>");
    });

    it("deep variable", function() {
      var t = G(["[", V("aa.bb.cc"), "]"]);

      assert.equal(t({aa: {bb: {cc: "DD"}}}), "[DD]");
      assert.equal(t({aa: {bb: {}}}), "[]");
      assert.equal(t({aa: {}}), "[]");
      assert.equal(t(), "[]");
    });

    it("lambda", function() {
      var t = G(V("aa.bb"));

      var context = {aa: {bb: bb}};
      var alt = {alt: 1};

      assert.equal(t(context, alt), "AABB");

      function bb(ctx, second) {
        assert.ok(this, context.aa);
        assert.ok(ctx, context);
        assert.ok(second, alt);
        return "AABB";
      }
    });

    it("partial", function() {
      var t = G(["[", V("foo"), ":", P("foo"), "]"]);
      var context = {foo: "context"};
      var alt = {foo: foo};

      assert.equal(t(context, alt), "[context:alt]");

      function foo(ctx, second) {
        assert.equal(this, alt);
        assert.equal(ctx, context);
        assert.equal(second, alt);
        return "alt";
      }
    });

    it("section and partial", function() {
      var t = G(["[ ", S("foo", ["[", P("baz"), "]"]), " ]"]);
      var bar = {};
      var context = {foo: [bar, bar], baz: "context"};
      var alt = {baz: baz};

      assert.equal(t(context, alt), "[ [alt][alt] ]");

      function baz(ctx, second) {
        assert.equal(ctx, bar);
        assert.equal(second, alt);
        return "alt";
      }
    });
  });
});
