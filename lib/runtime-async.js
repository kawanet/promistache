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

      return series(items, context, alt, write);
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

      return dig(context, alt).then(function(cond) {
        if (isArray(cond)) {
          return forEach(cond, it);
        } else if (cond) {
          // switch context only when an object given
          return it("object" === typeof cond ? cond : context);
        }

        function it(ctx) {
          return series(items, ctx, alt, write);
        }
      });
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

      return dig(context, alt).then(function(cond) {
        if (!cond || (isArray(cond) && !cond.length)) {
          return series(items, context, alt, write);
        }
      });
    }
  }

  /**
   * Variable Escaped
   */

  function V(key) {
    var dig = U(key);
    return VV;

    function VV(context, alt) {
      return dig(context, alt).then(esc);
    }
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

  function writable(func, context, alt) {
    var result;

    return resolve().then(function() {
      return func(context, alt, write);
    }).then(function() {
      return result ? result.join("") : "";
    });

    function write(v) {
      if (v != null) {
        if (!result) result = [];
        result.push(v);
      }
    }
  }

  function series(item, context, alt, write) {
    return forEach(item, it);

    function it(item) {
      if ("function" === typeof item) {
        return resolve().then(function() {
          return item(context, alt);
        }).then(function(item) {
          return forEach(item, write);
        });
      }

      return write(item);
    }
  }

  function forEach(items, it) {
    var p = resolve();

    if (isArray(items)) {
      items.forEach(add);
    } else {
      add(items);
    }

    return p;

    function add(item) {
      p = p.then(function() {
        return it(item);
      });
    }
  }

  function resolve(v) {
    return Promise.resolve(v);
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
