
var suite = require('tapsuite');
var quell = require('../../');

var mockConnection = function (test, expectedQuery, expectedData, returnValue) {
	return {
		query (query, data, callback) {
			if (expectedQuery !== undefined) { test.equal(query, expectedQuery); }
			if (expectedData !== undefined) { test.deepEqual(data, expectedData); }
			test.pass('Mysql query was called');
			callback(null, returnValue);
		},
	};
};

suite('delete', (t) => {
	t.before((done) => {
		this.backup = Object.assign({}, quell);
		done();
	});


	t.after((done) => {
		Object.assign(quell, this.backup);
		done();
	});

	t.test('using promise', (test) => {
		test.plan(9);

		var Model = quell('users', {
			connection: mockConnection(),
			schema: {
				columns: {
					id: quell.INT(),
					name: quell.VARCHAR(),
				},
				primaries: [ 'id' ],
				autoincrement: 'id',
			},
		});

		var model = new Model({ id: 5, name: 'john doe' });

		quell._buildDeleteQuery = function (tablename, lookup) {
			test.equal(tablename, 'users');
			test.deepEqual(lookup, { id: 5 });
			test.pass('build ran');
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function (query, data, mysql) {
			test.equal(query, 'QUERY');
			test.deepEqual(data, [ 22 ]);
			test.equal(mysql, Model.connection);
			test.pass('query ran');
			return Promise.resolve({ insertId: 5 });
		};

		model._promiseValidateSchema = function () {
			test.pass('_promiseValidateSchema ran');
			return Promise.resolve();
		};

		return model.delete().then((result) => {
			test.equal(result, model);
		});

	});

	t.test('using callback', (test) => {
		test.plan(11);

		var Model = quell('users', {
			connection: mockConnection(),
			schema: {
				columns: {
					id: quell.INT(),
					name: quell.VARCHAR(),
				},
				primaries: [ 'id' ],
				autoincrement: 'id',
			},
		});

		var model = new Model({ id: 5, name: 'john doe' });

		quell._buildDeleteQuery = function (tablename, lookup) {
			test.equal(tablename, 'users');
			test.deepEqual(lookup, { id: 5 });
			test.pass('build ran');
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function (query, data, mysql) {
			test.equal(query, 'QUERY');
			test.deepEqual(data, [ 22 ]);
			test.equal(mysql, Model.connection);
			test.pass('query ran');
			return Promise.resolve({ insertId: 5 });
		};

		model._promiseValidateSchema = function () {
			test.pass('_promiseValidateSchema ran');
			return Promise.resolve();
		};

		model.delete((err, result) => {
			test.error(err);
			test.equal(result, model);
			test.pass('callback invoked');
			test.end();
		});

	});

	t.test('passes sql error through from _promiseValidateSchema', (test) => {
		test.plan(4);

		var Model = quell('users', {
			connection: mockConnection(),
			schema: {
				columns: {
					id: quell.INT(),
					name: quell.VARCHAR(),
				},
				primaries: [ 'id' ],
				autoincrement: 'id',
			},
		});

		var model = new Model({ id: 5, name: 'john doe' });
		var mockError = { error: 'THIS IS AN ERROR' };

		quell._buildDeleteQuery = function () {
			test.fail('build ran');
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function () {
			test.fail('query ran');
			return Promise.resolve();
		};

		model._promiseValidateSchema = function () {
			test.pass('_promiseValidateSchema ran');
			return Promise.reject(mockError);
		};

		model.delete((err, result) => {
			test.equal(err, mockError);
			test.equal(result, undefined);
			test.pass('callback invoked');
			test.end();
		});

	});

	t.test('passes sql error through from _promiseQueryRun', (test) => {
		test.plan(8);

		var Model = quell('users', {
			connection: mockConnection(),
			schema: {
				columns: {
					id: quell.INT(),
					name: quell.VARCHAR(),
				},
				primaries: [ 'id' ],
				autoincrement: 'id',
			},
		});

		var model = new Model({ id: 5, name: 'john doe' });
		var mockError = { error: 'THIS IS AN ERROR' };

		quell._buildDeleteQuery = function (tablename, lookup) {
			test.equal(tablename, 'users');
			test.deepEqual(lookup, { id: 5 });
			test.pass('build ran');
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function (query, data, mysql) {
			test.equal(query, 'QUERY');
			test.deepEqual(data, [ 22 ]);
			test.equal(mysql, Model.connection);
			test.pass('query ran');
			return Promise.reject(mockError);
		};

		model._promiseValidateSchema = function () {
			return Promise.resolve();
		};

		return model.delete()
			.then(() => t.fail('Promise should have rejected'))
			.catch((err) => {
				test.equal(err, mockError, 'got error');
			});

	});

	t.test('missing primary key', (test) => {
		test.plan(4);

		var Model = quell('users', {
			connection: mockConnection(),
			schema: {
				columns: {
					id: quell.INT(),
					name: quell.VARCHAR(),
				},
				primaries: [ 'id' ],
			},
		});

		var model = new Model({ name: 'john doe' });

		quell._buildDeleteQuery = function () {
			test.fail('build ran');
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function () {
			test.fail('query ran');
			return Promise.resolve();
		};

		model._promiseValidateSchema = function () {
			test.pass('_promiseValidateSchema ran');
			return Promise.resolve();
		};

		model.delete((err, result) => {
			test.equal(err.message, 'Could not delete quell record, required primary key value was absent: id');
			test.pass('callback invoked');
			test.ok(!result);
			test.end();
		});

	});

	t.test('missing primary key, multikey', (test) => {
		test.plan(4);

		var Model = quell('users', {
			connection: mockConnection(),
			schema: {
				columns: {
					id: quell.INT(),
					name: quell.VARCHAR(),
				},
				primaries: [ 'id', 'name' ],
			},
		});

		var model = new Model({ id: 5 });

		quell._buildDeleteQuery = function () {
			test.fail('build ran');
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function () {
			test.fail('query ran');
			return Promise.resolve();
		};

		model._promiseValidateSchema = function () {
			test.pass('_promiseValidateSchema ran');
			return Promise.resolve();
		};

		model.delete((err, result) => {
			test.equal(err.message, 'Could not delete quell record, required primary key value was absent: name');
			test.pass('callback invoked');
			test.ok(!result);
			test.end();
		});

	});

	t.test('only uses primary key', (test) => {
		test.plan(11);

		var Model = quell('users', {
			connection: mockConnection(),
			schema: {
				columns: {
					id: quell.INT(),
					name: quell.VARCHAR(),
				},
				primaries: [ 'id' ],
				autoincrement: 'id',
			},
		});

		var model = new Model({ id: 5, name: 'john doe', city: 'San Diego' });

		quell._buildDeleteQuery = function (tablename, lookup) {
			test.equal(tablename, 'users');
			test.deepEqual(lookup, { id: 5 });
			test.pass('build ran');
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function (query, data, mysql) {
			test.equal(query, 'QUERY');
			test.deepEqual(data, [ 22 ]);
			test.equal(mysql, Model.connection);
			test.pass('query ran');
			return Promise.resolve();
		};

		model._promiseValidateSchema = function () {
			test.pass('_promiseValidateSchema ran');
			return Promise.resolve();
		};

		model.delete((err, result) => {
			test.error(err);
			test.equal(result, model);
			test.equal(result.get('id'), '5');
			test.end();
		});

	});

	t.test('multiple primaries', (test) => {
		test.plan(11);

		var Model = quell('users', {
			connection: mockConnection(),
			schema: {
				columns: {
					id: quell.INT(),
					name: quell.VARCHAR(),
				},
				primaries: [ 'id', 'name' ],
			},
		});

		var model = new Model({ id: 5, name: 'john doe', city: 'San Diego' });

		quell._buildDeleteQuery = function (tablename, lookup) {
			test.equal(tablename, 'users');
			test.deepEqual(lookup, { id: 5, name: 'john doe' });
			test.pass('build ran');
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function (query, data, mysql) {
			test.equal(query, 'QUERY');
			test.deepEqual(data, [ 22 ]);
			test.equal(mysql, Model.connection);
			test.pass('query ran');
			return Promise.resolve();
		};

		model._promiseValidateSchema = function () {
			test.pass('_promiseValidateSchema ran');
			return Promise.resolve();
		};

		model.delete((err, result) => {
			test.error(err);
			test.equal(result, model);
			test.equal(result.get('id'), '5');
			test.end();
		});

	});

	t.test('no primaries', (test) => {
		test.plan(11);

		var Model = quell('users', {
			connection: mockConnection(),
			schema: {
				columns: {
					id: quell.INT(),
					name: quell.VARCHAR(),
				},
				primaries: [],
			},
		});

		var model = new Model({ id: 5, name: 'john doe', city: 'San Diego' });

		quell._buildDeleteQuery = function (tablename, lookup) {
			test.equal(tablename, 'users');
			test.deepEqual(lookup, { id: 5, name: 'john doe' });
			test.pass('build ran');
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function (query, data, mysql) {
			test.equal(query, 'QUERY');
			test.deepEqual(data, [ 22 ]);
			test.equal(mysql, Model.connection);
			test.pass('query ran');
			return Promise.resolve();
		};

		model._promiseValidateSchema = function () {
			test.pass('_promiseValidateSchema ran');
			return Promise.resolve();
		};

		model.delete((err, result) => {
			test.error(err);
			test.equal(result, model);
			test.equal(result.get('id'), '5');
			test.end();
		});

	});

	t.test('no primaries, no data', (test) => {
		test.plan(4);

		var Model = quell('users', {
			connection: mockConnection(),
			schema: {
				columns: {
					id: quell.INT(),
					name: quell.VARCHAR(),
				},
				primaries: [],
			},
		});

		var model = new Model({});

		quell._buildDeleteQuery = function () {
			test.fail('build ran');
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function () {
			test.fail('query ran');
			return Promise.resolve();
		};

		model._promiseValidateSchema = function () {
			test.pass('_promiseValidateSchema ran');
			return Promise.resolve();
		};

		model.delete((err, result) => {
			test.equal(err.message, 'Could not delete quell record, no data was available to delete against.');
			test.pass('callback invoked');
			test.ok(!result);
			test.end();
		});

	});

});
