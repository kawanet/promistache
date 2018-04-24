"use strict";

if (!Promistache) var Promistache = {};

(function(Promistache) {
  var ESCAPE_MAP = {
    "&": "&amp;",
    ">": "&gt;",
    "<": "&lt;",
    '"': "&quot;"
  };

  Promistache.runtime = runtime;

  function runtime(f) {
    return f(G, I, S, U, V);
  }

  /**
   * Group
   */

  function G(array) {
    if (!Array.isArray(array)) array = [array];

    return function(context) {
      var result = [];

      return array.reduce(function(p, item) {
        return p.then(function() {
          return ("function" === typeof item) ? item(context) : item;
        }).then(function(val) {
          result.push(val);
        });
      }, resolve()).then(function() {
          return result.join("");
        }
      );
    };
  }

  /**
   * Section
   */

  function S(key, then) {
    var value = U(key);
    var run = G(then);

    return function(context) {
      return value(context).then(function(cond) {
        if (Array.isArray(cond)) {
          return loop(cond);
        } else if (cond) {
          return run("object" === typeof cond ? cond : context);
        }
      });
    };

    function loop(array) {
      var result = [];
      return array.reduce(function(p, item) {
        return p.then(function() {
          return run(item);
        }).then(function(val) {
          result.push(val);
        });
      }, resolve()).then(function() {
          return result.join("");
        }
      );
    }
  }

  /**
   * Inverted Section
   */

  function I(key, then) {
    var value = U(key);
    var run = G(then);

    return function(context) {
      return value(context).then(function(cond) {
        if (!cond || (Array.isArray(cond) && !cond.length)) {
          return run(context);
        }
      });
    };
  }

  /**
   * Variable Escaped
   */

  function V(key) {
    var value = U(key);

    return function(context) {
      return value(context).then(esc);
    };
  }

  /**
   * Variable Unescaped
   */

  function U(key) {
    if (key === ".") return resolve;

    var keys = key.split(".");
    var last = keys.length;

    return function(context) {
      var val = context;
      var parent;

      for (var i = 0; i < last; i++) {
        if (!val) return resolve();
        parent = val;
        val = val[keys[i]];
      }

      if ("function" === typeof val) {
        return resolve().then(function() {
          return val.call(parent, context);
        });
      } else {
        return resolve(val);
      }
    };
  }

  /**
   * @private
   */

  function resolve(v) {
    return Promise.resolve(v);
  }

  function esc(str) {
    if ("string" !== typeof str) return str;
    return str.replace(/[<"&>]/g, function(chr) {
      return ESCAPE_MAP[chr];
    });
  }

})("undefined" !== typeof exports ? exports : Promistache);
