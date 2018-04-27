# Promistache - Promise-based asynchronous Mustache-like templating engine

## Synopsis

Asynchronous mode:

```js
const Promistache = require("promistache");

const showHello = Promistache.compile("hello, {{name}}");

const context = {name: "Ryu"};

showHello(context).then(console.log);
```

Synchronous mode:

```js
const Promistache = require("promistache");

const showHello = Promistache.compileSync("hello, {{name}}");

const context = {name: "Ryu"};

console.log(showHello(context));
```

### CLI Compiler

```sh
promistache --help

promistache --variable=exports --runtime=sync names.html --output=templates.js
```

HTML Template:

```html
<ul>
  {{#list}}
  <li>{{name}}</li>
  {{/list}}
</ul>
```

JavaScript:

```js
const templates = require("./templates");

const context = {list: [{name: "Ryu"}, {name: "Ken"}]};

console.log(templates.names(context));
```

Result:

```html
<ul>
  <li>Ryu</li>
  <li>Ken</li>
</ul>
```

### Incompatibility

This implementation has some minor changes from the original [Mustache spec](https://github.com/mustache/spec).
Specs like below are not supported for safety or/and better performance.

- A lambda's return value should be parsed.
- A lambda's return value should parse with the default delimiters.
- All elements on the context stack should be accessible.
- Each line of the partial should be indented before rendering.
- Lambdas used for inverted sections should be considered truthy.
- Lambdas used for sections should have their results parsed.
- Lambdas used for sections should not be cached.
- Lambdas used for sections should parse with the current delimiters.
- Lambdas used for sections should receive the raw section string.
- Standalone tags should not require a newline to follow them.
- Standalone tags should not require a newline to precede them.

### GitHub

- [https://github.com/kawanet/promistache](https://github.com/kawanet/promistache)

### The MIT License (MIT)

Copyright (c) 2017 Yusuke Kawasaki

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
