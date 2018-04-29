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
    return function(context, alt) {
      if (Array.isArray(array)) {
        return array.map(each).join("");
      } else {
        return each(array);
      }

      function each(item) {
        return ("function" !== typeof item) ? item : item(context, alt);
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
      var cond = dig(context, alt);
      if (Array.isArray(cond)) {
        return cond.map(each).join("");
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
    var dig = U(key);
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
    var dig = U(key);

    return function(context, alt) {
      return esc(dig(context, alt));
    };
  }

  /**
   * Variable Unescaped
   */

  function U(key) {
    // {{.}}
    if (key === ".") return through;

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
        return val.call(parent, context, alt);
      } else if (val) {
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

  function esc(str) {
    if ("string" !== typeof str) return str;
    return str.replace(/[<"&>]/g, function(chr) {
      return ESCAPE_MAP[chr];
    });
  }

})();
