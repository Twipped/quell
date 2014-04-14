var provider = require('nodeunit-dataprovider');
var seaquell = require('../seaquell');
var Promise = require('es6-promise').Promise;
var assign = require('lodash-node/modern/objects/assign');
var each = require('lodash-node/modern/collections/forEach');
var types = require('../lib/types');

function logError(err) {
	var error = { error: assign({ message: err.message, stack: (err.stack || '').split('\n').slice(1).map(function (v) { return '' + v + ''; }) }, err)};
	console.log(err);
}

function flattenObject(input) {
	var protos = [input];
	var parent = Object.getPrototypeOf(input);

	while (parent && parent != Object.prototype) {
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
			member_id: types.INT({
				size: 11,
				unsigned: true,
				NULL: false
			}),
			email: types.VARCHAR({
				size: 255,
				NULL: false
			}),
			username: types.VARCHAR(200),
			fullname: types.TINYTEXT(),
			website: types.TEXT(),
			last_updated: types.TIMESTAMP(),
			last_login: types.DATETIME(),
			validated: types.TINYINT({
				NULL:false
			}),
			membership_type: types.ENUM('Free','None','Credited','Monthly','Yearly'),
			balance: types.DECIMAL(8,4)
		},

		primaries: ['member_id'],
		autoincrement: 'member_id',
		loaded: true
	};

	seaquell._promiseTableSchema('TABLENAME', mockConnection).then(function (actual) {
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


var singleKeyDescribe = [
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

var multiKeyDescribe = [
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
	{
		'Field': 'country',
		'Type': 'tinytext',
		'Null': 'YES',
		'Key': '',
		'Default': null,
		'Extra': '',
	}
];