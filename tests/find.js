var seaquell = require('../seaquell');

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

exports['model.find with promise and connection'] = function (test) {
	var Model = seaquell('users');
	var con = mockConnection(test, 'SELECT * FROM `users` WHERE id = ?', [1], [{id: 1, name: 'john doe'}]);

	test.expect(5);
	Model.find({id: 1}).exec(con).then(function (actual) {
		test.deepEqual(actual[0].data, {id: 1, name: 'john doe'});
		test.ok(true);
		test.done();
	}, function (err) {
		console.error(err);
		test.ok(false, 'Promise rejected');
		test.done();
	});

};

exports['model.find with promise and implicit connection'] = function (test) {
	var Model = seaquell('users');
	var con = mockConnection(test, 'SELECT * FROM `users` WHERE id = ?', [1], [{id: 1, name: 'john doe'}]);

	test.expect(5);
	Model.connection = con;
	Model.find({id: 1}).exec().then(function (actual) {
		test.deepEqual(actual[0].data, {id: 1, name: 'john doe'});
		test.ok(true);
		test.done();
	}, function (err) {
		console.error(err);
		test.ok(false, 'Promise rejected');
		test.done();
	});

};

exports['model.find with promise and no connection'] = function (test) {
	var Model = seaquell('users');

	test.expect(1);
	test.throws(function () {
		Model.find({id: 1}).exec();
	});

	test.done();
};

exports['model.find with callback and connection'] = function (test) {
	var Model = seaquell('users');
	var con = mockConnection(test, 'SELECT * FROM `users` WHERE id = ?', [1], [{id: 1, name: 'john doe'}]);

	test.expect(6);
	Model.find({id: 1}).exec(con, function (err, actual) {
		test.equal(err, null);
		test.deepEqual(actual[0].data, {id: 1, name: 'john doe'});
		test.ok(true);
		test.done();
	});

};

exports['model.find with callback and implicit connection'] = function (test) {
	var Model = seaquell('users');
	var con = mockConnection(test, 'SELECT * FROM `users` WHERE id = ?', [1], [{id: 1, name: 'john doe'}]);

	test.expect(6);
	Model.connection = con;
	Model.find({id: 1}).exec(function (err, actual) {
		test.equal(err, null);
		test.deepEqual(actual[0].data, {id: 1, name: 'john doe'});
		test.ok(true);
		test.done();
	});

};
