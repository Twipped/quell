var provider = require('nodeunit-dataprovider');
var seaquell = require('../seaquell');

var mockConnection = function (test, expectedQuery, expectedData, returnValue) {
	return {
		query: function (query, data, callback) {
			if (expectedQuery !== undefined) test.strictEqual(query, expectedQuery);
			if (expectedData !== undefined) test.deepEqual(data, expectedData);
			test.ok(true, 'Mysql query was called');
			callback(null, returnValue);
		}
	};
};

exports['loads and is function'] = function (test) {
	test.equal(typeof seaquell, 'function');
	test.equal(typeof seaquell._model, 'function');
	test.done();
};

exports['create model'] = function (test) {
	var m = seaquell('users');

	test.equal(typeof m, 'function');
	test.equal(typeof m.find, 'function');
	test.strictEqual(m.prototype.tablename, 'users');
	test.strictEqual(m.prototype.schema, undefined);

	test.done();
};

exports['create model without tablename'] = function (test) {
	test.throws(function () {
		var m = seaquell();
	}, 'Tablename must be a string.');

	test.done();
};

exports['create model with object without tablename'] = function (test) {
	test.throws(function () {
		var m = seaquell({});
	}, 'Tablename must be a string.');

	test.done();
};

exports['create model with empty tablename'] = function (test) {
	test.throws(function () {
		var m = seaquell('');
	}, 'Tablename must be a string.');

	test.done();
};

exports['initialize model'] = function (test) {
	var Model = seaquell('users', {
		connection: mockConnection(),
		initialize: function () {
			test.ok(true, 'Initialized');
		}
	});

	test.expect(4);

	var model = new Model();

	test.deepEqual(model.data, {});
	test.deepEqual(model.changed, {});
	test.deepEqual(model._previousData, {});

	test.done();
};

exports['initialize model with static connection'] = function (test) {

	var Model = seaquell('users');
	Model.connection = mockConnection();

	var model = new Model();

	test.done();
};

exports['initialize model with seaquell connection'] = function (test) {
	seaquell.connection = mockConnection();
	var Model = seaquell('users');

	var model = new Model();

	test.done();

	seaquell.connection = undefined;
};

exports['initialize model with connection via options'] = function (test) {
	var Model = seaquell('users');

	var model = new Model({}, {connection: mockConnection()});

	test.done();
};

exports['model.find'] = function (test) {
	var Model = seaquell('users');
	var con = mockConnection(test, 'SELECT * FROM `users` WHERE id = ?', [1], [{id:1, name:'john doe'}]);

	test.expect(5);
	Model.find({id:1}).run(con).then(function (actual) {
		test.deepEqual(actual[0].data, {id:1, name:'john doe'});
		test.ok(true);
		test.done();
	}, function (err) {
		console.error(err);
		test.ok(false, 'Promise rejected');
		test.done();
	});

};