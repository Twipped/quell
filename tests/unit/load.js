
var suite = require('tapsuite');
var test = require('tap').test;
var quell = require('../../');

test('load, 3 arg', (test) => {
	test.plan(5);
	var Model = quell('users');
	var model = new Model();

	model._loadWithExisting = model._loadWithMultiColumn = model._loadWithPrimaryKey = function () {
		test.fail(false, 'Called wrong load method');
	};

	model._loadWithSingleColumn = function (value, field) {
		test.pass('Called correct load method');
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
		test.fail('Called wrong load method');
	};

	model._loadWithSingleColumn = function (value, field) {
		test.pass('Called correct load method');
		test.strictEqual(value, 'bob');
		test.strictEqual(field, 'name');
		return Promise.resolve(model);
	};

	return model.load('bob', 'name').then((actual) => {
		test.equal(actual, model);
	});
});

test('load, 2 arg with callback', (test) => {
	test.plan(4);
	var Model = quell('users');
	var model = new Model();

	model._loadWithExisting = model._loadWithMultiColumn = model._loadWithSingleColumn = function () {
		test.fail('Called wrong load method');
	};

	model._loadWithPrimaryKey = function (value) {
		test.pass('Called correct load method');
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
		test.fail('Called wrong load method');
	};

	model._loadWithPrimaryKey = function (value) {
		test.pass('Called correct load method');
		test.strictEqual(value, 'bob');
		return Promise.resolve(model);
	};

	return model.load('bob').then((actual) => {
		test.equal(actual, model);
	});
});

test('load, 1 arg, no callback, plain object', (test) => {
	test.plan(3);
	var Model = quell('users');
	var model = new Model();

	model._loadWithExisting = model._loadWithPrimaryKey = model._loadWithSingleColumn = function () {
		test.fail('Called wrong load method');
	};

	model._loadWithMultiColumn = function (value) {
		test.pass('Called correct load method');
		test.deepEqual(value, { id: 1, name: 'john doe' });
		return Promise.resolve(model);
	};

	return model.load({ id: 1, name: 'john doe' }).then((actual) => {
		test.equal(actual, model);
	});
});

test('load, 1 arg with callback', (test) => {
	test.plan(3);
	var Model = quell('users');
	var model = new Model({ id: 1, name: 'john doe' });

	model._loadWithPrimaryKey = model._loadWithMultiColumn = model._loadWithSingleColumn = function () {
		test.fail('Called wrong load method');
	};

	model._loadWithExisting = function () {
		test.pass('Called correct load method');
		return Promise.resolve(model);
	};

	model.load((err, actual) => {
		test.error(err);
		test.equal(actual, model);
		test.end();
	});
});

test('load, no arguments', (test) => {
	test.plan(2);
	var Model = quell('users');
	var model = new Model({ id: 1, name: 'john doe' });

	model._loadWithPrimaryKey = model._loadWithMultiColumn = model._loadWithSingleColumn = function () {
		test.fail('Called wrong load method');
	};

	model._loadWithExisting = function () {
		test.pass('Called correct load method');
		return Promise.resolve(model);
	};

	return model.load().then((actual) => {
		test.equal(actual, model);
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
		test.fail('Called wrong save method');
	};

	model.insert = function () {
		test.pass('Called correct save method');
		return Promise.resolve(model);
	};

	return model.save().then((actual) => {
		test.equal(actual, model);
	});
});

test('_loadWithExisting - fails without primaries', (test) => {
	test.plan(2);

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
		test.pass('_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function () {
		test.fail('called _loadUsing');
		return Promise.resolve();
	};

	return model._loadWithExisting()
		.then(() => test.fail('promise should have rejected'))
		.catch((err) => {
			test.equal(err.message, 'Could not load quell model using existing data; table has no primary keys.');
		});
});

test('_loadWithExisting - fails without primary data', (test) => {
	test.plan(2);

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
		test.pass('_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function () {
		test.fail('called _loadUsing');
		return Promise.resolve();
	};

	return model._loadWithExisting()
		.then(() => test.fail('promise should have rejected'))
		.catch((err) => {
			test.equal(err.message, 'Could not load quell record, required primary key value was absent: id');
		});
});

test('_loadWithExisting - ok', (test) => {
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
		test.pass('_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function (lookup) {
		test.deepEqual(lookup, { id: 5 });
		test.pass('called _loadUsing');
		return Promise.resolve();
	};

	return model._loadWithExisting();
});

test('_loadWithPrimaryKey - ok', (test) => {
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
		test.pass('_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function (lookup) {
		test.pass('called _loadUsing');
		test.deepEqual(lookup, { id: 10 });
		return Promise.resolve();
	};

	return model._loadWithPrimaryKey(10);
});

test('_loadWithPrimaryKey - no primaries', (test) => {
	test.plan(2);

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
		test.pass('_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function () {
		test.fail('called _loadUsing');
		return Promise.resolve();
	};

	return model._loadWithPrimaryKey()
		.then(() => test.fail('promise should have rejected'))
		.catch((err) => {
			test.equal(err.message, 'Could not load quell model using existing data; schema has no primary keys.');
		});
});

test('_loadWithPrimaryKey - too many primaries', (test) => {
	test.plan(2);

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
		test.pass('_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function (lookup) {
		test.deepEqual(lookup, { id: 10 });
		test.pass('called _loadUsing');
		return Promise.resolve();
	};

	return model._loadWithPrimaryKey()
		.then(() => test.fail('promise should have rejected'))
		.catch((err) => {
			test.equal(err.message, 'Could not load quell model using single primary key, schema has more than one primary key.');
		});
});

test('_loadWithSingleColumn - ok', (test) => {
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
		test.pass('_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function (lookup) {
		test.deepEqual(lookup, { id: 10 });
		test.pass('called _loadUsing');
		return Promise.resolve();
	};

	return model._loadWithSingleColumn(10, 'id');
});

test('_loadWithSingleColumn - bad column', (test) => {
	test.plan(2);

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
		test.pass('_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function (lookup) {
		test.deepEqual(lookup, { id: 10 });
		test.pass('called _loadUsing');
		return Promise.resolve();
	};

	return model._loadWithSingleColumn('San Diego', 'city')
		.then(() => test.fail('promise should have rejected'))
		.catch((err) => {
			test.equal(err.message, 'Could not load quell model, city does not exist in the table schema.');
		});
});

test('_loadWithMultiColumn - ok', (test) => {
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
		test.pass('_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function (lookup) {
		test.deepEqual(lookup, { id: 5, name: 'john doe' });
		test.pass('called _loadUsing');
		return Promise.resolve();
	};

	return model._loadWithMultiColumn({ id: 5, name: 'john doe' });
});

test('_loadWithMultiColumn - bad value', (test) => {
	test.plan(2);

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
		test.pass('_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function (lookup) {
		test.deepEqual(lookup, { id: 5, name: 'john doe' });
		test.pass('called _loadUsing');
		return Promise.resolve();
	};

	return model._loadWithMultiColumn()
		.then(() => test.fail('promise should have rejected'))
		.catch((err) => {
			test.equal(err.message, 'Could not load quell model; provided data was empty or not an object.');
		});
});

test('_loadWithMultiColumn - bad value 2', (test) => {
	test.plan(2);

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
		test.pass('_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function (lookup) {
		test.deepEqual(lookup, { id: 5, name: 'john doe' });
		test.pass('called _loadUsing');
		return Promise.resolve();
	};

	return model._loadWithMultiColumn({})
		.then(() => test.fail('promise should have rejected'))
		.catch((err) => {
			test.equal(err.message, 'Could not load quell model; provided data was empty or not an object.');
		});
});

test('_loadWithMultiColumn - invalid column', (test) => {
	test.plan(2);

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
		test.pass('_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function (lookup) {
		test.deepEqual(lookup, { id: 5, name: 'john doe' });
		test.pass('called _loadUsing');
		return Promise.resolve();
	};

	return model._loadWithMultiColumn({ city: 'San Diego' })
		.then(() => test.fail('promise should have rejected'))
		.catch((err) => {
			test.equal(err.message, 'Could not load quell model, city does not exist in the table schema.');
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
		test.plan(10);

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
			test.pass('called _buildSelectQuery');
			test.strictEqual(tablename, 'users');
			test.deepEqual(lookup, { id: 5, name: 'john doe' });
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function (query, data, mysql) {
			test.pass('called _promiseQueryRun');
			test.equal(query, 'QUERY');
			test.deepEqual(data, [ 22 ]);
			test.equal(mysql, mockConnection);
			return Promise.resolve([
				{ id: 5, name: 'john doe' },
			]);
		};

		return model._loadUsing({ id: 5, name: 'john doe' }).then((result) => {
			test.equal(result, model);
			test.equal(model.exists, true);
			test.deepEqual(model.changed, {});
		});
	});

	s.test('without results', (test) => {
		test.plan(10);

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
			test.pass('called _buildSelectQuery');
			test.strictEqual(tablename, 'users');
			test.deepEqual(lookup, { id: 5, name: 'john doe' });
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function (query, data, mysql) {
			test.pass('called _promiseQueryRun');
			test.equal(query, 'QUERY');
			test.deepEqual(data, [ 22 ]);
			test.equal(mysql, mockConnection);
			return Promise.resolve([]);
		};

		return model._loadUsing({ id: 5, name: 'john doe' }).then((result) => {
			test.equal(result, false);
			test.equal(model.exists, false);
			test.deepEqual(model.changed, {});
		});
	});
});
