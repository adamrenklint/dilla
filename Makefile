MOCHA = ./node_modules/mocha/bin/mocha
_MOCHA = ./node_modules/mocha/bin/_mocha
ISTANBUL = ./node_modules/istanbul/lib/cli.js
CC_REPORTER = ./node_modules/codeclimate-test-reporter/bin/codeclimate.js
CC_REPO_TOKEN = 1363edd385fdd2f477d277017d6f8929adbb6cfc973923017f8e4ce1bf08dd0b
JSHINT = ./node_modules/jshint/bin/jshint
COVERAGE_LIMIT = 75

install:
	@npm install

example:
	@node node_modules/beefy/bin/beefy example.js

test:
	@$(MOCHA) -s 10

watch:
	@$(MOCHA) -w -s 10

coverage:
	@$(ISTANBUL) cover $(_MOCHA) -x "vendor/*.js" -- test/*.test.js -R dot

check-coverage: coverage
	@$(ISTANBUL) check-coverage --statement $(COVERAGE_LIMIT) --branch $(COVERAGE_LIMIT) --function $(COVERAGE_LIMIT)

report-coverage:
	@CODECLIMATE_REPO_TOKEN=$(CC_REPO_TOKEN) $(CC_REPORTER) < coverage/lcov.info

publish: lint test check-coverage report-coverage
	@npm publish && make tag ghpages

lint:
	@$(JSHINT) index.js

tag:
	@git tag "v$(shell node -e "var config = require('./package.json'); console.log(config.version);")"
	@git push --tags

ghpages:
	@git checkout gh-pages && git merge master
	@node_modules/browserify/bin/cmd.js example.js -o metronome.js
	@git commit --allow-empty -am "update example"
	@git push origin gh-pages
	@git checkout master

.PHONY: test coverage
