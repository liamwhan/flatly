jsdoc -c jsdoc.conf.json -t ./node_modules/ink-docstrap/template -d docs/ -P package.json && jsdoc2md core/flatly.js > README.md