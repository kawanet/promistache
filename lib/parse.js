"use strict";

exports.parse = parse;

function parse(source, options) {
  var tagStack = [];
  var tagLast;
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

  var buffer = [PREFIX];

  source += "";

  var tag = options && options.tag;

  if (!tag) {
    source.replace(/{{=(.*?)=}}/, function(match, t, pos) {
      var left = source.substr(0, pos);
      source = source.substr(pos + match.length);

      if (left.search(/(^|\n)[ \t]*$/) > -1 &&
        source.search(/^[ \t]*(\r?\n|$)/) > -1) {
        left = left.replace(/[ \t]*$/, "");
        source = source.replace(/^[ \t]*\r?\n?/, "");
      }

      if (left) buffer.push(parse(left, options), COMMA);

      tag = trim(t);
    });
  }

  if (tag) {
    tag = tag.replace(/[!-.?\[-\]{-}]/g, escapeChar);
    regexp = tag.replace(/\s+/, "(.*?)");
  }

  var STANDALONE = {"/": 1, "!": 1, "^": 1, ">": 1, "#": 1};
  var array = source.split(new RegExp(regexp));
  var last = array.length;

  for (var i = last - 2; i > 0; i -= 2) {
    var left = array[i - 1];
    var right = array[i + 1];

    var standalone = STANDALONE[array[i][0]] &&
      (i === 1 ? left.search(/(^|\n)[ \t]*$/) > -1 : left.search(/\n[ \t]*$/) > -1) &&
      (i === last - 2 ? right.search(/^[ \t]*(\r?\n|$)/) > -1 : right.search(/^[ \t]*\r?\n/) > -1);

    if (standalone) {
      array[i - 1] = left.replace(/[ \t]*$/, "");
      array[i + 1] = right.replace(/^[ \t]*\r?\n?/, "");
    }
  }

  array.forEach(function(str, col) {
    if (col & 1) {
      addTag(str);
    } else {
      addString(str);
    }
  });

  if (tagStack.length) {
    throw new Error("missing closing tag: " + tagLast);
  }

  push(SUFFIX);
  return buffer.join("");

  function push(a, b, next) {
    buffer.push(a, b);
    comma = next;
  }

  function addString(str) {
    push(comma, quoteText(str), COMMA);
  }

  function addTag(str) {
    var f = TAG_MAP[str[0]];
    if (f) {
      f(trim(str.substr(1)));
    } else {
      addVariable(trim(str));
    }
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
    push(comma, 'U(">' + trim(str) + '")', COMMA);
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
    push("", '])', COMMA);
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