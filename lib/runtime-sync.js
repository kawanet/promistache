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
    return f(G, I, P, S, U, V);
  }

  /**
   * Group
   */

  function G(array) {
    return function(context, alt) {
      if (Array.isArray(array)) {
        return join(array.map(map));
      } else {
        return map(array);
      }

      function map(item) {
        return ("function" !== typeof item) ? item : item(context, alt);
      }
    };
  }

  /**
   * Section
   */

  function S(key, section) {
    var dig = digger(key);
    var inner = G(section);

    return function(context, alt) {
      var cond = dig(context, alt);
      if (Array.isArray(cond)) {
        return join(cond.map(each));
      } else if (cond) {
        // switch context only when an object given
        return inner(("object" === typeof cond ? cond : context), alt);
      }

      function each(item) {
        return inner(item, alt);
      }
    };
  }

  /**
   * Inverted Section
   */

  function I(key, section) {
    var dig = digger(key);
    var inner = G(section);

    return function(context, alt) {
      var cond = dig(context, alt);
      if (!cond || (Array.isArray(cond) && !cond.length)) {
        return inner(context, alt);
      }
    };
  }

  /**
   * Variable Escaped
   */

  function V(key) {
    var dig = digger(key);

    return function(context, alt) {
      return esc(dig(context, alt));
    };
  }

  /**
   * Variable Unescaped
   */

  function U(key) {
    return digger(key);
  }

  /**
   * Partials
   */

  function P(key) {
    return digger(key, 1);
  }

  /**
   * @private
   */

  function digger(key, isPartial) {
    if (key === ".") return through;

    var keys = key.split(".");
    var last = keys.length;

    return function(context, alt) {
      var val = !isPartial && context;
      var parent;
      var i;

      for (i = 0; val && i < last; i++) {
        parent = val;
        val = val[keys[i]];
      }

      // alternative look-up
      if (!val) {
        val = alt;
        for (i = 0; val && i < last; i++) {
          parent = val;
          val = val[keys[i]];
        }
      }

      if ("function" === typeof val) {
        return val.call(parent, context, alt);
      } else if (val) {
        return val;
      }
    };
  }

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
