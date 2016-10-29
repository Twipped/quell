
var suite = require('tapsuite');
var test = require('tap').test;
var quell = require('../');
var each = function each (collection, fn) {
	if (Array.isArray(collection)) return collection.forEach(fn);
	if (collection && typeof collection === 'object') {
		return Object.keys(collection).forEach((key) => fn(collection[key], key));
	}
};

function logError (err) {
	var error = {
		error: Object.assign(
			{ message: err.message, stack: (err.stack || '').split('\n').slice(1).map((v) => '' + v + '') },
			err
		),
	};
	console.log(error);
}

function flattenObject (input) {
	if (typeof input !== 'object') {
		return input;
	}

	var protos = [ input ];
	var parent = Object.getPrototypeOf(input);

	while (parent && parent !== Object.prototype) {
		protos.unshift(parent);
		parent = Object.getPrototypeOf(parent);
	}

	protos.unshift({});

	return Object.assign.apply(null, protos);
}

test('_promiseTableSchema 1', (test) => {
	test.plan(17);

	var mockConnection = {
		query (tablename, data, callback) {
			test.equal(tablename, 'DESCRIBE TABLENAME');
			test.equal(data, null);
			callback(null, singleKeyDescribe());
		},
	};

	var expected = {
		columns: {
			member_id: quell.INT({
				size: 11,
				unsigned: true,
				NULL: false,
			}),
			email: quell.VARCHAR({
				size: 255,
				NULL: false,
			}),
			username: quell.VARCHAR(200),
			fullname: quell.TINYTEXT(),
			website: quell.TEXT(),
			last_updated: quell.TIMESTAMP(),
			last_login: quell.DATETIME(),
			validated: quell.TINYINT({
				NULL: false,
			}),
			membership_type: quell.ENUM('Free', 'None', 'Credited', 'Monthly', 'Yearly'),
			balance: quell.DECIMAL(8, 4),
		},

		primaries: [ 'member_id' ],
		autoincrement: 'member_id',
		loaded: true,
	};

	quell._promiseTableSchema('TABLENAME', mockConnection).then((actual) => {
		test.deepEqual(Object.keys(actual.columns), Object.keys(expected.columns));
		each(actual.columns, (actualColumn, columnName) => {
			test.deepEqual(flattenObject(actualColumn), flattenObject(expected.columns[columnName]), columnName);
		});
		test.deepEqual(actual.primaries, expected.primaries);
		test.deepEqual(actual.autoincrement, expected.autoincrement);
		test.strictEqual(actual.loaded, expected.loaded);
		test.pass('promise resolved');
		test.end();
	}, (err) => {
		logError(err);
		test.fail('promise rejected');
		test.end();
	});

});

test('_promiseTableSchema 2', (test) => {
	test.plan(15);

	var mockConnection = {
		query (tablename, data, callback) {
			test.equal(tablename, 'DESCRIBE TABLENAME');
			test.equal(data, null);
			callback(null, multiKeyDescribe());
		},
	};

	var expected = {
		columns: {
			member_id: quell.INT({
				size: 11,
				unsigned: true,
				NULL: false,
			}),
			type: quell.ENUM({ options: [ 'Profile', 'Billing', 'Shipping', 'Other' ], NULL: false }),
			address_1: quell.TINYTEXT(),
			address_2: quell.TINYTEXT(),
			city: quell.VARCHAR(100),
			state: quell.VARCHAR(10),
			zip: quell.VARCHAR(5),
			zip4: quell.VARCHAR(4),
		},

		primaries: [ 'member_id', 'type' ],
		autoincrement: false,
		loaded: true,
	};

	quell._promiseTableSchema('TABLENAME', mockConnection).then((actual) => {
		test.deepEqual(Object.keys(actual.columns), Object.keys(expected.columns));
		each(actual.columns, (actualColumn, columnName) => {
			test.deepEqual(flattenObject(actualColumn), flattenObject(expected.columns[columnName]), columnName);
		});
		test.deepEqual(actual.primaries, expected.primaries);
		test.deepEqual(actual.autoincrement, expected.autoincrement);
		test.strictEqual(actual.loaded, expected.loaded);
		test.pass('promise resolved');
		test.end();
	}, (err) => {
		logError(err);
		test.fail('promise rejected');
		test.end();
	});

});

test('_promiseValidateSchema, missing connection', (test) => {

	var Model = quell('users');

	var model = new Model();

	test.throws(() => {
		model._promiseValidateSchema();
	});

	test.end();
});


test('_promiseValidateSchema, valid', (test) => {

	var mockConnection = {
		query () {
			test.fail('Query should not have been called');
		},
	};

	var Model = quell('users', {
		connection: mockConnection,
		schema: {
			columns: {
				id: quell.INT({
					size: 11,
					unsigned: true,
					NULL: false,
				}),
				name: quell.VARCHAR(100),
			},
			primaries: [ 'id' ],
			autoincrement: 'id',
		},
	});

	var model = new Model();

	model._promiseValidateSchema().then(() => {
		test.pass('promise resolved');
		test.end();
	}, (err) => {
		logError(err);
		test.fail('promise rejected');
		test.end();
	});
});

test('_promiseValidateSchema, valid (generated)', (test) => {

	var mockConnection = {
		query () {
			test.fail('Query should not have been called');
		},
	};

	var Model = quell('users', {
		connection: mockConnection,
		schema: {
			columns: {
				id: quell.INT({
					size: 11,
					unsigned: true,
					NULL: false,
				}),
				name: quell.VARCHAR(100),
			},
			primaries: [ 'id' ],
			autoincrement: 'id',
			loaded: true,
		},
	});

	var model = new Model();

	model._promiseValidateSchema().then(() => {
		test.pass('promise resolved');
		test.end();
	}, (err) => {
		logError(err);
		test.fail('promise rejected');
		test.end();
	});
});

suite('_promiseValidateSchema, invalid', (s) => {
	s.before((done) => {
		this._promiseTableSchemaBackup = quell._promiseTableSchema;
		quell._promiseTableSchema = function () {
			return Promise.resolve({
				columns: {
					id: quell.INT({
						size: 11,
						unsigned: true,
						NULL: false,
					}),
					name: quell.VARCHAR(100),
				},
				primaries: [ 'id' ],
				autoincrement: 'id',
				loaded: true,
			});
		};

		done();
	});

	s.after((done) => {
		quell._promiseTableSchema = this._promiseTableSchemaBackup;
		done();
	});

	s.test('missing primaries', (test) => {

		var mockConnection = {
			query () {
				test.fail('Query should not have been called');
			},
		};

		var Model = quell('users', {
			connection: mockConnection,
			schema: {
				columns: {
					id: quell.INT({
						size: 11,
						unsigned: true,
						NULL: false,
					}),
					name: quell.VARCHAR(100),
				},
			},
		});

		var model = new Model();

		model._promiseValidateSchema().then(() => {
			test.pass('promise resolved');
			test.end();
		}, (err) => {
			logError(err);
			test.fail('promise rejected');
			test.end();
		});
	});

	s.test('missing columns', (test) => {

		var mockConnection = {
			query () {
				test.fail('Query should not have been called');
			},
		};

		var Model = quell('users', {
			connection: mockConnection,
			schema: {},
		});

		var model = new Model();

		model._promiseValidateSchema().then(() => {
			test.pass('promise resolved');
			test.end();
		}, (err) => {
			logError(err);
			test.fail('promise rejected');
			test.end();
		});
	});

	s.test('missing schema', (test) => {

		var mockConnection = {
			query () {
				test.fail('Query should not have been called');
			},
		};

		var Model = quell('users', {
			connection: mockConnection,
		});

		var model = new Model();

		model._promiseValidateSchema().then(() => {
			test.pass('promise resolved');
			test.end();
		}, (err) => {
			logError(err);
			test.fail('promise rejected');
			test.end();
		});
	});

});


function singleKeyDescribe () {
	return [
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
		},
	];
}

function multiKeyDescribe () {
	return [
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
		},
	];
}
