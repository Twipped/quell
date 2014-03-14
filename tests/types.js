var provider = require('nodeunit-dataprovider');
var types = require('../lib/types');

exports['type base matches type called'] = function (test) {
	test.strictEqual(types.TEXT.type,      types.TEXT().type);
	test.strictEqual(types.TEXT.NULL,      types.TEXT().NULL);
	test.strictEqual(types.TEXT.format,    types.TEXT().format);
	test.strictEqual(types.TEXT.prepare,   types.TEXT().prepare);
	test.strictEqual(types.TEXT.compare,   types.TEXT().compare);
	test.strictEqual(types.TEXT.size,    types.TEXT().size);
	test.strictEqual(types.TEXT.precision, types.TEXT().precision);
	test.done();
};

exports['type called with new values mixed in'] = function (test) {
	var t = types.TEXT({type: 'BARN', size: 15});
	test.strictEqual(t.type,      'BARN');
	test.strictEqual(t.NULL,      types.TEXT.NULL);
	test.strictEqual(t.format,    types.TEXT.format);
	test.strictEqual(t.prepare,   types.TEXT.prepare);
	test.strictEqual(t.compare,   types.TEXT.compare);
	test.strictEqual(t.size,    15);
	test.strictEqual(t.precision, types.TEXT.precision);
	test.done();
};

exports['type called with arguments'] = function (test) {
	var t = types.INT(15, 3);
	test.strictEqual(t.type,      'INT');
	test.strictEqual(t.NULL,      types.INT.NULL);
	test.strictEqual(t.format,    types.INT.format);
	test.strictEqual(t.prepare,   types.INT.prepare);
	test.strictEqual(t.compare,   types.INT.compare);
	test.strictEqual(t.size,      15);
	test.strictEqual(t.precision, 3);
	test.done();
};

exports['type formatters'] = provider(
	[
		{type: types.TEXT, input: 'Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Aenean lacinia bibendum nulla sed consectetur.', output: 'Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Aenean lacinia bibendum nulla sed consectetur.'},
		{type: types.TEXT(19), input: 'Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Aenean lacinia bibendum nulla sed consectetur.', output: 'Aenean eu leo quam.'},
		{type: types.TEXT, input: 9, output: '9'},
		{type: types.TEXT, input: null, output: null},
		{type: types.TEXT({NULL: false}), input: null, output: ''},
		{type: types.INT, input: 12, output: '12'},
		{type: types.INT, input: 'a', output: null},
		{type: types.INT, input: null, output: null},
		{type: types.INT({NULL: false}), input: 'a', output: '0'},
		{type: types.INT({NULL: false}), input: null, output: '0'},
		{type: types.FLOAT, input: 12, output: '12.00'},
		{type: types.FLOAT, input: 1211111111111, output: '11111111.00'},
		{type: types.FLOAT(5,5), input: 1211111111.111, output: '.11100'},
		{type: types.DOUBLE, input: 1211111111111, output: '211111111111.0000'},
		{type: types.ENUM, input: 'abc', output: null},
		{type: types.ENUM, input: null, output: null},
		{type: types.ENUM({NULL: false}), input: 'abc', output: ''},
		{type: types.ENUM('abc', 'def'), input: 'def', output: 'def'},
		{type: types.ENUM('ABC', 'DEF'), input: 'def', output: 'DEF'},
		{type: types.DATE, input: new Date('2013-02-01 01:35:00'), output: '2013-02-01'},
		{type: types.DATETIME, input: new Date('2013-02-01 01:35:00'), output: '2013-02-01 01:35:00'},
		{type: types.DATETIME, input: 'hello', output: null},
		{type: types.DATETIME({NULL: false}), input: 'hello', output: '0000-00-00 00:00:00'},
		{type: types.DATETIME, input: null, output: null},
		{type: types.DATETIME, input: 'now', output: types.DATETIME.format(Date.now())},
	],

	function (test, data) {
		test.strictEqual(data.type.format(data.input), data.output);
		test.done();
	}
);

exports['type preparers'] = provider(
	[
		{type: types.TEXT, input: 'Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Aenean lacinia bibendum nulla sed consectetur.', output: 'Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Aenean lacinia bibendum nulla sed consectetur.'},
		{type: types.TEXT(19), input: 'Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Aenean lacinia bibendum nulla sed consectetur.', output: 'Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Aenean lacinia bibendum nulla sed consectetur.'},
		{type: types.TEXT, input: 9, output: '9'},
		{type: types.TEXT, input: null, output: null},
		{type: types.TEXT({NULL: false}), input: null, output: ''},
		{type: types.INT, input: 12, output: 12},
		{type: types.INT, input: 'a', output: null},
		{type: types.INT, input: null, output: null},
		{type: types.INT({NULL: false}), input: 'a', output: 0},
		{type: types.INT({NULL: false}), input: null, output: 0},
		{type: types.FLOAT, input: 12, output: 12},
		{type: types.FLOAT, input: 1211111111111, output: 1211111111111},
		{type: types.FLOAT(5,5), input: 1211111111.111, output: 1211111111.111},
		{type: types.DOUBLE, input: 1211111111111, output: 1211111111111},
		{type: types.ENUM, input: 'abc', output: 'abc'},
		{type: types.ENUM, input: null, output: null},
		{type: types.ENUM({NULL: false}), input: 'abc', output: 'abc'},
		{type: types.ENUM('abc', 'def'), input: 'def', output: 'def'},
		{type: types.ENUM('ABC', 'DEF'), input: 'def', output: 'def'},
		{type: types.DATE, input: new Date('2013-02-01 01:35:00'), output: '2013-02-01'},
		{type: types.DATETIME, input: new Date('2013-02-01 01:35:00'), output: '2013-02-01 01:35:00'},
		{type: types.DATETIME, input: 'hello', output: null},
		{type: types.DATETIME({NULL: false}), input: 'hello', output: '0000-00-00 00:00:00'},
		{type: types.DATETIME, input: null, output: null},
		{type: types.DATETIME, input: 'now', output: types.DATETIME.format(Date.now())},
	],

	function (test, data) {
		test.strictEqual(data.type.prepare(data.input), data.output);
		test.done();
	}
);