#!/usr/bin/env mocha -R spec

"use strict";

/* jshint unused:false */

var assert = require("assert");
var runtime = require("../index").runtime;
var TITLE = __filename.replace(/^.*\//, "");

describe(TITLE, function() {
  runtime(function(G, I, S, U, V) {

    it("text", function() {
      var t = G("Hello, Promistache!");

      return t().then(function(result) {
        assert.equal(result, "Hello, Promistache!");
      });
    });

    it("text fragment", function() {
      var t = G(["Hello, ", null, undefined, "Promistache!"]);

      return t().then(function(result) {
        assert.equal(result, "Hello, Promistache!");
      });
    });

    it("variable", function() {
      var t = V("name");

      return t({"name": "Promistache"}).then(function(result) {
        assert.equal(result, "Promistache");
      });
    });

    it("text and variable", function() {
      var t = G(["Hello, ", V("name"), "!"]);

      return t({"name": "Promistache"}).then(function(result) {
        assert.equal(result, "Hello, Promistache!");

        return t().then(function(result) {
          assert.equal(result, "Hello, !");
        });
      });
    });

    it("section", function() {
      var t = G([S("foo", "FOO"), S("bar", "BAR")]);

      return t({"foo": true, "bar": false}).then(function(result) {
        assert.equal(result, "FOO");

        return t().then(function(result) {
          assert.equal(result, "");
        });
      });
    });

    it("inverted section", function() {
      var t = G([I("foo", "FOO"), I("bar", "BAR")]);

      return t({"foo": true, "bar": false}).then(function(result) {
        assert.equal(result, "BAR");

        return t().then(function(result) {
          assert.equal(result, "FOOBAR");
        });
      });
    });

    it("escape", function() {
      var t = G([V("amp"), "<&>", U("amp")]);

      return t({"amp": "<&>"}).then(function(result) {
        assert.equal(result, "&lt;&amp;&gt;<&><&>");
      });
    });

    it("deep variable", function() {
      var t = G(["[", V("aa.bb.cc"), "]"]);

      return t({aa: {bb: {cc: "DD"}}}).then(function(result) {
        assert.equal(result, "[DD]");

        return t({aa: {bb: {}}}).then(function(result) {
          assert.equal(result, "[]");

          return t({aa: {}}).then(function(result) {
            assert.equal(result, "[]");

            return t().then(function(result) {
              assert.equal(result, "[]");
            });
          });
        });
      });
    });

    it("lambda", function() {
      var t = G(V("aa.bb"));

      var context = {aa: {bb: bb}};
      var alt = {alt: 1};

      return t(context, alt).then(function(result) {
        assert.equal(result, "AABB");
      });

      function bb(ctx, second) {
        assert.ok(this, context.aa);
        assert.ok(ctx, context);
        assert.ok(second, alt);
        return "AABB";
      }
    });

    it("partial", function() {
      var t = G(["[", V("foo"), ":", U(">foo"), "]"]);
      var context = {foo: "context"};
      var alt = {foo: foo};

      return t(context, alt).then(function(result) {
        assert.equal(result, "[context:alt]");
      });

      function foo(ctx, second) {
        assert.equal(this, alt);
        assert.equal(ctx, context);
        assert.equal(second, alt);
        return "alt";
      }
    });

    it("section and partial", function() {
      var t = G(["[ ", S("foo", ["[", U(">baz"), "]"]), " ]"]);
      var bar = {};
      var context = {foo: [bar, bar], baz: "context"};
      var alt = {baz: baz};

      return t(context, alt).then(function(result) {
        assert.equal(result, "[ [alt][alt] ]");
      });

      function baz(ctx, second) {
        assert.equal(ctx, bar);
        assert.equal(second, alt);
        return "alt";
      }
    });
  });
});
