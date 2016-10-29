
var suite = require('tapsuite');
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

test('model.find with promise and connection', (test) => {
	var Model = quell('users');
	var con = mockConnection(test, 'SELECT * FROM `users` WHERE id = ?', [ 1 ], [ { id: 1, name: 'john doe' } ]);

	test.plan(4);
	return Model.find({ id: 1 }).exec(con).then((actual) => {
		test.deepEqual(actual[0].data, { id: 1, name: 'john doe' });
	});

});

test('model.find with promise and implicit connection', (test) => {
	var Model = quell('users');
	var con = mockConnection(test, 'SELECT * FROM `users` WHERE id = ?', [ 1 ], [ { id: 1, name: 'john doe' } ]);

	test.plan(4);
	Model.connection = con;
	return Model.find({ id: 1 }).exec().then((actual) => {
		test.deepEqual(actual[0].data, { id: 1, name: 'john doe' });
	});

});

test('model.find with promise and no connection', (test) => {
	var Model = quell('users');

	test.plan(1);
	return Model.find({ id: 1 }).exec()
		.then(() => test.fail('Promise should have rejected'))
		.catch((err) => {
			test.equal(err.message, 'You must provide a node-mysql connection or pool for this query to use.');
		});
});

test('model.find with callback and connection', (test) => {
	var Model = quell('users');
	var con = mockConnection(test, 'SELECT * FROM `users` WHERE id = ?', [ 1 ], [ { id: 1, name: 'john doe' } ]);

	test.plan(5);
	Model.find({ id: 1 }).exec(con, (err, actual) => {
		test.error(err);
		test.deepEqual(actual[0].data, { id: 1, name: 'john doe' });
		test.end();
	});

});

test('model.find with callback and implicit connection', (test) => {
	var Model = quell('users');
	var con = mockConnection(test, 'SELECT * FROM `users` WHERE id = ?', [ 1 ], [ { id: 1, name: 'john doe' } ]);

	test.plan(5);
	Model.connection = con;
	Model.find({ id: 1 }).exec((err, actual) => {
		test.equal(err, null);
		test.deepEqual(actual[0].data, { id: 1, name: 'john doe' });
		test.end();
	});

});


suite('model.loadSchema', (t) => {

	t.before((done) => {
		this._promiseTableSchemaBackup = quell._promiseTableSchema;
		done();
	});


	t.after((done) => {
		quell._promiseTableSchema = this._promiseTableSchemaBackup;
		done();
	});

	t.test('using promise', (test) => {

		var mockConnection = {
			query () {
				test.fail('Query should not have been called');
			},
		};

		var mockSchema = {
			columns: {
				id: quell.INT(),
				name: quell.VARCHAR(),
			},
			primaries: [ 'id' ],
			autoincrement: 'id',
		};

		quell._promiseTableSchema = function () {
			return Promise.resolve(mockSchema);
		};

		var Model = quell('users', {
			connection: mockConnection,
		});

		return Model.loadSchema().then((result) => {
			test.equal(result, Model);
			test.deepEqual(Model.schema, mockSchema);
		});
	});
});
