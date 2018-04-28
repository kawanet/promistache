"use strict";

exports.runtimeSync = (function() {
  var ESCAPE_MAP = {
    "&": "&amp;",
    ">": "&gt;",
    "<": "&lt;",
    '"': "&quot;"
  };

  return runtimeSync;

  function runtimeSync(f) {
    return f(G, I, S, U, V);
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
   * @private
   */

  function digger(key, ignoreContext, ignoreAlt) {
    // {{.}}
    if (key === ".") return through;

    if (!ignoreContext && !ignoreAlt) {
      var first = key[0];

      // {{.current.context.only}}
      if (first === ".") return digger(key.substr(1), 0, 1);

      // {{>alt.context.only}}
      if (first === ">") return digger(key.substr(1), 1);
    }

    var keys = key.split(".");
    var last = keys.length;

    return function(context, alt) {
      var i, parent, val;

      if (!ignoreContext) {
        for (val = context, i = 0; val && i < last;) {
          parent = val;
          val = val[keys[i++]];
        }
      }

      if (!ignoreAlt && !val) {
        for (val = alt, i = 0; val && i < last;) {
          parent = val;
          val = val[keys[i++]];
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

})();
