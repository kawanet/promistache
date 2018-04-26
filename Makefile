#!/usr/bin/env bash -c make

ASYNC_OUT=bin/files/runtime.min.js
SYNC_OUT=bin/files/runtime-sync.min.js

ASYNC_SRC=lib/runtime.js
SYNC_SRC=lib/runtime-sync.js

ALL=$(ASYNC_OUT) $(SYNC_OUT)

all: $(ALL)

clean:
	/bin/rm -f $(ALL)

$(ASYNC_OUT): $(ASYNC_SRC)
	./node_modules/.bin/uglifyjs -c -m -o $(ASYNC_OUT) $(ASYNC_SRC)

$(SYNC_OUT): $(SYNC_SRC)
	./node_modules/.bin/uglifyjs -c -m -o $(SYNC_OUT) $(SYNC_SRC)
