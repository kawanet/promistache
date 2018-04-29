#!/usr/bin/env bash -c make

MAIN_OUT=dist/promistache.min.js
MAIN_TMP=dist/promistache.browserify.js
MAIN_SRC=index.js
MAIN_LIB=lib/*.js

ASYNC_OUT=bin/files/runtime-async.min.js
ASYNC_SRC=lib/runtime-async.js

SYNC_OUT=bin/files/runtime-sync.min.js
SYNC_SRC=lib/runtime-sync.js

CLI_OUT=bin/files/templates.js
CLI_SRC=bin/files/*.txt

CLASS=Promistache

ALL=$(ASYNC_OUT) $(SYNC_OUT) $(MAIN_OUT) $(CLI_OUT)

all: $(ALL)

test: all fetch-specs
	./node_modules/.bin/mocha test
	./node_modules/.bin/jshint .
	./bin/promistache.cli.js test/sample/*.html --runtime=async | node
	./bin/promistache.cli.js test/sample/*.html --runtime=sync | node
	./bin/promistache.cli.js --help 2>&1 | grep github.com > /dev/null

clean:
	/bin/rm -f $(ALL)

$(ASYNC_OUT): $(ASYNC_SRC)
	./node_modules/.bin/uglifyjs -c -m -o $@ $<

$(SYNC_OUT): $(SYNC_SRC)
	./node_modules/.bin/uglifyjs -c -m -o $@ $<

$(MAIN_OUT): $(MAIN_TMP)
	./node_modules/.bin/uglifyjs -c -m -o $@ $<

$(MAIN_TMP): $(MAIN_SRC) $(MAIN_LIB)
	./node_modules/.bin/browserify $(MAIN_SRC) -s $(CLASS) -o $@ --debug

$(CLI_OUT): $(CLI_SRC) $(SYNC_OUT)
	./bin/promistache.cli.js --variable=exports --tag="[[ ]]" --runtime=sync $(CLI_SRC) --output=$@

SPECS=comments delimiters interpolation inverted partials sections '~lambdas'

fetch-specs: test/spec/specs/interpolation.json

test/spec/specs/interpolation.json:
	for spec in $(SPECS); do \
	curl -o "test/spec/specs/$$spec.json" "https://rawgit.com/mustache/spec/master/specs/$$spec.json"; \
	done

mocha:
	./node_modules/.bin/mocha test

jshint:
	./node_modules/.bin/jshint .

watch:
	while :; do make watching; sleep 1; done

watching: test/.watching

test/.watching: $(MAIN_SRC) $(MAIN_LIB)
	make mocha jshint all && touch test/.watching

.PHONY: all clean test
