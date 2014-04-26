var docdown = require("docdownjs");

var fs = require('fs');

// generate Markdown
var markdown = docdown(String(fs.readFileSync('quell.js') + '\n\n' + fs.readFileSync('lib/types.js')), {
  title: 'Quell <sup>v0.1.0</sup>',
  // toc: 'categories',
  url: 'https://github.com/ChiperSoft/quell/blob/master/quell.js'
});

fs.writeFileSync('DOCS.md', markdown, 'utf-8');