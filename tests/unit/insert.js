
var suite = require('tapsuite');
var quell = require('../../');

var mockConnection = function (test, expectedQuery, expectedData, returnValue) {
	return {
		query (query, data, callback) {
			test.pass('Mysql query was called');
			if (expectedQuery !== undefined) { test.strictEqual(query, expectedQuery); }
			if (expectedData !== undefined) { test.deepEqual(data, expectedData); }
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

		var model = new Model({ name: 'john doe', email: undefined });

		model._promiseValidateSchema = function () {
			test.pass('called _promiseValidateSchema');
			return Promise.resolve();
		};

		quell._buildInsertQuery = function (tablename, write, replace) {
			test.pass('called _buildInsertQuery');
			test.strictEqual(tablename, 'users');
			test.deepEqual(write, { name: 'john doe' }, 'written data');
			test.equal(replace, undefined);
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function (query, data, mysql) {
			test.pass('called _promiseQueryRun');
			test.equal(query, 'QUERY');
			test.deepEqual(data, [ 22 ]);
			test.equal(mysql, Model.connection);
			return Promise.resolve({ insertId: 5 });
		};

		return model.insert().then((result) => {
			test.equal(result, model);
			test.equal(result.get('id'), '5');
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

		var model = new Model({ name: 'john doe' });

		model._promiseValidateSchema = function () {
			test.pass('_promiseValidateSchema ran');
			return Promise.resolve();
		};

		quell._buildInsertQuery = function (tablename, write, replace) {
			test.pass('called _buildInsertQuery');
			test.strictEqual(tablename, 'users');
			test.deepEqual(write, { name: 'john doe' }, 'written data');
			test.equal(replace, undefined);
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function (query, data, mysql) {
			test.pass('called _promiseQueryRun');
			test.equal(query, 'QUERY');
			test.deepEqual(data, [ 22 ]);
			test.equal(mysql, Model.connection);
			return Promise.resolve({ insertId: 5 });
		};

		model.insert((err, result) => {
			test.error(err);
			test.equal(result, model);
			test.equal(result.get('id'), '5');
			test.end();
		});

	});

	s.test('passes sql error through from _promiseValidateSchema', (test) => {
		test.plan(3);

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
			test.fail('called _buildInsertQuery');
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function () {
			test.fail('called _promiseQueryRun');
			return Promise.resolve({ insertId: 5 });
		};

		model._promiseValidateSchema = function () {
			test.pass('called _promiseValidateSchema');
			return Promise.reject(mockError);
		};

		model.insert((err, result) => {
			test.equal(err, mockError);
			test.equal(result, undefined);
			test.end();
		});

	});

	s.test('passes sql error through from _promiseQueryRun', (test) => {
		test.plan(6);

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

		model._promiseValidateSchema = function () {
			test.pass('called _promiseValidateSchema');
			return Promise.resolve();
		};

		quell._buildInsertQuery = function () {
			test.pass('called _buildInsertQuery');
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function (query, data, mysql) {
			test.pass('called _promiseQueryRun');
			test.deepEqual(data, [ 22 ]);
			test.equal(mysql, Model.connection);
			return Promise.reject(mockError);
		};

		return model.insert()
			.then(() => test.fail('promise should have rejected'))
			.catch((err) => {
				test.equal(err, mockError);
			});

	});

	s.test('without autoincrement', (test) => {
		test.plan(12);

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

		model._promiseValidateSchema = function () {
			test.pass('called _promiseValidateSchema');
			return Promise.resolve();
		};

		quell._buildInsertQuery = function (tablename, write, replace) {
			test.pass('called _buildInsertQuery');
			test.strictEqual(tablename, 'users');
			test.deepEqual(write, { name: 'john doe' }, 'written data');
			test.equal(replace, undefined);
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function (query, data, mysql) {
			test.pass('called _promiseQueryRun');
			test.equal(query, 'QUERY');
			test.deepEqual(data, [ 22 ]);
			test.equal(mysql, Model.connection);
			return Promise.resolve({ insertId: 5 });
		};

		model.insert((err, result) => {
			test.error(err);
			test.equal(result, model);
			test.equal(result.get('id'), null);
			test.end();
		});

	});

	s.test('ignores non-schema data and autoincrement fields', (test) => {
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

		var model = new Model({ id: 5, name: 'john doe', city: 'San Diego' });

		model._promiseValidateSchema = function () {
			test.pass('called _promiseValidateSchema');
			return Promise.resolve();
		};

		quell._buildInsertQuery = function (tablename, write, replace) {
			test.pass('called _promiseQueryRun');
			test.strictEqual(tablename, 'users');
			test.deepEqual(write, { name: 'john doe' }, 'written data');
			test.equal(replace, undefined);
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function (query, data, mysql) {
			test.pass('called _promiseQueryRun');
			test.equal(query, 'QUERY');
			test.deepEqual(data, [ 22 ]);
			test.equal(mysql, Model.connection);
			return Promise.resolve({ insertId: 5 });
		};

		model.insert((err, result) => {
			test.error(err);
			test.equal(result, model);
			test.equal(result.get('id'), '5');
			test.end();
		});

	});

	s.test('as replace', (test) => {
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

		model._promiseValidateSchema = function () {
			test.pass('called _promiseValidateSchema');
			return Promise.resolve();
		};

		quell._buildInsertQuery = function (tablename, write, replace) {
			test.pass('called _promiseQueryRun');
			test.strictEqual(tablename, 'users');
			test.deepEqual(write, { id: 5, name: 'john doe' }, 'written data');
			test.equal(replace, true);
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function (query, data, mysql) {
			test.pass('called _promiseQueryRun');
			test.equal(query, 'QUERY');
			test.deepEqual(data, [ 22 ]);
			test.equal(mysql, Model.connection);
			return Promise.resolve();
		};

		model.insert({ replace: true }, (err, result) => {
			test.error(err);
			test.equal(result, model);
			test.equal(result.get('id', false), 5);
			test.end();
		});

	});
});
