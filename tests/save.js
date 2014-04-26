var assign = require('lodash.assign');
var quell = require('../quell');
var Promise = require('es6-promise').Promise;

function logError (err) {
	var error = { error: assign({ message: err.message, stack: (err.stack || '').split('\n').slice(1).map(function (v) { return '' + v + ''; }) }, err)};
	console.log(error);
}

exports['save, no arguments, exist unset, pIE returns reuw'] = function (test) {
	test.expect(2);
	var Model = quell('users');
	var model = new Model({id: 1, name: 'john doe'});

	model._promiseIfExists = function () {
		return Promise.resolve(true);
	};

	model.insert = function () {
		test.ok(false, 'Called wrong save method');
	};

	model.update = function () {
		test.ok(true, 'Called correct save method');
		return Promise.resolve(model);
	};

	model.save().then(function (actual) {
		test.equal(actual, model);
		test.done();
	}, function (err) {
		console.error(err);
		test.ok(false, 'promise rejected');
		test.done();
	});

};

exports['save, no arguments, exists true'] = function (test) {
	test.expect(2);
	var Model = quell('users');
	var model = new Model({id: 1, name: 'john doe'});
	model.exists = true;

	model._promiseIfExists = function () {
		test.ok(false, 'Should not have called promiseIfExists');
		return Promise.reject();
	};

	model.insert = function () {
		test.ok(false, 'Called wrong save method');
	};

	model.update = function () {
		test.ok(true, 'Called correct save method');
		return Promise.resolve(model);
	};

	model.save().then(function (actual) {
		test.equal(actual, model);
		test.done();
	}, function (err) {
		console.error(err);
		test.ok(false, 'promise rejected');
		test.done();
	});

};

exports['save, no arguments, exists false'] = function (test) {
	test.expect(2);
	var Model = quell('users');
	var model = new Model({id: 1, name: 'john doe'});
	model.exists = false;

	model._promiseIfExists = function () {
		test.ok(false, 'Should not have called promiseIfExists');
		return Promise.reject();
	};

	model.update = function () {
		test.ok(false, 'Called wrong save method');
	};

	model.insert = function () {
		test.ok(true, 'Called correct save method');
		return Promise.resolve(model);
	};

	model.save().then(function (actual) {
		test.equal(actual, model);
		test.done();
	}, function (err) {
		console.error(err);
		test.ok(false, 'promise rejected');
		test.done();
	});

};

exports['save, callback, exists false'] = function (test) {
	test.expect(5);
	var Model = quell('users');
	var model = new Model({id: 1, name: 'john doe'});
	model.exists = false;

	model._promiseIfExists = function () {
		test.ok(false, 'Should not have called promiseIfExists');
		return Promise.reject();
	};

	model.update = function () {
		test.ok(false, 'Called wrong save method');
	};

	model.insert = function (options, callback) {
		test.ok(true, 'Called correct save method');
		test.deepEqual(options, {});
		test.strictEqual(typeof callback, 'function');
		callback(null, model);
		return Promise.resolve(model);
	};

	model.save(function (err, actual) {
		test.strictEqual(err, null);
		test.equal(actual, model);
		test.done();
	});

};

exports['save, options object, replace true, exists undefined'] = function (test) {
	test.expect(3);
	var Model = quell('users');
	var model = new Model({id: 1, name: 'john doe'});
	// model.exists = true;

	model._promiseIfExists = function () {
		test.ok(false, 'Should not have called promiseIfExists');
		return Promise.reject();
	};

	model.update = function () {
		test.ok(false, 'Called wrong save method');
	};

	model.insert = function (options) {
		test.deepEqual(options, {replace: true, callback: undefined});
		test.ok(true, 'Called correct save method');
		return Promise.resolve(model);
	};

	model.save({replace: true}).then(function (actual) {
		test.equal(actual, model);
		test.done();
	}, function (err) {
		console.error(err);
		test.ok(false, 'promise rejected');
		test.done();
	});

};

exports._promiseIfExists = {
	setUp: function (done) {
		this.backup = assign({}, quell);
		done();
	},

	'ok - found': function (test) {
		test.expect(11);

		var mockConnection = {query: true};

		var Model = quell('users', {
			connection: mockConnection,
			schema: {
				columns: {
					id: quell.INT(),
					name: quell.VARCHAR()
				},
				primaries: ['id']
			}
		});

		var model = new Model({id: 5, name: 'john doe'});

		quell._buildSelectQuery = function (tablename, lookup, select) {
			test.strictEqual(tablename, 'users');
			test.deepEqual(lookup, {id: 5});
			test.deepEqual(select, ['id']);
			test.ok(true, 'build ran');
			return {query: "QUERY", data: [22]};
		};

		quell._promiseQueryRun = function (query, data, mysql) {
			test.equal(query, 'QUERY');
			test.deepEqual(data, [22]);
			test.equal(mysql, mockConnection);
			test.ok(true, 'query ran');
			return Promise.resolve([
				{id: 5}
			]);
		};

		model._promiseIfExists().then(function (result) {
			test.equal(result, true);
			test.equal(model.exists, true);
			test.ok(true, 'promise resolved');
			test.done();
		}, function (err) {
			logError(err);
			test.ok(false, 'promise rejected');
			test.done();
		});
	},

	'ok - not found': function (test) {
		test.expect(11);

		var mockConnection = {query: true};

		var Model = quell('users', {
			connection: mockConnection,
			schema: {
				columns: {
					id: quell.INT(),
					name: quell.VARCHAR()
				},
				primaries: ['id']
			}
		});

		var model = new Model({id: 5, name: 'john doe'});

		quell._buildSelectQuery = function (tablename, lookup, select) {
			test.strictEqual(tablename, 'users');
			test.deepEqual(lookup, {id: 5});
			test.deepEqual(select, ['id']);
			test.ok(true, 'build ran');
			return {query: "QUERY", data: [22]};
		};

		quell._promiseQueryRun = function (query, data, mysql) {
			test.equal(query, 'QUERY');
			test.deepEqual(data, [22]);
			test.equal(mysql, mockConnection);
			test.ok(true, 'query ran');
			return Promise.resolve([]);
		};

		model._promiseIfExists().then(function (result) {
			test.equal(result, false);
			test.equal(model.exists, false);
			test.ok(true, 'promise resolved');
			test.done();
		}, function (err) {
			logError(err);
			test.ok(false, 'promise rejected');
			test.done();
		});
	},

	'missing primaries': function (test) {

		var mockConnection = {query: true};

		var Model = quell('users', {
			connection: mockConnection,
			schema: {
				columns: {
					id: quell.INT(),
					name: quell.VARCHAR()
				},
				primaries: ['id']
			}
		});

		var model = new Model();

		quell._buildSelectQuery = function () {
			test.ok(false, 'build ran');
			return {query: "QUERY", data: [22]};
		};

		quell._promiseQueryRun = function () {
			test.ok(false, 'query ran');
			return Promise.resolve([]);
		};

		model._promiseIfExists().then(function (result) {
			test.strictEqual(result, false);
			test.strictEqual(model.exists, false);
			test.deepEqual(model.changed, {});
			test.ok(true, 'promise resolved');
			test.done();
		}, function () {
			test.ok(false, 'promise rejected');
			test.done();
		});
	},

	'no primaries, unknown state': function (test) {

		var mockConnection = {query: true};

		var Model = quell('users', {
			connection: mockConnection,
			schema: {
				columns: {
					id: quell.INT(),
					name: quell.VARCHAR()
				},
				primaries: []
			}
		});

		var model = new Model();

		quell._buildSelectQuery = function () {
			test.ok(false, 'build ran');
			return {query: "QUERY", data: [22]};
		};

		quell._promiseQueryRun = function () {
			test.ok(false, 'query ran');
			return Promise.resolve([]);
		};

		model._promiseIfExists().then(function (result) {
			test.strictEqual(result, false);
			test.strictEqual(model.exists, null);
			test.deepEqual(model.changed, {});
			test.ok(true, 'promise resolved');
			test.done();
		}, function () {
			test.ok(false, 'promise rejected');
			test.done();
		});
	},

	'no primaries, known exists': function (test) {

		var mockConnection = {query: true};

		var Model = quell('users', {
			connection: mockConnection,
			schema: {
				columns: {
					id: quell.INT(),
					name: quell.VARCHAR()
				},
				primaries: []
			}
		});

		var model = new Model();
		model.exists = true;

		quell._buildSelectQuery = function () {
			test.ok(false, 'build ran');
			return {query: "QUERY", data: [22]};
		};

		quell._promiseQueryRun = function () {
			test.ok(false, 'query ran');
			return Promise.resolve([]);
		};

		model._promiseIfExists().then(function (result) {
			test.strictEqual(result, true);
			test.strictEqual(model.exists, true);
			test.deepEqual(model.changed, {});
			test.ok(true, 'promise resolved');
			test.done();
		}, function () {
			test.ok(false, 'promise rejected');
			test.done();
		});
	},

	tearDown: function (done) {
		assign(quell, this.backup);
		done();
	}
};

