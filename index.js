//name resolution helper
global.root = require('path').resolve(__dirname);
global.parent = require('path').dirname(module.parent.filename);
module.exports = require('./lib/flatly');
