#!/usr/bin/env bash -c make

MAIN_OUT=dist/promistache.min.js
MAIN_TMP=dist/promistache.browserify.js
MAIN_SRC=index.js
MAIN_LIB=lib/*.js

ASYNC_OUT=bin/files/runtime.min.js
ASYNC_SRC=lib/runtime.js

SYNC_OUT=bin/files/runtime-sync.min.js
SYNC_SRC=lib/runtime-sync.js

CLI_OUT=bin/files/templates.js
CLI_SRC=bin/files/*.txt

CLASS=Promistache

ALL=$(ASYNC_OUT) $(SYNC_OUT) $(MAIN_OUT) $(CLI_OUT)

all: $(ALL)

test: all
	./node_modules/.bin/mocha test
	./node_modules/.bin/jshint .
	./bin/promistache.cli.js test/sample/*.html --runtime > /dev/null
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

.PHONY: all clean test
