"use strict";

exports.runtime = (function() {
  var isArray = Array.isArray;

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

  function G(items) {
    return GG;

    function GG(context, alt, write) {
      if (!write) return writable(GG, context, alt);

      series(items, context, alt, write);
    }
  }

  /**
   * Section
   */

  function S(key, items) {
    var dig = U(key);
    return SS;

    function SS(context, alt, write) {
      if (!write) return writable(SS, context, alt);

      var cond = dig(context, alt);

      if (isArray(cond)) {
        cond.forEach(it);
      } else if (cond) {
        // switch context only when an object given
        it("object" === typeof cond ? cond : context);
      }

      function it(ctx) {
        series(items, ctx, alt, write);
      }
    }
  }

  /**
   * Inverted Section
   */

  function I(key, items) {
    var dig = U(key);
    return II;

    function II(context, alt, write) {
      if (!write) return writable(II, context, alt);

      var cond = dig(context, alt);

      if (!cond || (isArray(cond) && !cond.length)) {
        series(items, context, alt, write);
      }
    }
  }

  /**
   * Variable Escaped
   */

  function V(key) {
    var dig = U(key);
    return VV;

    function VV(context, alt) {
      return esc(dig(context, alt));
    }
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

  function writable(func, context, alt) {
    var result;
    func(context, alt, write);
    return result ? result.join("") : "";

    function write(v) {
      if (v != null) {
        if (!result) result = [];
        result.push(v);
      }
    }
  }

  function series(item, context, alt, write) {
    forEach(item, it);

    function it(item) {
      if ("function" === typeof item) {
        item = item(context, alt);
        forEach(item, it);
      } else {
        write(item);
      }
    }
  }

  function forEach(items, it) {
    if (isArray(items)) {
      items.forEach(it);
    } else {
      it(items);
    }
  }

  function through(v) {
    return v;
  }

  function esc(str) {
    if (str == null) return;
    if ("string" !== typeof str) str += "";
    if (str.search(/["&>]/) < 0) return str;
    return str.replace(/[<"&>]/g, function(chr) {
      return ESCAPE_MAP[chr];
    });
  }

})();
