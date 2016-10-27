var quell = require('../');

var mockConnection = function (test, expectedQuery, expectedData, returnValue) {
	return {
		query: function (query, data, callback) {
			if (expectedQuery !== undefined) {test.strictEqual(query, expectedQuery);}
			if (expectedData !== undefined) {test.deepEqual(data, expectedData);}
			test.ok(true, 'Mysql query was called');
			callback(null, returnValue);
		}
	};
};

exports['loads and is function'] = function (test) {
	test.equal(typeof quell, 'function');
	test.equal(typeof quell._model, 'function');
	test.done();
};

exports['create model'] = function (test) {
	var m = quell('users');

	test.equal(typeof m, 'function');
	test.equal(typeof m.find, 'function');
	test.strictEqual(m.prototype.tablename, 'users');
	test.strictEqual(m.prototype.schema, undefined);

	test.done();
};

exports['create model without tablename'] = function (test) {
	test.throws(function () {
		quell();
	}, 'Tablename must be a string.');

	test.done();
};

exports['create model with object without tablename'] = function (test) {
	test.throws(function () {
		quell({});
	}, 'Tablename must be a string.');

	test.done();
};

exports['create model with empty tablename'] = function (test) {
	test.throws(function () {
		quell('');
	}, 'Tablename must be a string.');

	test.done();
};

exports['initialize model'] = function (test) {
	var Model = quell('users', {
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

	var Model = quell('users');
	Model.connection = mockConnection();

	var model = new Model();

	test.done();
};

exports['initialize model with quell connection'] = function (test) {
	quell.connection = mockConnection();
	var Model = quell('users');

	var model = new Model();

	test.done();

	quell.connection = undefined;
};

exports['initialize model with connection via options'] = function (test) {
	var Model = quell('users');

	var model = new Model({}, {connection: mockConnection()});

	test.done();
};

exports['model initialize with plain object'] = function (test) {
	var Model = quell('users');
	var model = new Model({id:1, name:'john doe'});

	test.strictEqual(model.data.id, 1);
	test.strictEqual(model.data.name, 'john doe');
	test.deepEqual(model.changed, {});
	test.deepEqual(model._previousData, {});

	test.done();

};

exports['model set plain object'] = function (test) {
	var Model = quell('users');
	var model = new Model();

	model.set({id:1, name:'john doe'});

	test.strictEqual(model.data.id, 1);
	test.strictEqual(model.data.name, 'john doe');
	test.deepEqual(model.changed, {id:1, name:'john doe'});
	test.deepEqual(model._previousData, {});

	test.done();

};

exports['model initialized with plain object sets new values'] = function (test) {
	var Model = quell('users');
	var model = new Model({id:1, name:'john doe'});

	model.set('name', 'jane doe');

	test.strictEqual(model.data.id, 1);
	test.strictEqual(model.data.name, 'jane doe');
	test.deepEqual(model.changed, {name: 'jane doe'});
	test.deepEqual(model._previousData, {id:1, name:'john doe'});

	test.done();

};

exports['model initialized with plain object sets nothing'] = function (test) {
	var Model = quell('users');
	var model = new Model({id:1, name:'john doe'});

	model.set();

	test.strictEqual(model.data.id, 1);
	test.strictEqual(model.data.name, 'john doe');
	test.deepEqual(model.changed, {});
	test.deepEqual(model._previousData, {});

	test.done();

};

exports['model initialized with plain object unsets value'] = function (test) {
	var Model = quell('users');
	var model = new Model({id:1, name:'john doe'});

	model.unset('name');

	test.strictEqual(model.data.id, 1);
	test.strictEqual(model.data.name, undefined);
	test.deepEqual(model.changed, {name: undefined});
	test.deepEqual(model._previousData, {id:1, name:'john doe'});

	test.done();

};

exports['model initialized with plain object sets null value'] = function (test) {
	var Model = quell('users');
	var model = new Model({id:1, name:'john doe'});

	model.set('name', null);

	test.strictEqual(model.data.id, 1);
	test.strictEqual(model.data.name, null);
	test.deepEqual(model.changed, {name: null});
	test.deepEqual(model._previousData, {id:1, name:'john doe'});

	test.done();

};

exports['model initialized with plain object sets same value, silently'] = function (test) {
	var Model = quell('users');
	var model = new Model({id:1, name:'john doe'});

	model.set('name', 'john doe', {silent: true});

	test.strictEqual(model.data.id, 1);
	test.strictEqual(model.data.name, 'john doe');
	test.deepEqual(model.changed, {});
	test.deepEqual(model._previousData, {id:1, name:'john doe'});

	test.done();

};

exports['model initialized with plain object, gets value'] = function (test) {
	var Model = quell('users');
	var model = new Model({id:1, name:'john doe'});

	test.strictEqual(model.get('name'), 'john doe');

	test.strictEqual(model.data.name, 'john doe');
	

	test.done();

};

exports['model initialized with plain object checks for value existence'] = function (test) {
	var Model = quell('users');
	var model = new Model({id:1, name:'john doe'});

	test.strictEqual(model.has('name'), true);

	test.done();

};
