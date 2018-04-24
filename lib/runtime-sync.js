"use strict";

if (!Promistache) var Promistache = {};

(function(Promistache) {
  var ESCAPE_MAP = {
    "&": "&amp;",
    ">": "&gt;",
    "<": "&lt;",
    '"': "&quot;"
  };

  Promistache.runtimeSync = runtimeSync;

  function runtimeSync(f) {
    return f(G, I, S, U, V);
  }

  /**
   * Group
   */

  function G(array) {
    return function(context) {
      if (Array.isArray(array)) {
        return join(array.map(map));
      } else {
        return map(array);
      }

      function map(item) {
        return ("function" !== typeof item) ? item : item(context);
      }
    };
  }

  /**
   * Section
   */

  function S(key, then) {
    var value = U(key);
    var run = G(then);

    return function(context) {
      var cond = value(context);
      if (Array.isArray(cond)) {
        return join(cond.map(run));
      } else if (cond) {
        return run("object" === typeof cond ? cond : context);
      }
    };
  }

  /**
   * Inverted Section
   */

  function I(key, then) {
    var value = U(key);
    var run = G(then);

    return function(context) {
      var cond = value(context);
      if (!cond || (Array.isArray(cond) && !cond.length)) {
        return run(context);
      }
    };
  }

  /**
   * Variable Escaped
   */

  function V(key) {
    var value = U(key);

    return function(context) {
      var v = value(context);
      return esc(v);
    };
  }

  /**
   * Variable Unescaped
   */

  function U(key) {
    if (key === ".") return through;

    var keys = key.split(".");
    var last = keys.length;

    return function value(context) {
      var val = context;
      var parent;

      for (var i = 0; i < last; i++) {
        if (!val) return;
        parent = val;
        val = val[keys[i]];
      }

      if ("function" === typeof val) {
        return val.call(parent, context);
      } else {
        return val;
      }
    };
  }

  /**
   * @private
   */

  function through(v) {
    return v;
  }

  function join(array) {
    return array.join("");
  }

  function esc(str) {
    if ("string" !== typeof str) return str;
    return str.replace(/[<"&>]/g, function(chr) {
      return ESCAPE_MAP[chr];
    });
  }

})("undefined" !== typeof exports ? exports : Promistache);
