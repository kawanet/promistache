"use strict";

var Promistache = exports;

Promistache.build = build;
Promistache.compile = compile;
Promistache.compileSync = compileSync;
Promistache.parse = parse;
Promistache.runtime = require("./runtime").runtime;
Promistache.runtimeSync = require("./runtime-sync").runtimeSync;

function build(source, options) {
  /*jshint -W061 */
  return Function("G", "I", "P", "S", "U", "V", "return " + parse(source, options));
}

function compile(source, options) {
  return Promistache.runtime(build(source, options));
}

function compileSync(source, options) {
  return Promistache.runtimeSync(build(source, options));
}

function parse(source, options) {
  var tagStack = [];
  var tagLast;
  var buffer = [];
  var comma = "";

  var TAG_MAP = {
    "&": ampersandTag,
    "/": closeTag,
    "!": commentTag,
    "^": invertedSectionTag,
    ">": partialTag,
    "#": sectionTag,
    "{": trippeMustacheTag
  };

  var PREFIX = "G([";
  var SUFFIX = "])";
  var COMMA = ",";
  var regexp = "{{([^{}]*|{[^{}]*})}}";

  source += "";

  var tag = options && options.tag;

  if (!tag) {
    source.replace(/{{=(.*?)=}}|\n[ \t]*{{=(.*?)=}}[ \t]*\r?\n/, function(match, tag1, tag2, pos) {
      var left = source.substr(0, tag2 ? pos + 1 : pos);
      if (left) buffer.push(parse(left, options), COMMA);
      tag = trim(tag1 || tag2);
      source = source.substr(pos + match.length);
    });
  }

  if (tag) {
    regexp = tag.replace(/[!-.?\[-\]{-}]/g, escapeChar).replace(/\s+/, "(.*?)");
  }

  var keepSpaces = options && options.spaces;
  if (!keepSpaces) {
    var trimRE = new RegExp("^[ \t]*" + regexp + "[ \t]*\r?\n", "mg");
    var removeMap = {"/": 1, "!": 1, "^": 1, ">": 1, "#": 1};
    source = source.replace(trimRE, function(match, inner) {
      return removeMap[inner[0]] ? trim(match) : match;
    });
  }

  var splitRE = new RegExp(regexp);
  source.split(splitRE).forEach(function(str, idx) {
    if (idx & 1) {
      var f = TAG_MAP[str[0]];
      if (f) {
        f(trim(str.substr(1)));
      } else {
        addVariable(trim(str));
      }
    } else {
      addString(str);
    }
  });

  if (tagStack.length) {
    throw new Error("missing closing tag: " + tagLast);
  }

  return PREFIX + buffer.join("") + SUFFIX;

  function push(a, b, next) {
    buffer.push(a, b);
    comma = next;
  }

  function addString(str) {
    push(comma, quoteText(str), COMMA);
  }

  // Variable Unescaped

  function trippeMustacheTag(str) {
    return ampersandTag(str.substr(0, str.length - 1));
  }

  function ampersandTag(str) {
    push(comma, 'U("' + trim(str) + '")', COMMA);
  }

  // Partial tag

  function partialTag(str) {
    push(comma, 'P("' + trim(str) + '")', COMMA);
  }

  // Section

  function sectionTag(str) {
    tagLast = str;
    tagStack.push(tagLast);
    push(comma, 'S("' + tagLast + '",[');
  }

  // Inverted Section

  function invertedSectionTag(str) {
    tagLast = str;
    tagStack.push(tagLast);
    push(comma, 'I("' + tagLast + '",[');
  }

  // Closing tag

  function closeTag(str) {
    if (!tagStack.length) {
      throw new Error("Closing tag without opener: " + str);
    }
    if (tagLast !== str) {
      throw new Error("Nesting error: " + tagLast + " vs. " + str);
    }
    tagStack.pop();
    tagLast = tagStack[tagStack.length - 1];
    push("", '])', comma);
  }

  // Variable Escaped

  function addVariable(str) {
    push(comma, 'V("' + str + '")', COMMA);
  }

  // Comment

  function commentTag() {
    // ignore
  }
}

/**
 * @private
 */

var QUOTE_MAP = {
  "\t": "\\t", // 0x09
  "\n": "\\n", // 0x0a
  "\r": "\\r", // 0x0d
  "'": "\\'", // 0x22
  "\\": "\\\\" // 0x5c
};

function escapeChar(chr) {
  var code = chr.charCodeAt(0);
  return QUOTE_MAP[chr] || ((code < 16 ? "\\x0" : "\\x") + code.toString(16).toUpperCase());
}

function quoteText(str) {
  return str && "'" + str.replace(/([\x00-\x1F'\\])/g, escapeChar) + "'";
}

function trim(str) {
  return str.replace(/^\s+/, "").replace(/\s+$/, "");
}