install:
	@npm install

example:
	@node node_modules/beefy/bin/beefy example.js

publish:
	@npm publish && make tag && make ghpages

tag:
	@git tag "v$(shell node -e "var config = require('./package.json'); console.log(config.version);")"
	@git push --tags

ghpages:
	@git checkout gh-pages && git merge master
	@node_modules/browserify/bin/cmd.js example.js -o metronome.js
	@git commit -am "update example"
	@git push origin gh-pages
	@git checkout master