
var suite = require('tapsuite');
var quell = require('../');

var mockConnection = function (test, expectedQuery, expectedData, returnValue) {
	return {
		query (query, data, callback) {
			if (expectedQuery !== undefined) { test.strictEqual(query, expectedQuery); }
			if (expectedData !== undefined) { test.deepEqual(data, expectedData); }
			test.ok(true, 'Mysql query was called');
			callback(null, returnValue);
		},
	};
};

suite('insert', (s) => {
	s.before((done) => {
		this.backup = Object.assign({}, quell);
		done();
	});

	s.after((done) => {
		Object.assign(quell, this.backup);
		done();
	});

	s.test('using promise', (test) => {
		test.plan(12);

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

		var model = new Model({ name: 'john doe', email: undefined });

		quell._buildInsertQuery = function (tablename, write, replace) {
			test.strictEqual(tablename, 'users');
			test.deepEqual(write, { name: 'john doe' }, 'written data');
			test.equal(replace, undefined);
			test.ok(true, 'build ran');
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function (query, data, mysql) {
			test.equal(query, 'QUERY');
			test.deepEqual(data, [ 22 ]);
			test.equal(mysql, Model.connection);
			test.ok(true, 'query ran');
			return Promise.resolve({ insertId: 5 });
		};

		model._promiseValidateSchema = function () {
			test.ok(true, '_promiseValidateSchema ran');
			return Promise.resolve();
		};



		model.insert().then((result) => {
			test.equal(result, model);
			test.equal(result.get('id'), '5');
			test.ok(true, 'promise resolved');
			test.end();
		}, (err) => {
			console.error(err);
			test.ok(false, 'promise rejected');
			test.end();
		});

	});

	s.test('using callback', (test) => {
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

		var model = new Model({ name: 'john doe' });

		quell._buildInsertQuery = function (tablename, write, replace) {
			test.strictEqual(tablename, 'users');
			test.deepEqual(write, { name: 'john doe' }, 'written data');
			test.equal(replace, undefined);
			test.ok(true, 'build ran');
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function (query, data, mysql) {
			test.equal(query, 'QUERY');
			test.deepEqual(data, [ 22 ]);
			test.equal(mysql, Model.connection);
			test.ok(true, 'query ran');
			return Promise.resolve({ insertId: 5 });
		};

		model._promiseValidateSchema = function () {
			test.ok(true, '_promiseValidateSchema ran');
			return Promise.resolve();
		};

		model.insert((err, result) => {
			test.equal(err, null);
			test.equal(result, model);
			test.equal(result.get('id'), '5');
			test.ok(true, 'callback invoked');
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

		var model = new Model({ name: 'john doe' });
		var mockError = { error: 'THIS IS AN ERROR' };

		quell._buildInsertQuery = function () {
			test.ok(false, 'build ran');
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function () {
			test.ok(false, 'query ran');
			return Promise.resolve({ insertId: 5 });
		};

		model._promiseValidateSchema = function () {
			test.ok(true, '_promiseValidateSchema ran');
			return Promise.reject(mockError);
		};

		model.insert((err, result) => {
			test.equal(err, mockError);
			test.equal(result, undefined);
			test.ok(true, 'callback invoked');
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

		var model = new Model({ name: 'john doe' });
		var mockError = { error: 'THIS IS AN ERROR' };

		quell._buildInsertQuery = function () {
			test.ok(true, 'build ran');
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function (query, data, mysql) {
			test.equal(query, 'QUERY');
			test.deepEqual(data, [ 22 ]);
			test.equal(mysql, Model.connection);
			test.ok(true, 'query ran');
			return Promise.reject(mockError);
		};

		model._promiseValidateSchema = function () {
			return Promise.resolve();
		};

		model.insert((err, result) => {
			test.equal(err, mockError);
			test.equal(result, undefined);
			test.ok(true, 'callback invoked');
			test.end();
		});

	});

	s.test('without autoincrement', (test) => {
		test.plan(13);

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

		quell._buildInsertQuery = function (tablename, write, replace) {
			test.strictEqual(tablename, 'users');
			test.deepEqual(write, { name: 'john doe' }, 'written data');
			test.equal(replace, undefined);
			test.ok(true, 'build ran');
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function (query, data, mysql) {
			test.equal(query, 'QUERY');
			test.deepEqual(data, [ 22 ]);
			test.equal(mysql, Model.connection);
			test.ok(true, 'query ran');
			return Promise.resolve({ insertId: 5 });
		};

		model._promiseValidateSchema = function () {
			test.ok(true, '_promiseValidateSchema ran');
			return Promise.resolve();
		};

		model.insert((err, result) => {
			test.equal(err, null);
			test.equal(result, model);
			test.equal(result.get('id'), null);
			test.ok(true, 'callback invoked');
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

		quell._buildInsertQuery = function (tablename, write, replace) {
			test.strictEqual(tablename, 'users');
			test.deepEqual(write, { name: 'john doe' }, 'written data');
			test.equal(replace, undefined);
			test.ok(true, 'build ran');
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function (query, data, mysql) {
			test.equal(query, 'QUERY');
			test.deepEqual(data, [ 22 ]);
			test.equal(mysql, Model.connection);
			test.ok(true, 'query ran');
			return Promise.resolve({ insertId: 5 });
		};

		model._promiseValidateSchema = function () {
			test.ok(true, '_promiseValidateSchema ran');
			return Promise.resolve();
		};

		model.insert((err, result) => {
			test.equal(err, null);
			test.equal(result, model);
			test.equal(result.get('id'), '5');
			test.ok(true, 'callback invoked');
			test.end();
		});

	});

	s.test('as replace', (test) => {
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

		var model = new Model({ id: 5, name: 'john doe' });

		quell._buildInsertQuery = function (tablename, write, replace) {
			test.strictEqual(tablename, 'users');
			test.deepEqual(write, { id: 5, name: 'john doe' }, 'written data');
			test.equal(replace, true);
			test.ok(true, 'build ran');
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function (query, data, mysql) {
			test.equal(query, 'QUERY');
			test.deepEqual(data, [ 22 ]);
			test.equal(mysql, Model.connection);
			test.ok(true, 'query ran');
			return Promise.resolve();
		};

		model._promiseValidateSchema = function () {
			test.ok(true, '_promiseValidateSchema ran');
			return Promise.resolve();
		};

		model.insert({ replace: true }, (err, result) => {
			test.equal(err, null);
			test.equal(result, model);
			test.equal(result.get('id', false), 5);
			test.ok(true, 'callback invoked');
			test.end();
		});

	});
});
