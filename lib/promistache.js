"use strict";

var Promistache = exports;

Promistache.build = build;
Promistache.compile = compile;
Promistache.compileSync = compileSync;
Promistache.parse = parse;
Promistache.runtime = require("./runtime").runtime;
Promistache.runtimeSync = require("./runtime-sync").runtimeSync;

function build(source) {
  /*jshint -W061 */
  return Function("G", "I", "P", "S", "U", "V", "return " + parse(source));
}

function compile(source) {
  return Promistache.runtime(build(source));
}

function compileSync(source) {
  return Promistache.runtimeSync(build(source));
}

function parse(source) {
  var tagStack = [];
  var tagLast;
  var buffer = [];
  var comma;

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

  return parser(source);

  function parser(source) {
    source.split(/{{([^{}]*|{[^{}]*})}}/).forEach(function(str, idx) {
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
  }

  function addString(str) {
    if (str.length) {
      buffer.push(comma, quoteText(str));
    }
    comma = ",";
  }

  // Variable Unescaped

  function trippeMustacheTag(str) {
    return ampersandTag(str.substr(0, str.length - 1));
  }

  function ampersandTag(str) {
    var item = 'U("' + trim(str) + '")';
    buffer.push(comma, item);
    comma = ",";
  }

  // Partial tag

  function partialTag(str) {
    var item = 'P("' + trim(str) + '")';
    buffer.push(comma, item);
    comma = ",";
  }

  // Section

  function sectionTag(str) {
    tagLast = str;
    tagStack.push(tagLast);
    var item = 'S("' + tagLast + '",[';
    buffer.push(comma, item);
    comma = "";
  }

  // Inverted Section

  function invertedSectionTag(str) {
    tagLast = str;
    tagStack.push(tagLast);
    var item = 'I("' + tagLast + '",[';
    buffer.push(comma, item);
    comma = "";
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
    var item = '])';
    buffer.push(item);
  }

  // Variable Escaped

  function addVariable(str) {
    var item = 'V("' + str + '")';
    buffer.push(comma, item);
    comma = ",";
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

function quoteText(str) {
  return "'" + str.replace(/([\x00-\x1F'\\])/g, function(chr) {
    var code = chr.charCodeAt(0);
    return QUOTE_MAP[chr] || ((code < 16 ? "\\x0" : "\\x") + code.toString(16).toUpperCase());
  }) + "'";
}

function trim(str) {
  return str.replace(/^\s+/, "").replace(/\s+$/, "");
}