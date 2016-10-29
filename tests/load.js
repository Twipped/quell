
var suite = require('tapsuite');
var test = require('tap').test;
var quell = require('../');

function logError (err) {
	var error = {
		error: Object.assign({
			message: err.message,
			stack: (err.stack || '').split('\n').slice(1).map((v) => '' + v + ''),
		}, err),
	};
	console.log(error);
}


test('load, 3 arg', (test) => {
	test.plan(5);
	var Model = quell('users');
	var model = new Model();

	model._loadWithExisting = model._loadWithMultiColumn = model._loadWithPrimaryKey = function () {
		test.ok(false, 'Called wrong load method');
	};

	model._loadWithSingleColumn = function (value, field) {
		test.ok(true, 'Called correct load method');
		test.strictEqual(value, 'bob');
		test.strictEqual(field, 'name');
		return Promise.resolve(model);
	};

	model.load('bob', 'name', (err, actual) => {
		test.equal(actual, model);
		test.strictEqual(err, null);
		test.end();
	});

});

test('load, 2 arg, no callback', (test) => {
	test.plan(4);
	var Model = quell('users');
	var model = new Model();

	model._loadWithExisting = model._loadWithMultiColumn = model._loadWithPrimaryKey = function () {
		test.ok(false, 'Called wrong load method');
	};

	model._loadWithSingleColumn = function (value, field) {
		test.ok(true, 'Called correct load method');
		test.strictEqual(value, 'bob');
		test.strictEqual(field, 'name');
		return Promise.resolve(model);
	};

	model.load('bob', 'name').then((actual) => {
		test.equal(actual, model);
		test.end();
	}, (err) => {
		logError(err);
		test.ok(false, 'promise rejected');
		test.end();
	});

});

test('load, 2 arg with callback', (test) => {
	test.plan(4);
	var Model = quell('users');
	var model = new Model();

	model._loadWithExisting = model._loadWithMultiColumn = model._loadWithSingleColumn = function () {
		test.ok(false, 'Called wrong load method');
	};

	model._loadWithPrimaryKey = function (value) {
		test.ok(true, 'Called correct load method');
		test.strictEqual(value, 'bob');
		return Promise.resolve(model);
	};

	model.load('bob', (err, actual) => {
		test.strictEqual(err, null);
		test.equal(actual, model);
		test.end();
	});

});

test('load, 1 arg, no callback', (test) => {
	test.plan(3);
	var Model = quell('users');
	var model = new Model();

	model._loadWithExisting = model._loadWithMultiColumn = model._loadWithSingleColumn = function () {
		test.ok(false, 'Called wrong load method');
	};

	model._loadWithPrimaryKey = function (value) {
		test.ok(true, 'Called correct load method');
		test.strictEqual(value, 'bob');
		return Promise.resolve(model);
	};

	model.load('bob').then((actual) => {
		test.equal(actual, model);
		test.end();
	}, (err) => {
		logError(err);
		test.ok(false, 'promise rejected');
		test.end();
	});

});

test('load, 1 arg, no callback, plain object', (test) => {
	test.plan(3);
	var Model = quell('users');
	var model = new Model();

	model._loadWithExisting = model._loadWithPrimaryKey = model._loadWithSingleColumn = function () {
		test.ok(false, 'Called wrong load method');
	};

	model._loadWithMultiColumn = function (value) {
		test.ok(true, 'Called correct load method');
		test.deepEqual(value, { id: 1, name: 'john doe' });
		return Promise.resolve(model);
	};

	model.load({ id: 1, name: 'john doe' }).then((actual) => {
		test.equal(actual, model);
		test.end();
	}, (err) => {
		logError(err);
		test.ok(false, 'promise rejected');
		test.end();
	});

});

test('load, 1 arg with callback', (test) => {
	test.plan(3);
	var Model = quell('users');
	var model = new Model({ id: 1, name: 'john doe' });

	model._loadWithPrimaryKey = model._loadWithMultiColumn = model._loadWithSingleColumn = function () {
		test.ok(false, 'Called wrong load method');
	};

	model._loadWithExisting = function () {
		test.ok(true, 'Called correct load method');
		return Promise.resolve(model);
	};

	model.load((err, actual) => {
		test.strictEqual(err, null);
		test.equal(actual, model);
		test.end();
	});

});

test('load, no arguments', (test) => {
	test.plan(2);
	var Model = quell('users');
	var model = new Model({ id: 1, name: 'john doe' });

	model._loadWithPrimaryKey = model._loadWithMultiColumn = model._loadWithSingleColumn = function () {
		test.ok(false, 'Called wrong load method');
	};

	model._loadWithExisting = function () {
		test.ok(true, 'Called correct load method');
		return Promise.resolve(model);
	};

	model.load().then((actual) => {
		test.equal(actual, model);
		test.end();
	}, (err) => {
		logError(err);
		test.ok(false, 'promise rejected');
		test.end();
	});

});

test('save, no arguments, exist unset, pIE returns false', (test) => {
	test.plan(2);
	var Model = quell('users');
	var model = new Model({ id: 1, name: 'john doe' });

	model._promiseIfExists = function () {
		return Promise.resolve(false);
	};

	model.update = function () {
		test.ok(false, 'Called wrong save method');
	};

	model.insert = function () {
		test.ok(true, 'Called correct save method');
		return Promise.resolve(model);
	};

	model.save().then((actual) => {
		test.equal(actual, model);
		test.end();
	}, (err) => {
		logError(err);
		test.ok(false, 'promise rejected');
		test.end();
	});

});

test('_loadWithExisting - fails without primaries', (test) => {
	test.plan(3);

	var Model = quell('users', {
		schema: {
			columns: {
				id: quell.INT(),
				name: quell.VARCHAR(),
			},
			primaries: [],
		},
	});

	var model = new Model({ id: 1, name: 'john doe' });

	model._promiseValidateSchema = function () {
		test.ok(true, '_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function () {
		test.ok(false, 'called _loadUsing');
		return Promise.resolve();
	};

	model._loadWithExisting().then(() => {
		test.ok(false, 'promise resolved');
		test.end();
	}, (err) => {
		test.equal(err.message, 'Could not load quell model using existing data; table has no primary keys.');
		test.ok(true, 'promise rejected');
		test.end();
	});
});

test('_loadWithExisting - fails without primary data', (test) => {
	test.plan(3);

	var Model = quell('users', {
		schema: {
			columns: {
				id: quell.INT(),
				name: quell.VARCHAR(),
			},
			primaries: [ 'id' ],
		},
	});

	var model = new Model();

	model._promiseValidateSchema = function () {
		test.ok(true, '_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function () {
		test.ok(false, 'called _loadUsing');
		return Promise.resolve();
	};

	model._loadWithExisting().then(() => {
		test.ok(false, 'promise resolved');
		test.end();
	}, (err) => {
		test.equal(err.message, 'Could not load quell record, required primary key value was absent: id');
		test.ok(true, 'promise rejected');
		test.end();
	});
});

test('_loadWithExisting - ok', (test) => {
	test.plan(4);

	var Model = quell('users', {
		schema: {
			columns: {
				id: quell.INT(),
				name: quell.VARCHAR(),
			},
			primaries: [ 'id' ],
		},
	});

	var model = new Model({ id: 5, name: 'john doe' });

	model._promiseValidateSchema = function () {
		test.ok(true, '_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function (lookup) {
		test.deepEqual(lookup, { id: 5 });
		test.ok(true, 'called _loadUsing');
		return Promise.resolve();
	};

	model._loadWithExisting().then(() => {
		test.ok(true, 'promise resolved');
		test.end();
	}, () => {
		test.ok(false, 'promise rejected');
		test.end();
	});
});

test('_loadWithPrimaryKey - ok', (test) => {
	test.plan(4);

	var Model = quell('users', {
		schema: {
			columns: {
				id: quell.INT(),
				name: quell.VARCHAR(),
			},
			primaries: [ 'id' ],
		},
	});

	var model = new Model({ id: 5, name: 'john doe' });

	model._promiseValidateSchema = function () {
		test.ok(true, '_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function (lookup) {
		test.deepEqual(lookup, { id: 10 });
		test.ok(true, 'called _loadUsing');
		return Promise.resolve();
	};

	model._loadWithPrimaryKey(10).then(() => {
		test.ok(true, 'promise resolved');
		test.end();
	}, () => {
		test.ok(false, 'promise rejected');
		test.end();
	});
});

test('_loadWithPrimaryKey - no primaries', (test) => {
	test.plan(3);

	var Model = quell('users', {
		schema: {
			columns: {
				id: quell.INT(),
				name: quell.VARCHAR(),
			},
			primaries: [],
		},
	});

	var model = new Model({ id: 5, name: 'john doe' });

	model._promiseValidateSchema = function () {
		test.ok(true, '_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function (lookup) {
		test.deepEqual(lookup, { id: 10 });
		test.ok(true, 'called _loadUsing');
		return Promise.resolve();
	};

	model._loadWithPrimaryKey().then(() => {
		test.ok(false, 'promise resolved');
		test.end();
	}, (err) => {
		test.equal(err.message, 'Could not load quell model using existing data; schema has no primary keys.');
		test.ok(true, 'promise rejected');
		test.end();
	});
});

test('_loadWithPrimaryKey - too many primaries', (test) => {
	test.plan(3);

	var Model = quell('users', {
		schema: {
			columns: {
				id: quell.INT(),
				name: quell.VARCHAR(),
			},
			primaries: [ 'id', 'city' ],
		},
	});

	var model = new Model({ id: 5, name: 'john doe' });

	model._promiseValidateSchema = function () {
		test.ok(true, '_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function (lookup) {
		test.deepEqual(lookup, { id: 10 });
		test.ok(true, 'called _loadUsing');
		return Promise.resolve();
	};

	model._loadWithPrimaryKey().then(() => {
		test.ok(false, 'promise resolved');
		test.end();
	}, (err) => {
		test.equal(err.message, 'Could not load quell model using single primary key, schema has more than one primary key.');
		test.ok(true, 'promise rejected');
		test.end();
	});
});


test('_loadWithSingleColumn - ok', (test) => {
	test.plan(4);

	var Model = quell('users', {
		schema: {
			columns: {
				id: quell.INT(),
				name: quell.VARCHAR(),
			},
			primaries: [ 'id' ],
		},
	});

	var model = new Model({ id: 5, name: 'john doe' });

	model._promiseValidateSchema = function () {
		test.ok(true, '_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function (lookup) {
		test.deepEqual(lookup, { id: 10 });
		test.ok(true, 'called _loadUsing');
		return Promise.resolve();
	};

	model._loadWithSingleColumn(10, 'id').then(() => {
		test.ok(true, 'promise resolved');
		test.end();
	}, () => {
		test.ok(false, 'promise rejected');
		test.end();
	});
});

test('_loadWithSingleColumn - bad column', (test) => {
	test.plan(3);

	var Model = quell('users', {
		schema: {
			columns: {
				id: quell.INT(),
				name: quell.VARCHAR(),
			},
			primaries: [ 'id' ],
		},
	});

	var model = new Model({ id: 5, name: 'john doe' });

	model._promiseValidateSchema = function () {
		test.ok(true, '_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function (lookup) {
		test.deepEqual(lookup, { id: 10 });
		test.ok(true, 'called _loadUsing');
		return Promise.resolve();
	};

	model._loadWithSingleColumn('San Diego', 'city').then(() => {
		test.ok(false, 'promise resolved');
		test.end();
	}, (err) => {
		test.equal(err.message, 'Could not load quell model, city does not exist in the table schema.');
		test.ok(true, 'promise rejected');
		test.end();
	});
});

test('_loadWithMultiColumn - ok', (test) => {
	test.plan(4);

	var Model = quell('users', {
		schema: {
			columns: {
				id: quell.INT(),
				name: quell.VARCHAR(),
			},
			primaries: [ 'id' ],
		},
	});

	var model = new Model();

	model._promiseValidateSchema = function () {
		test.ok(true, '_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function (lookup) {
		test.deepEqual(lookup, { id: 5, name: 'john doe' });
		test.ok(true, 'called _loadUsing');
		return Promise.resolve();
	};

	model._loadWithMultiColumn({ id: 5, name: 'john doe' }).then(() => {
		test.ok(true, 'promise resolved');
		test.end();
	}, () => {
		test.ok(false, 'promise rejected');
		test.end();
	});
});

test('_loadWithMultiColumn - bad value', (test) => {
	test.plan(3);

	var Model = quell('users', {
		schema: {
			columns: {
				id: quell.INT(),
				name: quell.VARCHAR(),
			},
			primaries: [ 'id' ],
		},
	});

	var model = new Model();

	model._promiseValidateSchema = function () {
		test.ok(true, '_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function (lookup) {
		test.deepEqual(lookup, { id: 5, name: 'john doe' });
		test.ok(true, 'called _loadUsing');
		return Promise.resolve();
	};

	model._loadWithMultiColumn().then(() => {
		test.ok(false, 'promise resolved');
		test.end();
	}, (err) => {
		test.equal(err.message, 'Could not load quell model; provided data was empty or not an object.');
		test.ok(true, 'promise rejected');
		test.end();
	});
});

test('_loadWithMultiColumn - bad value 2', (test) => {
	test.plan(3);

	var Model = quell('users', {
		schema: {
			columns: {
				id: quell.INT(),
				name: quell.VARCHAR(),
			},
			primaries: [ 'id' ],
		},
	});

	var model = new Model();

	model._promiseValidateSchema = function () {
		test.ok(true, '_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function (lookup) {
		test.deepEqual(lookup, { id: 5, name: 'john doe' });
		test.ok(true, 'called _loadUsing');
		return Promise.resolve();
	};

	model._loadWithMultiColumn({}).then(() => {
		test.ok(false, 'promise resolved');
		test.end();
	}, (err) => {
		test.equal(err.message, 'Could not load quell model; provided data was empty or not an object.');
		test.ok(true, 'promise rejected');
		test.end();
	});
});

test('_loadWithMultiColumn - invalid column', (test) => {
	test.plan(3);

	var Model = quell('users', {
		schema: {
			columns: {
				id: quell.INT(),
				name: quell.VARCHAR(),
			},
			primaries: [ 'id' ],
		},
	});

	var model = new Model();

	model._promiseValidateSchema = function () {
		test.ok(true, '_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function (lookup) {
		test.deepEqual(lookup, { id: 5, name: 'john doe' });
		test.ok(true, 'called _loadUsing');
		return Promise.resolve();
	};

	model._loadWithMultiColumn({ city: 'San Diego' }).then(() => {
		test.ok(false, 'promise resolved');
		test.end();
	}, (err) => {
		test.equal(err.message, 'Could not load quell model, city does not exist in the table schema.');
		test.ok(true, 'promise rejected');
		test.end();
	});
});


suite('loadUsing', (s) => {
	s.before((done) => {
		this.backup = Object.assign({}, quell);
		done();
	});

	s.after((done) => {
		Object.assign(quell, this.backup);
		done();
	});

	s.test('with results', (test) => {

		var mockConnection = { query: true };

		var Model = quell('users', {
			connection: mockConnection,
			schema: {
				columns: {
					id: quell.INT(),
					name: quell.VARCHAR(),
				},
				primaries: [ 'id' ],
				autoincrement: 'id',
			},
		});

		var model = new Model();

		quell._buildSelectQuery = function (tablename, lookup) {
			test.strictEqual(tablename, 'users');
			test.deepEqual(lookup, { id: 5, name: 'john doe' });
			test.ok(true, 'build ran');
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function (query, data, mysql) {
			test.equal(query, 'QUERY');
			test.deepEqual(data, [ 22 ]);
			test.equal(mysql, mockConnection);
			test.ok(true, 'query ran');
			return Promise.resolve([
				{ id: 5, name: 'john doe' },
			]);
		};

		model._loadUsing({ id: 5, name: 'john doe' }).then((result) => {
			test.equal(result, model);
			test.equal(model.exists, true);
			test.deepEqual(model.changed, {});
			test.ok(true, 'promise resolved');
			test.end();
		}, () => {
			test.ok(false, 'promise rejected');
			test.end();
		});
	});

	s.test('without results', (test) => {

		var mockConnection = { query: true };

		var Model = quell('users', {
			connection: mockConnection,
			schema: {
				columns: {
					id: quell.INT(),
					name: quell.VARCHAR(),
				},
				primaries: [ 'id' ],
				autoincrement: 'id',
			},
		});

		var model = new Model();

		quell._buildSelectQuery = function (tablename, lookup) {
			test.strictEqual(tablename, 'users');
			test.deepEqual(lookup, { id: 5, name: 'john doe' });
			test.ok(true, 'build ran');
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function (query, data, mysql) {
			test.equal(query, 'QUERY');
			test.deepEqual(data, [ 22 ]);
			test.equal(mysql, mockConnection);
			test.ok(true, 'query ran');
			return Promise.resolve([]);
		};

		model._loadUsing({ id: 5, name: 'john doe' }).then((result) => {
			test.equal(result, false);
			test.equal(model.exists, false);
			test.deepEqual(model.changed, {});
			test.ok(true, 'promise resolved');
			test.end();
		}, () => {
			test.ok(false, 'promise rejected');
			test.end();
		});
	});
});
