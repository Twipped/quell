
var quell = require('../');
var Promise = require('es6-promise').Promise;

function logError (err) {
	var error = {
		error: Object.assign({
			message: err.message,
			stack: (err.stack || '').split('\n').slice(1).map((v) => '' + v + ''),
		}, err),
	};
	console.log(error);
}

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

exports['model.find with promise and connection'] = function (test) {
	var Model = quell('users');
	var con = mockConnection(test, 'SELECT * FROM `users` WHERE id = ?', [ 1 ], [ { id: 1, name: 'john doe' } ]);

	test.expect(5);
	Model.find({ id: 1 }).exec(con).then((actual) => {
		test.deepEqual(actual[0].data, { id: 1, name: 'john doe' });
		test.ok(true);
		test.done();
	}, (err) => {
		console.error(err);
		test.ok(false, 'Promise rejected');
		test.done();
	});

};

exports['model.find with promise and implicit connection'] = function (test) {
	var Model = quell('users');
	var con = mockConnection(test, 'SELECT * FROM `users` WHERE id = ?', [ 1 ], [ { id: 1, name: 'john doe' } ]);

	test.expect(5);
	Model.connection = con;
	Model.find({ id: 1 }).exec().then((actual) => {
		test.deepEqual(actual[0].data, { id: 1, name: 'john doe' });
		test.ok(true);
		test.done();
	}, (err) => {
		console.error(err);
		test.ok(false, 'Promise rejected');
		test.done();
	});

};

exports['model.find with promise and no connection'] = function (test) {
	var Model = quell('users');

	test.expect(1);
	test.throws(() => {
		Model.find({ id: 1 }).exec();
	});

	test.done();
};

exports['model.find with callback and connection'] = function (test) {
	var Model = quell('users');
	var con = mockConnection(test, 'SELECT * FROM `users` WHERE id = ?', [ 1 ], [ { id: 1, name: 'john doe' } ]);

	test.expect(6);
	Model.find({ id: 1 }).exec(con, (err, actual) => {
		test.equal(err, null);
		test.deepEqual(actual[0].data, { id: 1, name: 'john doe' });
		test.ok(true);
		test.done();
	});

};

exports['model.find with callback and implicit connection'] = function (test) {
	var Model = quell('users');
	var con = mockConnection(test, 'SELECT * FROM `users` WHERE id = ?', [ 1 ], [ { id: 1, name: 'john doe' } ]);

	test.expect(6);
	Model.connection = con;
	Model.find({ id: 1 }).exec((err, actual) => {
		test.equal(err, null);
		test.deepEqual(actual[0].data, { id: 1, name: 'john doe' });
		test.ok(true);
		test.done();
	});

};


exports['model.loadSchema'] = {
	setUp (done) {
		this._promiseTableSchemaBackup = quell._promiseTableSchema;

		done();
	},

	'using promise': function (test) {

		var mockConnection = {
			query () {
				test.ok(false, 'Query should not have been called');
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

		Model.loadSchema().then((result) => {
			test.equal(result, Model);
			test.deepEqual(Model.schema, mockSchema);
			test.ok(true, 'promise resolved');
			test.done();
		}, (err) => {
			logError(err);
			test.ok(false, 'promise rejected');
			test.done();
		});
	},

	tearDown (done) {
		quell._promiseTableSchema = this._promiseTableSchemaBackup;
		done();
	},
};
