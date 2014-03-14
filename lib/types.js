var moment = require('moment');
var extend = require('./extend');

var TYPE = function(options) {
	var o = Object.create(this);
	if (typeof options === 'object' && !Array.isArray(options)) {
		extend(o, this, options || {});
	} else if (typeof o.initialize === 'function') {
		o.initialize.apply(o, arguments);
	}
	return o;
};

var compare = function (a,b) {
	return this.format(a) === this.format(b);
};

var TEXT = {
	type: 'TEXT',
	NULL: true,
	size: 0,
	format: function (o) {
		if (o === null) {
			if (this.NULL) {
				return null;
			} else {
				return '';
			}
		}
		if (this.size && this.size < o.length) {
			return (''+o).slice(0, this.size);
		}
		return (''+o);
	},
	prepare: function (o) {
		if (o === null) {
			if (this.NULL) {
				return null;
			} else {
				return '';
			}
		}
		return ''+o;
	},
	compare: compare,
	initialize: function () {
		if (arguments.length > 0) {
			this.size = arguments[0];
		}
	}
};

var ENUM = {
	type: 'ENUM',
	NULL: true,
	options: [],
	format: function (o) {
		var NULL = this.NULL ? null : '';

		if (o === null) {
			return NULL;
		}

		o = ''+o;
		var options = this.options.map(function (s) { return s.toUpperCase(); });
		var i = options.indexOf(o.toUpperCase());

		if (i > -1) {
			return this.options[i];
		} else {
			return NULL;
		}
	},
	prepare: function (o) {
		if (o === null) {
			return this.NULL ? null : '';
		}
		return ''+o;
	},
	compare: compare,
	initialize: function () {
		this.options = Array.prototype.slice.call(arguments);
	}
};

var INT = {
	type: 'INT',
	NULL: true,
	size: 11,
	precision: 0,
	signed: true,
	format: function (o) {
		var NULL = this.NULL ? null : '0';

		if (o === null) {
			return NULL;
		}

		o = parseFloat(o);

		if (isNaN(o)) {
			return NULL;
		}

		if (this.precision) {
			// round at the needed precision and then split on the decimal.
			var k = Math.pow(10, this.precision);
			result = ('' + Math.round(o * k) / k).split('.');

			// if no decimal existed, make sure we create a place for it.
			if (result.length === 1) result.push('');
		} else {
			// parse as float and round off, then store in an array to simplify below.
			result = [Math.round(parseFloat(o))];
		}

		// if the whole number is longer than available space, slice off the extra characters
		if (this.size && this.size - this.precision < result[0].length) {
			if (this.size - this.precision === 0) {
				result[0] = '';
			} else {
				result[0] = result[0].slice(0 - (this.size - this.precision));
			}
		}

		// pad out the decimal places with 0, if needed
		if (this.precision && result[1].length < this.precision) {
			result[1] += new Array(this.precision - result[1].length + 1).join('0');
		}

		return this.precision ? result.join('.') : ''+result[0];
	},
	prepare: function (o) {
		if (o === null) {
			return this.NULL ? null : 0;
		}

		o = Number(o);

		if (isNaN(o)) {
			return this.NULL ? null : 0;
		}

		return o;
	},
	compare: compare,
	initialize: function () {
		if (arguments.length > 0) {
			this.size = arguments[0];
		}
		if (arguments.length > 1) {
			this.precision = arguments[1];
		}
	}
};

var DATETIME = {
	type: 'DATETIME',
	NULL: true,
	mask: 'YYYY-MM-DD HH:mm:ss',
	format: function (o) {
		var NULL = this.NULL ? null : '0000-00-00 00:00:00';

		if (o === null) {
			return NULL;
		}

		if (o === 'now') {
			return moment().format(this.mask);
		}

		o = moment(o).format(this.mask);
		if (o === 'Invalid date') {
			return NULL;
		} else {
			return o;
		}
	},
	compare: compare
};
DATETIME.prepare = DATETIME.format;

function makeType (base, extras) {
	var properties = extend({}, base, extras || {});
	var type = TYPE.bind(properties);
	return extend(type, properties);
}


module.exports = {
	TEXT      : makeType(TEXT, {type: 'TEXT',       size: 65535}),
	BLOB      : makeType(TEXT, {type: 'BLOB',       size: 65535}),
	MEDIUMBLOB: makeType(TEXT, {type: 'MEDIUMBLOB', size: 16777215}),
	MEDIUMTEXT: makeType(TEXT, {type: 'MEDIUMTEXT', size: 16777215}),
	LONGBLOB  : makeType(TEXT, {type: 'LONGBLOB',   size: 4294967295}),
	LONGTEXT  : makeType(TEXT, {type: 'LONGTEXT',   size: 4294967295}),
	TINYBLOB  : makeType(TEXT, {type: 'TINYBLOB',   size: 255}),
	TINYTEXT  : makeType(TEXT, {type: 'TINYTEXT',   size: 255}),
	VARCHAR   : makeType(TEXT, {type: 'VARCHAR',    size: 255}),
	CHAR      : makeType(TEXT, {type: 'CHAR',       size: 255}),

	INT       : makeType(INT),
	INTEGER   : makeType(INT),
	TINYINT   : makeType(INT,  {type: 'TINYINT',    size: 1}),
	SMALLINT  : makeType(INT,  {type: 'SMALLINT',   size: 4}),
	MEDIUMINT : makeType(INT,  {type: 'MEDIUMINT',  size: 8}),
	BIGINT    : makeType(INT,  {type: 'BIGINT',     size: 20}),
	FLOAT     : makeType(INT,  {type: 'FLOAT',      size: 10, precision: 2}),
	DOUBLE    : makeType(INT,  {type: 'DOUBLE',     size: 16, precision: 4}),

	// DECIMALS must have a size and precision defined in the schema, so we're being ambiguous with the values
	DECIMAL   : makeType(INT,  {type: 'DECIMAL',    size: 0, precision: 20}),

	DATETIME  : makeType(DATETIME),
	TIMESTAMP : makeType(DATETIME,  {type: 'TIMESTAMP'}),
	DATE      : makeType(DATETIME,  {type: 'DATE',  mask: 'YYYY-MM-DD'}),
	TIME      : makeType(DATETIME,  {type: 'DATE',  mask: 'HH:mm:ss'}),
	YEAR      : makeType(DATETIME,  {type: 'YEAR',  mask: 'YYYY'}),

	ENUM      : makeType(ENUM),

	UNKNOWN   : makeType(TEXT)
};