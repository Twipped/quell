var provider = require('nodeunit-dataprovider');
var seaquell = require('../seaquell');
var Promise = require('es6-promise').Promise;


exports['save, no arguments, exist unset, pIE returns reuw'] = function (test) {
	test.expect(2);
	var Model = seaquell('users');
	var model = new Model({id:1, name:'john doe'});

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
	var Model = seaquell('users');
	var model = new Model({id:1, name:'john doe'});
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
	var Model = seaquell('users');
	var model = new Model({id:1, name:'john doe'});
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
	var Model = seaquell('users');
	var model = new Model({id:1, name:'john doe'});
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
	var Model = seaquell('users');
	var model = new Model({id:1, name:'john doe'});
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