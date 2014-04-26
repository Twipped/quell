var quell = require('../quell');
var assign = require('lodash.assign');
var each = require('lodash.forEach');
var Promise = require('es6-promise').Promise;

var singleKeyDescribe, multiKeyDescribe;

function logError (err) {
	var error = { error: assign({ message: err.message, stack: (err.stack || '').split('\n').slice(1).map(function (v) { return '' + v + ''; }) }, err)};
	console.log(error);
}

function flattenObject (input) {
	if (typeof input !== 'object') {
		return input;
	}

	var protos = [input];
	var parent = Object.getPrototypeOf(input);

	while (parent && parent !== Object.prototype) {
		protos.unshift(parent);
		parent = Object.getPrototypeOf(parent);
	}

	protos.unshift({});

	return assign.apply(null, protos);
}

exports['_promiseTableSchema 1'] = function (test) {
	test.expect(16);

	var mockConnection = {
		query: function (tablename, callback) {
			test.equal(tablename, 'DESCRIBE TABLENAME');
			callback(null, singleKeyDescribe);
		}
	};

	var expected = {
		columns: {
			member_id: quell.INT({
				size: 11,
				unsigned: true,
				NULL: false
			}),
			email: quell.VARCHAR({
				size: 255,
				NULL: false
			}),
			username: quell.VARCHAR(200),
			fullname: quell.TINYTEXT(),
			website: quell.TEXT(),
			last_updated: quell.TIMESTAMP(),
			last_login: quell.DATETIME(),
			validated: quell.TINYINT({
				NULL: false
			}),
			membership_type: quell.ENUM('Free','None','Credited','Monthly','Yearly'),
			balance: quell.DECIMAL(8,4)
		},

		primaries: ['member_id'],
		autoincrement: 'member_id',
		loaded: true
	};

	quell._promiseTableSchema('TABLENAME', mockConnection).then(function (actual) {
		test.deepEqual(Object.keys(actual.columns), Object.keys(expected.columns));
		each(actual.columns, function (actualColumn, columnName) {
			test.deepEqual(flattenObject(actualColumn), flattenObject(expected.columns[columnName]), columnName);
		});
		test.deepEqual(actual.primaries, expected.primaries);
		test.deepEqual(actual.autoincrement, expected.autoincrement);
		test.strictEqual(actual.loaded, expected.loaded);
		test.ok(true, 'promise resolved');
		test.done();
	}, function (err) {
		logError(err);
		test.ok(false, 'promise rejected');
		test.done();
	});

};

exports['_promiseTableSchema 2'] = function (test) {
	test.expect(14);

	var mockConnection = {
		query: function (tablename, callback) {
			test.equal(tablename, 'DESCRIBE TABLENAME');
			callback(null, multiKeyDescribe);
		}
	};

	var expected = {
		columns: {
			member_id: quell.INT({
				size: 11,
				unsigned: true,
				NULL: false
			}),
			type: quell.ENUM({options: ['Profile','Billing','Shipping','Other'], NULL: false}),
			address_1: quell.TINYTEXT(),
			address_2: quell.TINYTEXT(),
			city: quell.VARCHAR(100),
			state: quell.VARCHAR(10),
			zip: quell.VARCHAR(5),
			zip4: quell.VARCHAR(4)
		},

		primaries: ['member_id', 'type'],
		autoincrement: false,
		loaded: true
	};

	quell._promiseTableSchema('TABLENAME', mockConnection).then(function (actual) {
		test.deepEqual(Object.keys(actual.columns), Object.keys(expected.columns));
		each(actual.columns, function (actualColumn, columnName) {
			test.deepEqual(flattenObject(actualColumn), flattenObject(expected.columns[columnName]), columnName);
		});
		test.deepEqual(actual.primaries, expected.primaries);
		test.deepEqual(actual.autoincrement, expected.autoincrement);
		test.strictEqual(actual.loaded, expected.loaded);
		test.ok(true, 'promise resolved');
		test.done();
	}, function (err) {
		logError(err);
		test.ok(false, 'promise rejected');
		test.done();
	});

};

exports['_promiseValidateSchema, missing connection'] = function (test) {

	var Model = quell('users');

	var model = new Model();

	test.throws(function () {
		model._promiseValidateSchema();
	});

	test.done();
};


exports['_promiseValidateSchema, valid'] = function (test) {

	var mockConnection = {
		query: function () {
			test.ok(false, 'Query should not have been called');
		}
	};

	var Model = quell('users', {
		connection: mockConnection,
		schema: {
			columns: {
				id: quell.INT({
					size: 11,
					unsigned: true,
					NULL: false
				}),
				name: quell.VARCHAR(100)
			},
			primaries: ['id'],
			autoincrement: 'id'
		}
	});

	var model = new Model();

	model._promiseValidateSchema().then(function () {
		test.ok(true, 'promise resolved');
		test.done();
	}, function (err) {
		logError(err);
		test.ok(false, 'promise rejected');
		test.done();
	});
};

exports['_promiseValidateSchema, valid (generated)'] = function (test) {

	var mockConnection = {
		query: function () {
			test.ok(false, 'Query should not have been called');
		}
	};

	var Model = quell('users', {
		connection: mockConnection,
		schema: {
			columns: {
				id: quell.INT({
					size: 11,
					unsigned: true,
					NULL: false
				}),
				name: quell.VARCHAR(100)
			},
			primaries: ['id'],
			autoincrement: 'id',
			loaded: true
		}
	});

	var model = new Model();

	model._promiseValidateSchema().then(function () {
		test.ok(true, 'promise resolved');
		test.done();
	}, function (err) {
		logError(err);
		test.ok(false, 'promise rejected');
		test.done();
	});
};

exports['_promiseValidateSchema, invalid'] = {
	setUp: function (done) {
		this._promiseTableSchemaBackup = quell._promiseTableSchema;
		quell._promiseTableSchema = function () {
			return Promise.resolve({
				columns: {
					id: quell.INT({
						size: 11,
						unsigned: true,
						NULL: false
					}),
					name: quell.VARCHAR(100)
				},
				primaries: ['id'],
				autoincrement: 'id',
				loaded: true
			});
		};

		done();
	},

	'missing primaries': function (test) {

		var mockConnection = {
			query: function () {
				test.ok(false, 'Query should not have been called');
			}
		};

		var Model = quell('users', {
			connection: mockConnection,
			schema: {
				columns: {
					id: quell.INT({
						size: 11,
						unsigned: true,
						NULL: false
					}),
					name: quell.VARCHAR(100)
				}
			}
		});

		var model = new Model();

		model._promiseValidateSchema().then(function () {
			test.ok(true, 'promise resolved');
			test.done();
		}, function (err) {
			logError(err);
			test.ok(false, 'promise rejected');
			test.done();
		});
	},

	'missing columns': function (test) {

		var mockConnection = {
			query: function () {
				test.ok(false, 'Query should not have been called');
			}
		};

		var Model = quell('users', {
			connection: mockConnection,
			schema: {}
		});

		var model = new Model();

		model._promiseValidateSchema().then(function () {
			test.ok(true, 'promise resolved');
			test.done();
		}, function (err) {
			logError(err);
			test.ok(false, 'promise rejected');
			test.done();
		});
	},

	'missing schema': function (test) {

		var mockConnection = {
			query: function () {
				test.ok(false, 'Query should not have been called');
			}
		};

		var Model = quell('users', {
			connection: mockConnection
		});

		var model = new Model();

		model._promiseValidateSchema().then(function () {
			test.ok(true, 'promise resolved');
			test.done();
		}, function (err) {
			logError(err);
			test.ok(false, 'promise rejected');
			test.done();
		});
	},

	tearDown: function (done) {
		quell._promiseTableSchema = this._promiseTableSchemaBackup;
		done();
	}
};


singleKeyDescribe = [
	{
		'Field': 'member_id',
		'Type': 'int(11) unsigned',
		'Null': 'NO',
		'Key': 'PRI',
		'Default': null,
		'Extra': 'auto_increment',
	},
	{
		'Field': 'email',
		'Type': 'varchar(255)',
		'Null': 'NO',
		'Key': 'MUL',
		'Default': null,
		'Extra': '',
	},
	{
		'Field': 'username',
		'Type': 'varchar(200)',
		'Null': 'YES',
		'Key': '',
		'Default': '',
		'Extra': '',
	},
	{
		'Field': 'fullname',
		'Type': 'tinytext',
		'Null': 'YES',
		'Key': '',
		'Default': null,
		'Extra': '',
	},
	{
		'Field': 'website',
		'Type': 'text',
		'Null': 'YES',
		'Key': '',
		'Default': null,
		'Extra': '',
	},
	{
		'Field': 'last_updated',
		'Type': 'timestamp',
		'Null': 'NO',
		'Key': '',
		'Default': 'CURRENT_TIMESTAMP',
		'Extra': 'on update CURRENT_TIMESTAMP',
	},
	{
		'Field': 'last_login',
		'Type': 'datetime',
		'Null': 'YES',
		'Key': '',
		'Default': null,
		'Extra': '',
	},
	{
		'Field': 'validated',
		'Type': 'tinyint(1)',
		'Null': 'NO',
		'Key': '',
		'Default': '0',
		'Extra': '',
	},
	{
		'Field': 'membership_type',
		'Type': 'enum(\'Free\',\'None\',\'Credited\',\'Monthly\',\'Yearly\')',
		'Null': 'YES',
		'Key': '',
		'Default': 'Free',
		'Extra': '',
	},
	{
		'Field': 'balance',
		'Type': 'decimal(8,4)',
		'Null': 'YES',
		'Key': '',
		'Default': '0.00',
		'Extra': '',
	}
];

multiKeyDescribe = [
	{
		'Field': 'member_id',
		'Type': 'int(11) unsigned',
		'Null': 'NO',
		'Key': 'PRI',
		'Default': null,
		'Extra': '',
	},
	{
		'Field': 'type',
		'Type': 'enum(\'Profile\',\'Billing\',\'Shipping\',\'Other\')',
		'Null': 'NO',
		'Key': 'PRI',
		'Default': 'Profile',
		'Extra': '',
	},
	{
		'Field': 'address_1',
		'Type': 'tinytext',
		'Null': 'YES',
		'Key': '',
		'Default': null,
		'Extra': '',
	},
	{
		'Field': 'address_2',
		'Type': 'tinytext',
		'Null': 'YES',
		'Key': '',
		'Default': null,
		'Extra': '',
	},
	{
		'Field': 'city',
		'Type': 'varchar(100)',
		'Null': 'YES',
		'Key': '',
		'Default': null,
		'Extra': '',
	},
	{
		'Field': 'state',
		'Type': 'varchar(10)',
		'Null': 'YES',
		'Key': '',
		'Default': null,
		'Extra': '',
	},
	{
		'Field': 'zip',
		'Type': 'varchar(5)',
		'Null': 'YES',
		'Key': '',
		'Default': null,
		'Extra': '',
	},
	{
		'Field': 'zip4',
		'Type': 'varchar(4)',
		'Null': 'YES',
		'Key': '',
		'Default': null,
		'Extra': '',
	}
];
