var provider = require('nodeunit-dataprovider');
var seaquell = require('../seaquell');
var Promise = require('es6-promise').Promise;


exports['load, 3 arg'] = function (test) {
	test.expect(5);
	var Model = seaquell('users');
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

	model.load('bob', 'name', function (err, actual) {
		test.equal(actual, model);
		test.strictEqual(err, null);
		test.done();
	});

};

exports['load, 2 arg, no callback'] = function (test) {
	test.expect(4);
	var Model = seaquell('users');
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

	model.load('bob', 'name').then(function (actual) {
		test.equal(actual, model);
		test.done();
	}, function (err) {
		test.ok(false, 'promise rejected');
		test.done();
	});

};

exports['load, 2 arg with callback'] = function (test) {
	test.expect(4);
	var Model = seaquell('users');
	var model = new Model();

	model._loadWithExisting = model._loadWithMultiColumn = model._loadWithSingleColumn = function () {
		test.ok(false, 'Called wrong load method');
	};

	model._loadWithPrimaryKey = function (value) {
		test.ok(true, 'Called correct load method');
		test.strictEqual(value, 'bob');
		return Promise.resolve(model);
	};

	model.load('bob', function (err, actual) {
		test.strictEqual(err, null);
		test.equal(actual, model);
		test.done();
	});

};

exports['load, 1 arg, no callback'] = function (test) {
	test.expect(3);
	var Model = seaquell('users');
	var model = new Model();

	model._loadWithExisting = model._loadWithMultiColumn = model._loadWithSingleColumn = function () {
		test.ok(false, 'Called wrong load method');
	};

	model._loadWithPrimaryKey = function (value) {
		test.ok(true, 'Called correct load method');
		test.strictEqual(value, 'bob');
		return Promise.resolve(model);
	};

	model.load('bob').then(function (actual) {
		test.equal(actual, model);
		test.done();
	}, function (err) {
		test.ok(false, 'promise rejected');
		test.done();
	});

};

exports['load, 1 arg, no callback, plain object'] = function (test) {
	test.expect(3);
	var Model = seaquell('users');
	var model = new Model();

	model._loadWithExisting = model._loadWithPrimaryKey = model._loadWithSingleColumn = function () {
		test.ok(false, 'Called wrong load method');
	};

	model._loadWithMultiColumn = function (value) {
		test.ok(true, 'Called correct load method');
		test.deepEqual(value, {id:1, name:'john doe'});
		return Promise.resolve(model);
	};

	model.load({id:1, name:'john doe'}).then(function (actual) {
		test.equal(actual, model);
		test.done();
	}, function (err) {
		test.ok(false, 'promise rejected');
		test.done();
	});

};

exports['load, 1 arg with callback'] = function (test) {
	test.expect(3);
	var Model = seaquell('users');
	var model = new Model({id:1, name:'john doe'});

	model._loadWithPrimaryKey = model._loadWithMultiColumn = model._loadWithSingleColumn = function () {
		test.ok(false, 'Called wrong load method');
	};

	model._loadWithExisting = function () {
		test.ok(true, 'Called correct load method');
		return Promise.resolve(model);
	};

	model.load(function (err, actual) {
		test.strictEqual(err, null);
		test.equal(actual, model);
		test.done();
	});

};

exports['load, no arguments'] = function (test) {
	test.expect(2);
	var Model = seaquell('users');
	var model = new Model({id:1, name:'john doe'});

	model._loadWithPrimaryKey = model._loadWithMultiColumn = model._loadWithSingleColumn = function () {
		test.ok(false, 'Called wrong load method');
	};

	model._loadWithExisting = function () {
		test.ok(true, 'Called correct load method');
		return Promise.resolve(model);
	};

	model.load().then(function (actual) {
		test.equal(actual, model);
		test.done();
	}, function (err) {
		test.ok(false, 'promise rejected');
		test.done();
	});

};

exports['save, no arguments, exist unset, pIE returns false'] = function (test) {
	test.expect(2);
	var Model = seaquell('users');
	var model = new Model({id:1, name:'john doe'});

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

	model.save().then(function (actual) {
		test.equal(actual, model);
		test.done();
	}, function (err) {
		console.error(err);
		test.ok(false, 'promise rejected');
		test.done();
	});

};