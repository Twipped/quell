var assign = require('lodash.assign');
var quell = require('../quell');
var Promise = require('es6-promise').Promise;

function logError (err) {
	var error = { error: assign({ message: err.message, stack: (err.stack || '').split('\n').slice(1).map(function (v) { return '' + v + ''; }) }, err)};
	console.log(error);
}


exports['load, 3 arg'] = function (test) {
	test.expect(5);
	var Model = quell('users');
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
	var Model = quell('users');
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
	var Model = quell('users');
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
	var Model = quell('users');
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
	var Model = quell('users');
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
	var Model = quell('users');
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
	var Model = quell('users');
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
	var Model = quell('users');
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
		logError(err);
		test.ok(false, 'promise rejected');
		test.done();
	});

};

exports['_loadWithExisting - fails without primaries'] = function (test) {
	test.expect(3);

	var Model = quell('users', {
		schema: {
			columns: {
				id: quell.INT(),
				name: quell.VARCHAR()
			},
			primaries: []
		}
	});

	var model = new Model({id: 1, name: 'john doe'});

	model._promiseValidateSchema = function () {
		test.ok(true, '_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function () {
		test.ok(false, 'called _loadUsing');
		return Promise.resolve();
	};

	model._loadWithExisting().then(function () {
		test.ok(false, 'promise resolved');
		test.done();
	}, function (err) {
		test.equal(err.message, 'Could not load quell model using existing data; table has no primary keys.');
		test.ok(true, 'promise rejected');
		test.done();
	});
};

exports['_loadWithExisting - fails without primary data'] = function (test) {
	test.expect(3);

	var Model = quell('users', {
		schema: {
			columns: {
				id: quell.INT(),
				name: quell.VARCHAR()
			},
			primaries: ['id']
		}
	});

	var model = new Model();

	model._promiseValidateSchema = function () {
		test.ok(true, '_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function () {
		test.ok(false, 'called _loadUsing');
		return Promise.resolve();
	};

	model._loadWithExisting().then(function () {
		test.ok(false, 'promise resolved');
		test.done();
	}, function (err) {
		test.equal(err.message, 'Could not load quell record, required primary key value was absent: id');
		test.ok(true, 'promise rejected');
		test.done();
	});
};

exports['_loadWithExisting - ok'] = function (test) {
	test.expect(4);

	var Model = quell('users', {
		schema: {
			columns: {
				id: quell.INT(),
				name: quell.VARCHAR()
			},
			primaries: ['id']
		}
	});

	var model = new Model({id: 5, name: 'john doe'});

	model._promiseValidateSchema = function () {
		test.ok(true, '_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function (lookup) {
		test.deepEqual(lookup, {id: 5});
		test.ok(true, 'called _loadUsing');
		return Promise.resolve();
	};

	model._loadWithExisting().then(function () {
		test.ok(true, 'promise resolved');
		test.done();
	}, function () {
		test.ok(false, 'promise rejected');
		test.done();
	});
};

exports['_loadWithPrimaryKey - ok'] = function (test) {
	test.expect(4);

	var Model = quell('users', {
		schema: {
			columns: {
				id: quell.INT(),
				name: quell.VARCHAR()
			},
			primaries: ['id']
		}
	});

	var model = new Model({id: 5, name: 'john doe'});

	model._promiseValidateSchema = function () {
		test.ok(true, '_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function (lookup) {
		test.deepEqual(lookup, {id: 10});
		test.ok(true, 'called _loadUsing');
		return Promise.resolve();
	};

	model._loadWithPrimaryKey(10).then(function () {
		test.ok(true, 'promise resolved');
		test.done();
	}, function () {
		test.ok(false, 'promise rejected');
		test.done();
	});
};

exports['_loadWithPrimaryKey - no primaries'] = function (test) {
	test.expect(3);

	var Model = quell('users', {
		schema: {
			columns: {
				id: quell.INT(),
				name: quell.VARCHAR()
			},
			primaries: []
		}
	});

	var model = new Model({id: 5, name: 'john doe'});

	model._promiseValidateSchema = function () {
		test.ok(true, '_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function (lookup) {
		test.deepEqual(lookup, {id: 10});
		test.ok(true, 'called _loadUsing');
		return Promise.resolve();
	};

	model._loadWithPrimaryKey().then(function () {
		test.ok(false, 'promise resolved');
		test.done();
	}, function (err) {
		test.equal(err.message, 'Could not load quell model using existing data; schema has no primary keys.');
		test.ok(true, 'promise rejected');
		test.done();
	});
};

exports['_loadWithPrimaryKey - too many primaries'] = function (test) {
	test.expect(3);

	var Model = quell('users', {
		schema: {
			columns: {
				id: quell.INT(),
				name: quell.VARCHAR()
			},
			primaries: ['id', 'city']
		}
	});

	var model = new Model({id: 5, name: 'john doe'});

	model._promiseValidateSchema = function () {
		test.ok(true, '_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function (lookup) {
		test.deepEqual(lookup, {id: 10});
		test.ok(true, 'called _loadUsing');
		return Promise.resolve();
	};

	model._loadWithPrimaryKey().then(function () {
		test.ok(false, 'promise resolved');
		test.done();
	}, function (err) {
		test.equal(err.message, 'Could not load quell model using single primary key, schema has more than one primary key.');
		test.ok(true, 'promise rejected');
		test.done();
	});
};


exports['_loadWithSingleColumn - ok'] = function (test) {
	test.expect(4);

	var Model = quell('users', {
		schema: {
			columns: {
				id: quell.INT(),
				name: quell.VARCHAR()
			},
			primaries: ['id']
		}
	});

	var model = new Model({id: 5, name: 'john doe'});

	model._promiseValidateSchema = function () {
		test.ok(true, '_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function (lookup) {
		test.deepEqual(lookup, {id: 10});
		test.ok(true, 'called _loadUsing');
		return Promise.resolve();
	};

	model._loadWithSingleColumn(10, 'id').then(function () {
		test.ok(true, 'promise resolved');
		test.done();
	}, function () {
		test.ok(false, 'promise rejected');
		test.done();
	});
};

exports['_loadWithSingleColumn - bad column'] = function (test) {
	test.expect(3);

	var Model = quell('users', {
		schema: {
			columns: {
				id: quell.INT(),
				name: quell.VARCHAR()
			},
			primaries: ['id']
		}
	});

	var model = new Model({id: 5, name: 'john doe'});

	model._promiseValidateSchema = function () {
		test.ok(true, '_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function (lookup) {
		test.deepEqual(lookup, {id: 10});
		test.ok(true, 'called _loadUsing');
		return Promise.resolve();
	};

	model._loadWithSingleColumn('San Diego', 'city').then(function () {
		test.ok(false, 'promise resolved');
		test.done();
	}, function (err) {
		test.equal(err.message, 'Could not load quell model, city does not exist in the table schema.');
		test.ok(true, 'promise rejected');
		test.done();
	});
};

exports['_loadWithMultiColumn - ok'] = function (test) {
	test.expect(4);

	var Model = quell('users', {
		schema: {
			columns: {
				id: quell.INT(),
				name: quell.VARCHAR()
			},
			primaries: ['id']
		}
	});

	var model = new Model();

	model._promiseValidateSchema = function () {
		test.ok(true, '_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function (lookup) {
		test.deepEqual(lookup, {id: 5, name: 'john doe'});
		test.ok(true, 'called _loadUsing');
		return Promise.resolve();
	};

	model._loadWithMultiColumn({id: 5, name: 'john doe'}).then(function () {
		test.ok(true, 'promise resolved');
		test.done();
	}, function () {
		test.ok(false, 'promise rejected');
		test.done();
	});
};

exports['_loadWithMultiColumn - bad value'] = function (test) {
	test.expect(3);

	var Model = quell('users', {
		schema: {
			columns: {
				id: quell.INT(),
				name: quell.VARCHAR()
			},
			primaries: ['id']
		}
	});

	var model = new Model();

	model._promiseValidateSchema = function () {
		test.ok(true, '_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function (lookup) {
		test.deepEqual(lookup, {id: 5, name: 'john doe'});
		test.ok(true, 'called _loadUsing');
		return Promise.resolve();
	};

	model._loadWithMultiColumn().then(function () {
		test.ok(false, 'promise resolved');
		test.done();
	}, function (err) {
		test.equal(err.message, 'Could not load quell model; provided data was empty or not an object.');
		test.ok(true, 'promise rejected');
		test.done();
	});
};

exports['_loadWithMultiColumn - bad value 2'] = function (test) {
	test.expect(3);

	var Model = quell('users', {
		schema: {
			columns: {
				id: quell.INT(),
				name: quell.VARCHAR()
			},
			primaries: ['id']
		}
	});

	var model = new Model();

	model._promiseValidateSchema = function () {
		test.ok(true, '_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function (lookup) {
		test.deepEqual(lookup, {id: 5, name: 'john doe'});
		test.ok(true, 'called _loadUsing');
		return Promise.resolve();
	};

	model._loadWithMultiColumn({}).then(function () {
		test.ok(false, 'promise resolved');
		test.done();
	}, function (err) {
		test.equal(err.message, 'Could not load quell model; provided data was empty or not an object.');
		test.ok(true, 'promise rejected');
		test.done();
	});
};

exports['_loadWithMultiColumn - invalid column'] = function (test) {
	test.expect(3);

	var Model = quell('users', {
		schema: {
			columns: {
				id: quell.INT(),
				name: quell.VARCHAR()
			},
			primaries: ['id']
		}
	});

	var model = new Model();

	model._promiseValidateSchema = function () {
		test.ok(true, '_promiseValidateSchema ran');
		return Promise.resolve();
	};

	model._loadUsing = function (lookup) {
		test.deepEqual(lookup, {id: 5, name: 'john doe'});
		test.ok(true, 'called _loadUsing');
		return Promise.resolve();
	};

	model._loadWithMultiColumn({city: 'San Diego'}).then(function () {
		test.ok(false, 'promise resolved');
		test.done();
	}, function (err) {
		test.equal(err.message, 'Could not load quell model, city does not exist in the table schema.');
		test.ok(true, 'promise rejected');
		test.done();
	});
};


exports._loadUsing = {
	setUp: function (done) {
		this.backup = assign({}, quell);
		done();
	},

	'with results': function (test) {

		var mockConnection = {query: true};

		var Model = quell('users', {
			connection: mockConnection,
			schema: {
				columns: {
					id: quell.INT(),
					name: quell.VARCHAR()
				},
				primaries: ['id'],
				autoincrement: 'id',
			}
		});

		var model = new Model();

		quell._buildSelectQuery = function (tablename, lookup) {
			test.strictEqual(tablename, 'users');
			test.deepEqual(lookup, {id: 5, name: 'john doe'});
			test.ok(true, 'build ran');
			return {query: "QUERY", data: [22]};
		};

		quell._promiseQueryRun = function (query, data, mysql) {
			test.equal(query, 'QUERY');
			test.deepEqual(data, [22]);
			test.equal(mysql, mockConnection);
			test.ok(true, 'query ran');
			return Promise.resolve([
				{id: 5, name: 'john doe'}
			]);
		};

		model._loadUsing({id: 5, name: 'john doe'}).then(function (result) {
			test.equal(result, model);
			test.equal(model.exists, true);
			test.deepEqual(model.changed, {});
			test.ok(true, 'promise resolved');
			test.done();
		}, function () {
			test.ok(false, 'promise rejected');
			test.done();
		});
	},

	'without results': function (test) {

		var mockConnection = {query: true};

		var Model = quell('users', {
			connection: mockConnection,
			schema: {
				columns: {
					id: quell.INT(),
					name: quell.VARCHAR()
				},
				primaries: ['id'],
				autoincrement: 'id',
			}
		});

		var model = new Model();

		quell._buildSelectQuery = function (tablename, lookup) {
			test.strictEqual(tablename, 'users');
			test.deepEqual(lookup, {id: 5, name: 'john doe'});
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

		model._loadUsing({id: 5, name: 'john doe'}).then(function (result) {
			test.equal(result, false);
			test.equal(model.exists, false);
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
