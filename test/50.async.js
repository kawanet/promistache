#!/usr/bin/env mocha -R spec

"use strict";

var assert = require("assert");
var compile = require("../lib/promistache").compile;
var TITLE = __filename.replace(/^.*\//, "");

describe(TITLE, function() {

  it("asynchronous function", function() {
    var step = 1;
    var render = compile("{{foo}}:{{bar}}:{{buz}}");
    var context = {foo: foo, bar: bar, buz: buz};

    assert.equal(++step, 2);
    return render(context).then(function(result) {
      assert.equal(++step, 9);
      assert.equal(result, "FOO:BAR:BUZ");
    });

    function foo() {
      assert.equal(++step, 3);
      return wait(150).then(function() {
        assert.equal(++step, 4);
        return "FOO";
      });
    }

    function bar() {
      assert.equal(++step, 5);
      return wait(100).then(function() {
        assert.equal(++step, 6);
        return "BAR";
      });
    }

    function buz() {
      assert.equal(++step, 7);
      return wait(50).then(function() {
        assert.equal(++step, 8);
        return "BUZ";
      });
    }
  });

  it("asynchronous section", function() {
    var step = 0;
    var render = compile("{{#foo}}[{{bar}}]{{/foo}}");
    var context = {foo: [{bar: bar1}, {bar: bar2}, {bar: bar3}]};

    assert.equal(++step, 1);
    return render(context).then(function(result) {
      assert.equal(++step, 8);
      assert.equal(result, "[bar1][bar2][bar3]");
    });

    function bar1() {
      assert.equal(++step, 2);
      return wait(50).then(function() {
        assert.equal(++step, 3);
        return "bar1";
      });
    }

    function bar2() {
      assert.equal(++step, 4);
      return wait(50).then(function() {
        assert.equal(++step, 5);
        return "bar2";
      });
    }

    function bar3() {
      assert.equal(++step, 6);
      return wait(50).then(function() {
        assert.equal(++step, 7);
        return "bar3";
      });
    }
  });

  function wait(msec) {
    return new Promise(function(resolve) {
      setTimeout(resolve, msec);
    });
  }
});
