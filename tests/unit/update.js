
var suite = require('tapsuite');
var quell = require('../../');

var mockConnection = function (test, expectedQuery, expectedData, returnValue) {
	return {
		query (query, data, callback) {
			if (expectedQuery !== undefined) { test.strictEqual(query, expectedQuery); }
			if (expectedData !== undefined) { test.deepEqual(data, expectedData); }
			test.pass('Mysql query was called');
			callback(null, returnValue);
		},
	};
};

suite('update', (s) => {
	s.before((done) => {
		this.backup = Object.assign({}, quell);
		done();
	});

	s.after((done) => {
		Object.assign(quell, this.backup);
		done();
	});

	s.test('using promise', (test) => {
		test.plan(11);

		var Model = quell('users', {
			connection: mockConnection(),
			schema: {
				columns: {
					id: quell.INT(),
					name: quell.VARCHAR(),
					email: quell.VARCHAR(),
				},
				primaries: [ 'id' ],
				autoincrement: 'id',
			},
		});

		var model = new Model({ id: 5, name: 'john doe', email: undefined });

		quell._buildUpdateQuery = function (tablename, write, lookup) {
			test.strictEqual(tablename, 'users');
			test.deepEqual(write, { name: 'john doe' }, 'written data');
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



		model.update().then((result) => {
			test.equal(result, model);
			test.pass('promise resolved');
			test.end();
		}, (err) => {
			console.error(err);
			test.fail('promise rejected');
			test.end();
		});

	});

	s.test('using callback', (test) => {
		test.plan(12);

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

		quell._buildUpdateQuery = function (tablename, write, lookup) {
			test.strictEqual(tablename, 'users');
			test.deepEqual(write, { name: 'john doe' }, 'written data');
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

		model.update((err, result) => {
			test.equal(err, null);
			test.equal(result, model);
			test.pass('callback invoked');
			test.end();
		});

	});

	s.test('passes sql error through from _promiseValidateSchema', (test) => {
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

		quell._buildUpdateQuery = function () {
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

		model.update((err, result) => {
			test.equal(err, mockError);
			test.equal(result, undefined);
			test.pass('callback invoked');
			test.end();
		});

	});

	s.test('passes sql error through from _promiseQueryRun', (test) => {
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

		quell._buildUpdateQuery = function () {
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

		model.update((err, result) => {
			test.equal(err, mockError);
			test.equal(result, undefined);
			test.pass('callback invoked');
			test.end();
		});

	});

	s.test('missing primary key', (test) => {
		test.plan(3);

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

		quell._buildUpdateQuery = function () {
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

		model.update((err) => {
			test.equal(err.message, 'Could not update quell record, required primary key value was absent: id');
			test.pass('callback invoked');
			test.end();
		});

	});

	s.test('ignores non-schema data and autoincrement fields', (test) => {
		test.plan(13);

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

		quell._buildUpdateQuery = function (tablename, write, lookup) {
			test.strictEqual(tablename, 'users');
			test.deepEqual(write, { name: 'john doe' }, 'written data');
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

		model.update((err, result) => {
			test.equal(err, null);
			test.equal(result, model);
			test.equal(result.get('id'), '5');
			test.pass('callback invoked');
			test.end();
		});

	});
});
