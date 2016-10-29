
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

test('save, no arguments, exist unset, pIE returns true', (test) => {
	test.plan(2);
	var Model = quell('users');
	var model = new Model({ id: 1, name: 'john doe' });

	model._promiseIfExists = function () {
		return Promise.resolve(true);
	};

	model.insert = function () {
		test.fail('Called wrong save method');
	};

	model.update = function () {
		test.pass('Called correct save method');
		return Promise.resolve(model);
	};

	model.save().then((actual) => {
		test.equal(actual, model);
		test.end();
	}, (err) => {
		console.error(err);
		test.fail('promise rejected');
		test.end();
	});

});

test('save, no arguments, exists true', (test) => {
	test.plan(2);
	var Model = quell('users');
	var model = new Model({ id: 1, name: 'john doe' });
	model.exists = true;

	model._promiseIfExists = function () {
		test.fail('Should not have called promiseIfExists');
		return Promise.reject();
	};

	model.insert = function () {
		test.fail('Called wrong save method');
	};

	model.update = function () {
		test.pass('Called correct save method');
		return Promise.resolve(model);
	};

	model.save().then((actual) => {
		test.equal(actual, model);
		test.end();
	}, (err) => {
		console.error(err);
		test.fail('promise rejected');
		test.end();
	});

});

test('save, no arguments, exists false', (test) => {
	test.plan(2);
	var Model = quell('users');
	var model = new Model({ id: 1, name: 'john doe' });
	model.exists = false;

	model._promiseIfExists = function () {
		test.fail('Should not have called promiseIfExists');
		return Promise.reject();
	};

	model.update = function () {
		test.fail('Called wrong save method');
	};

	model.insert = function () {
		test.pass('Called correct save method');
		return Promise.resolve(model);
	};

	model.save().then((actual) => {
		test.equal(actual, model);
		test.end();
	}, (err) => {
		console.error(err);
		test.fail('promise rejected');
		test.end();
	});

});

test('save, callback, exists false', (test) => {
	test.plan(5);
	var Model = quell('users');
	var model = new Model({ id: 1, name: 'john doe' });
	model.exists = false;

	model._promiseIfExists = function () {
		test.fail('Should not have called promiseIfExists');
		return Promise.reject();
	};

	model.update = function () {
		test.fail('Called wrong save method');
	};

	model.insert = function (options, callback) {
		test.pass('Called correct save method');
		test.deepEqual(options, { callback });
		test.strictEqual(typeof callback, 'function');
		callback(null, model);
		return Promise.resolve(model);
	};

	model.save((err, actual) => {
		test.strictEqual(err, null);
		test.equal(actual, model);
		test.end();
	});

});

test('save, options object, replace true, exists undefined', (test) => {
	test.plan(3);
	var Model = quell('users');
	var model = new Model({ id: 1, name: 'john doe' });
	// model.exists = true;

	model._promiseIfExists = function () {
		test.fail('Should not have called promiseIfExists');
		return Promise.reject();
	};

	model.update = function () {
		test.fail('Called wrong save method');
	};

	model.insert = function (options) {
		test.deepEqual(options, { replace: true, callback: undefined });
		test.pass('Called correct save method');
		return Promise.resolve(model);
	};

	model.save({ replace: true }).then((actual) => {
		test.equal(actual, model);
		test.end();
	}, (err) => {
		console.error(err);
		test.fail('promise rejected');
		test.end();
	});

});

suite('_promiseIfExists', (s) => {
	s.before((done) => {
		this.backup = Object.assign({}, quell);
		done();
	});

	s.after((done) => {
		Object.assign(quell, this.backup);
		done();
	});

	s.test('ok - found', (test) => {
		test.plan(11);

		var mockConnection = { query: true };

		var Model = quell('users', {
			connection: mockConnection,
			schema: {
				columns: {
					id: quell.INT(),
					name: quell.VARCHAR(),
				},
				primaries: [ 'id' ],
			},
		});

		var model = new Model({ id: 5, name: 'john doe' });

		quell._buildSelectQuery = function (tablename, lookup, select) {
			test.strictEqual(tablename, 'users');
			test.deepEqual(lookup, { id: 5 });
			test.deepEqual(select, [ 'id' ]);
			test.pass('build ran');
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function (query, data, mysql) {
			test.equal(query, 'QUERY');
			test.deepEqual(data, [ 22 ]);
			test.equal(mysql, mockConnection);
			test.pass('query ran');
			return Promise.resolve([
				{ id: 5 },
			]);
		};

		model._promiseIfExists().then((result) => {
			test.equal(result, true);
			test.equal(model.exists, true);
			test.pass('promise resolved');
			test.end();
		}, (err) => {
			logError(err);
			test.fail('promise rejected');
			test.end();
		});
	});

	s.test('ok - not found', (test) => {
		test.plan(11);

		var mockConnection = { query: true };

		var Model = quell('users', {
			connection: mockConnection,
			schema: {
				columns: {
					id: quell.INT(),
					name: quell.VARCHAR(),
				},
				primaries: [ 'id' ],
			},
		});

		var model = new Model({ id: 5, name: 'john doe' });

		quell._buildSelectQuery = function (tablename, lookup, select) {
			test.strictEqual(tablename, 'users');
			test.deepEqual(lookup, { id: 5 });
			test.deepEqual(select, [ 'id' ]);
			test.pass('build ran');
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function (query, data, mysql) {
			test.equal(query, 'QUERY');
			test.deepEqual(data, [ 22 ]);
			test.equal(mysql, mockConnection);
			test.pass('query ran');
			return Promise.resolve([]);
		};

		model._promiseIfExists().then((result) => {
			test.equal(result, false);
			test.equal(model.exists, false);
			test.pass('promise resolved');
			test.end();
		}, (err) => {
			logError(err);
			test.fail('promise rejected');
			test.end();
		});
	});

	s.test('missing primaries', (test) => {

		var mockConnection = { query: true };

		var Model = quell('users', {
			connection: mockConnection,
			schema: {
				columns: {
					id: quell.INT(),
					name: quell.VARCHAR(),
				},
				primaries: [ 'id' ],
			},
		});

		var model = new Model();

		quell._buildSelectQuery = function () {
			test.fail('build ran');
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function () {
			test.fail('query ran');
			return Promise.resolve([]);
		};

		model._promiseIfExists().then((result) => {
			test.strictEqual(result, false);
			test.strictEqual(model.exists, false);
			test.deepEqual(model.changed, {});
			test.pass('promise resolved');
			test.end();
		}, () => {
			test.fail('promise rejected');
			test.end();
		});
	});

	s.test('no primaries, unknown state', (test) => {

		var mockConnection = { query: true };

		var Model = quell('users', {
			connection: mockConnection,
			schema: {
				columns: {
					id: quell.INT(),
					name: quell.VARCHAR(),
				},
				primaries: [],
			},
		});

		var model = new Model();

		quell._buildSelectQuery = function () {
			test.fail('build ran');
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function () {
			test.fail('query ran');
			return Promise.resolve([]);
		};

		model._promiseIfExists().then((result) => {
			test.strictEqual(result, false);
			test.strictEqual(model.exists, null);
			test.deepEqual(model.changed, {});
			test.pass('promise resolved');
			test.end();
		}, () => {
			test.fail('promise rejected');
			test.end();
		});
	});

	s.test('no primaries, known exists', (test) => {

		var mockConnection = { query: true };

		var Model = quell('users', {
			connection: mockConnection,
			schema: {
				columns: {
					id: quell.INT(),
					name: quell.VARCHAR(),
				},
				primaries: [],
			},
		});

		var model = new Model();
		model.exists = true;

		quell._buildSelectQuery = function () {
			test.fail('build ran');
			return { query: 'QUERY', data: [ 22 ] };
		};

		quell._promiseQueryRun = function () {
			test.fail('query ran');
			return Promise.resolve([]);
		};

		model._promiseIfExists().then((result) => {
			test.strictEqual(result, true);
			test.strictEqual(model.exists, true);
			test.deepEqual(model.changed, {});
			test.pass('promise resolved');
			test.end();
		}, () => {
			test.fail('promise rejected');
			test.end();
		});
	});

});

