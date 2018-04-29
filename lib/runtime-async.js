"use strict";

exports.runtime = (function() {
  var ESCAPE_MAP = {
    "&": "&amp;",
    ">": "&gt;",
    "<": "&lt;",
    '"': "&quot;"
  };

  return function(f) {
    return f(G, I, S, U, V);
  };

  /**
   * Group
   */

  function G(array) {
    if (!Array.isArray(array)) array = [array];

    return function(context, alt) {
      return series(array, inner, alt);

      function inner(item, alt) {
        return ("function" === typeof item) ? item(context, alt) : item;
      }
    };
  }

  /**
   * Section
   */

  function S(key, section) {
    var dig = U(key);
    var inner = G(section);

    return function(context, alt) {
      return dig(context, alt).then(function(cond) {
        if (Array.isArray(cond)) {
          return series(cond, inner, alt);
        } else if (cond) {
          // switch context only when an object given
          return inner(("object" === typeof cond ? cond : context), alt);
        }
      });
    };
  }

  /**
   * Inverted Section
   */

  function I(key, section) {
    var dig = U(key);
    var inner = G(section);

    return function(context, alt) {
      return dig(context, alt).then(function(cond) {
        if (!cond || (Array.isArray(cond) && !cond.length)) {
          return inner(context, alt);
        }
      });
    };
  }

  /**
   * Variable Escaped
   */

  function V(key) {
    var dig = U(key);

    return function(context, alt) {
      return dig(context, alt).then(esc);
    };
  }

  /**
   * Variable Unescaped
   */

  function U(key) {
    // {{.}}
    if (key === ".") return resolve;

    var first = key[0];

    // {{.current.context.only}}
    var seeContext = (first === ".");

    // {{>alt.context.only}}
    var seeAlt = (first === ">");

    if (seeContext || seeAlt) {
      key = key.substr(1);
    } else {
      seeContext = seeAlt = true;
    }

    var keys = key.split(".");
    var last = keys.length;

    return function(context, alt) {
      var i, parent, val;

      if (seeContext) {
        for (val = context, i = 0; val && i < last;) {
          parent = val;
          val = val[keys[i++]];
        }
      }

      if (seeAlt && !val) {
        for (val = alt, i = 0; val && i < last;) {
          parent = val;
          val = val[keys[i++]];
        }
      }

      if ("function" === typeof val) {
        return resolve().then(function() {
          return val.call(parent, context, alt);
        });
      } else {
        return resolve(val);
      }
    };
  }

  /**
   * @private
   */

  function series(items, each, alt) {
    var result = [];
    return items.reduce(function(p, item) {
      return p.then(function() {
        return each(item, alt);
      }).then(function(val) {
        result.push(val);
      });
    }, resolve()).then(function() {
      return result.join("");
    });
  }

  function resolve(v) {
    return Promise.resolve(v);
  }

  function esc(str) {
    if ("string" !== typeof str) return str;
    return str.replace(/[<"&>]/g, function(chr) {
      return ESCAPE_MAP[chr];
    });
  }

})();
