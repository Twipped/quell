
var test = require('tap').test;
var quell = require('../');

var mockConnection = function (test, expectedQuery, expectedData, returnValue) {
	return {
		query (query, data, callback) {
			test.pass('Mysql query was called');
			if (expectedQuery !== undefined) { test.equal(query, expectedQuery); }
			if (expectedData !== undefined) { test.deepEqual(data, expectedData); }
			callback(null, returnValue);
		},
	};
};

test('loads and is function', (test) => {
	test.equal(typeof quell, 'function');
	test.equal(typeof quell._model, 'function');
	test.end();
});

test('create model', (test) => {
	var m = quell('users');

	test.equal(typeof m, 'function');
	test.equal(typeof m.find, 'function');
	test.equal(m.prototype.tablename, 'users');
	test.equal(m.prototype.schema, undefined);

	test.end();
});

test('create model without tablename', (test) => {
	test.throws(() => {
		quell();
	}, 'Tablename must be a string.');

	test.end();
});

test('create model with object without tablename', (test) => {
	test.throws(() => {
		quell({});
	}, 'Tablename must be a string.');

	test.end();
});

test('create model with empty tablename', (test) => {
	test.throws(() => {
		quell('');
	}, 'Tablename must be a string.');

	test.end();
});

test('initialize model', (test) => {
	var Model = quell('users', {
		connection: mockConnection(),
		initialize () {
			test.pass('Initialized');
		},
	});

	test.plan(4);

	var model = new Model();

	test.deepEqual(model.data, {});
	test.deepEqual(model.changed, {});
	test.deepEqual(model._previousData, {});

	test.end();
});

test('initialize model with static connection', (test) => {

	var Model = quell('users');
	Model.connection = mockConnection();

	var model = new Model();
	test.ok(model);

	test.end();
});

test('initialize model with quell connection', (test) => {
	quell.connection = mockConnection();
	var Model = quell('users');

	var model = new Model();
	test.ok(model);

	test.end();

	quell.connection = undefined;
});

test('initialize model with connection via options', (test) => {
	var Model = quell('users');

	var model = new Model({}, { connection: mockConnection() });
	test.ok(model);

	test.end();
});

test('model initialize with plain object', (test) => {
	var Model = quell('users');
	var model = new Model({ id: 1, name: 'john doe' });

	test.equal(model.data.id, 1);
	test.equal(model.data.name, 'john doe');
	test.deepEqual(model.changed, {});
	test.deepEqual(model._previousData, {});

	test.end();
});

test('model set plain object', (test) => {
	var Model = quell('users');
	var model = new Model();

	model.set({ id: 1, name: 'john doe' });

	test.equal(model.data.id, 1);
	test.equal(model.data.name, 'john doe');
	test.deepEqual(model.changed, { id: 1, name: 'john doe' });
	test.deepEqual(model._previousData, {});

	test.end();
});

test('model initialized with plain object sets new values', (test) => {
	var Model = quell('users');
	var model = new Model({ id: 1, name: 'john doe' });

	model.set('name', 'jane doe');

	test.equal(model.data.id, 1);
	test.equal(model.data.name, 'jane doe');
	test.deepEqual(model.changed, { name: 'jane doe' });
	test.deepEqual(model._previousData, { id: 1, name: 'john doe' });

	test.end();
});

test('model initialized with plain object sets nothing', (test) => {
	var Model = quell('users');
	var model = new Model({ id: 1, name: 'john doe' });

	model.set();

	test.equal(model.data.id, 1);
	test.equal(model.data.name, 'john doe');
	test.deepEqual(model.changed, {});
	test.deepEqual(model._previousData, {});

	test.end();
});

test('model initialized with plain object unsets value', (test) => {
	var Model = quell('users');
	var model = new Model({ id: 1, name: 'john doe' });

	model.unset('name');

	test.equal(model.data.id, 1);
	test.equal(model.data.name, undefined);
	test.deepEqual(model.changed, { name: undefined });
	test.deepEqual(model._previousData, { id: 1, name: 'john doe' });

	test.end();
});

test('model initialized with plain object sets null value', (test) => {
	var Model = quell('users');
	var model = new Model({ id: 1, name: 'john doe' });

	model.set('name', null);

	test.equal(model.data.id, 1);
	test.equal(model.data.name, null);
	test.deepEqual(model.changed, { name: null });
	test.deepEqual(model._previousData, { id: 1, name: 'john doe' });

	test.end();
});

test('model initialized with plain object sets same value, silently', (test) => {
	var Model = quell('users');
	var model = new Model({ id: 1, name: 'john doe' });

	model.set('name', 'john doe', { silent: true });

	test.equal(model.data.id, 1);
	test.equal(model.data.name, 'john doe');
	test.deepEqual(model.changed, {});
	test.deepEqual(model._previousData, { id: 1, name: 'john doe' });

	test.end();
});

test('model initialized with plain object, gets value', (test) => {
	var Model = quell('users');
	var model = new Model({ id: 1, name: 'john doe' });

	test.equal(model.get('name'), 'john doe');

	test.equal(model.data.name, 'john doe');

	test.end();

});

test('model initialized with plain object checks for value existence', (test) => {
	var Model = quell('users');
	var model = new Model({ id: 1, name: 'john doe' });

	test.equal(model.has('name'), true);

	test.end();
});
