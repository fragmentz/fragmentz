SUFFIX=.ometajs

all: css-parser.js css-translator.js

%.js: %.ometajs
	./bin/ometajs2js --runtime "./ometajs/runtime" -b -i $< -o $@

docs:

clean:
	- rm -rf css-parser.js css-translator.js

.PHONY: all docs
