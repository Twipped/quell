Quell
===

Quell is a MySQL Active Record solution for NodeJS based on Backbone.Model.

Quell does not support joins. It is built to manage individual records in a database on a per-row basis.

Quell does not manage table schema, but will automatically load schema and sanitize input against table column types.

[![NPM version](https://img.shields.io/npm/v/quell.svg)](http://badge.fury.io/js/quell)
[![Licensed MIT](https://img.shields.io/npm/l/quell.svg)](https://github.com/ChiperSoft/quell/blob/master/LICENSE.txt)
[![Nodejs 4+](https://img.shields.io/badge/node.js-%3E=_4%20LTS-brightgreen.svg)](http://nodejs.org)
[![Downloads](http://img.shields.io/npm/dm/quell.svg)](http://npmjs.org/quell)
[![Build Status](https://img.shields.io/travis/ChiperSoft/quell.svg)](https://travis-ci.org/ChiperSoft/quell)

##Installation

NPM: `npm install mysql quell`

Quell is built to work with connection pools from [node-mysql](http://npm.im/mysql) and [mysql2](http://npm.im/mysql2).

##Usage

```js
var mysql = require('mysql');
var pool = mysql.createPool({ /* MySQL Connection Settings */});

var quell = require('quell');

var Book   = quell('books', { connection: pool });
var Author = quell('authors', { connection: pool });

var tperry = new Author({
  firstname: 'Terry',
  lastname: 'Pratchett'
});

var nightWatch = new Book({
  title: 'Night Watch'
});

tperry.save().then(function () {
  nightWatch.set('authorid', tperry.get('id'));
  return nightWatch.save();
});
```

**Visit [quelljs.com](http://quelljs.com/) for documentation.**

##Running Unit Tests

From inside the repository root, run `npm install` to install the test dependencies.

Run `npm run test:unit` to run just unit tests.

Run `npm run test:int` to run integration tests. Note, running the integration test requires a [mktmp.io](https://mktmp.io) account configuration.

Run `npm run test:cover` to run all tests with code coverage.

Run `npm run lint` to validate ESLint rules.

`npm test` runs all of the above.

