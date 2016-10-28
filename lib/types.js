'use strict';

var moment = require('moment');

/**
 * By default, quell will automatically load the table schema for any models that are created
 * the first time a read/write operation is performed, but this operation may be skipped by
 * predefining the table schema as part of the model. *Note: quell does not alter or create
 * table structure, defining the schema in code is not a substitute for creating a table
 * structure in the database.*
 *
 * To make it easier to define table structure, all of the column data types are accessible
 * directly from the quell object and can be used exactly as you would in a CREATE TABLE
 * command (eg, `VARCHAR(10)`. If used as a value instead of a function, quell will use the
 * default values for that type.  To define extra column attributes such as integer sign and
 * null acceptance, you must pass a column settings object as the main argument on the data
 * type object.  See the main [quell](#constructorquell) definition for an example.
 *
 * **Custom Types:**
 *
 * Every quell data type must define three functions: `format`, `prepare` and `compare`
 * function.  If any of these options are excluded from the settings object, the defaults
 * for the base type are used.
 *
 * `prepare` is called right before the data is used in a query and sanitizes the input for
 * the expected data type.  In the case of integers this means stripping any non-numeric
 * characters, for dates the value is parsed with Moment and then formatted as a MySQL date.
 * String and Enum values are force cast to string.  All values are tested for `null`.
 *
 * The `format` function is used when fetching data from the model via the `.get()` method.
 * It attempts the structure whatever data is on the model in the way that MySQL would format
 * it in the database (eg, trimming values for their column lengths).  This is useful for
 * validating model data before saving.
 *
 * `compare` is called when quell is determining what columns have changed from their
 * original values. It takes two arguments and returns a boolean.
 * @signature quell.TYPE(settings)
 * @constructor
 * @name Schema
 */
var TYPE = function (options) {
	var o = Object.create(this);
	if (typeof options === 'object' && !Array.isArray(options)) {
		Object.assign(o, this, options || {});
	} else if (typeof o.initialize === 'function') {
		o.initialize.apply(o, arguments);
	}
	return o;
};

var compare = function (a, b) {
	return this.format(a) === this.format(b);
};

var TEXT = {
	type: 'TEXT',
	NULL: true,
	size: 0,
	format (o) {
		if (o === null) {
			if (this.NULL) {
				return null;
			}
			return '';
		}
		if (this.size && this.size < o.length) {
			return ('' + o).slice(0, this.size);
		}
		return ('' + o);
	},
	prepare (o) {
		if (o === null) {
			if (this.NULL) {
				return null;
			}
			return '';
		}
		return '' + o;
	},
	compare,
	initialize () {
		if (arguments.length > 0) {
			this.size = arguments[0];
		}
	},
};

var ENUM = {
	type: 'ENUM',
	NULL: true,
	options: [],
	format (o) {
		var NULL = this.NULL ? null : '';

		if (o === null) {
			return NULL;
		}

		o = '' + o;
		var options = this.options.map((s) => s.toUpperCase());
		var i = options.indexOf(o.toUpperCase());

		if (i > -1) {
			return this.options[i];
		}

		return NULL;
	},

	prepare (o) {
		if (o === null) {
			return this.NULL ? null : '';
		}
		return '' + o;
	},
	compare,
	initialize () {
		this.options = Array.prototype.slice.call(arguments);
	},
};

var INT = {
	type: 'INT',
	NULL: true,
	size: 11,
	precision: 0,
	unsigned: false,
	format (o) {
		var result;
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
			result = String(Math.round(o * k) / k).split('.');

			// if no decimal existed, make sure we create a place for it.
			if (result.length === 1) { result.push(''); }
		} else {
			// parse as float and round off, then store in an array to simplify below.
			result = [ Math.round(parseFloat(o)) ];
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

		return this.precision ? result.join('.') : '' + result[0];
	},
	prepare (o) {
		if (o === null) {
			return this.NULL ? null : 0;
		}

		o = Number(o);

		if (isNaN(o)) {
			return this.NULL ? null : 0;
		}

		return o;
	},
	compare,
	initialize () {
		if (arguments.length > 0) {
			this.size = arguments[0];
		}
		if (arguments.length > 1) {
			this.precision = arguments[1];
		}
	},
};

var DATETIME = {
	type: 'DATETIME',
	NULL: true,
	mask: 'YYYY-MM-DD HH:mm:ss',
	format (o) {
		var NULL = this.NULL ? null : '0000-00-00 00:00:00';

		if (o === null) {
			return NULL;
		}

		if (o === 'now') {
			return moment().format(this.mask);
		}

		if (!(o instanceof Date)) {
			o = new Date(o);
		}

		o = moment(o).format(this.mask);
		if (o === 'Invalid date') {
			return NULL;
		}
		return o;
	},
	compare,
};
DATETIME.prepare = DATETIME.format;

function makeType (base, extras) {
	var properties = Object.assign({}, base, extras || {});
	var type = TYPE.bind(properties);
	return Object.assign(type, properties);
}



/**
 * TEXT Column Type
 * @signature quell.TEXT
 * @memberOf Schema
 * @function TEXT
 */
exports.TEXT = makeType(TEXT, { type: 'TEXT',       size: 65535 });

/**
 * BLOB Column Type
 * @signature quell.BLOB
 * @memberOf Schema
 * @function BLOB
 */
exports.BLOB = makeType(TEXT, { type: 'BLOB',       size: 65535 });

/**
 * MEDIUMBLOB Column Type
 * @signature quell.MEDIUMBLOB
 * @memberOf Schema
 * @function MEDIUMBLOB
 */
exports.MEDIUMBLOB = makeType(TEXT, { type: 'MEDIUMBLOB', size: 16777215 });

/**
 * MEDIUMTEXT Column Type
 * @signature quell.MEDIUMTEXT
 * @memberOf Schema
 * @function MEDIUMTEXT
 */
exports.MEDIUMTEXT = makeType(TEXT, { type: 'MEDIUMTEXT', size: 16777215 });

/**
 * LONGBLOB Column Type
 * @signature quell.LONGBLOB
 * @memberOf Schema
 * @function LONGBLOB
 */
exports.LONGBLOB = makeType(TEXT, { type: 'LONGBLOB',   size: 4294967295 });

/**
 * LONGTEXT Column Type
 * @signature quell.LONGTEXT
 * @memberOf Schema
 * @function LONGTEXT
 */
exports.LONGTEXT = makeType(TEXT, { type: 'LONGTEXT',   size: 4294967295 });

/**
 * TINYBLOB Column Type
 * @signature quell.TINYBLOB
 * @memberOf Schema
 * @function TINYBLOB
 */
exports.TINYBLOB = makeType(TEXT, { type: 'TINYBLOB',   size: 255 });

/**
 * TINYTEXT Column Type
 * @signature quell.TINYTEXT
 * @memberOf Schema
 * @function TINYTEXT
 */
exports.TINYTEXT = makeType(TEXT, { type: 'TINYTEXT',   size: 255 });

/**
 * VARCHAR Column Type
 * @signature quell.VARCHAR([size])
 * @param {number} [size=255] Size of the varchar.
 * @signature quell.VARCHAR(settings)
 * @param {object} settings Detailed column options
 * @example
 * quell.VARCHAR({
 *   size: 10,
 *   NULL: false
 * })
 * @memberOf Schema
 * @function VARCHAR
 */
exports.VARCHAR = makeType(TEXT, { type: 'VARCHAR',    size: 255 });

/**
 * CHAR Column Type
 * @signature quell.CHAR([size])
 * @param {number} [size=255] Size of the char.
 * @signature quell.CHAR(settings)
 * @param {object} settings Detailed column options
 * @example
 * quell.CHAR({
 *   size: 10,
 *   NULL: false
 * })
 * @memberOf Schema
 * @function CHAR
 */
exports.CHAR = makeType(TEXT, { type: 'CHAR',       size: 255 });

/**
 * INT Column Type
 * @signature quell.INT([length])
 * @param {number} [length=11] Size of the integer.
 * @memberOf  Schema
 * @signature quell.INT(settings)
 * @param {object} settings Detailed column options
 * @example
 * quell.INT({
 *   length: 10,
 *   unsigned: true,
 *   NULL: false
 * })
 * @alias INTEGER
 * @function INT
 */
exports.INT = makeType(INT);
exports.INTEGER = makeType(INT);

/**
 * TINYINT Column Type
 * @signature quell.TINYINT([length])
 * @param {number} [length=1] Size of the integer.
 * @signature quell.TINYINT(settings)
 * @param {object} settings Detailed column options
 * @example
 * quell.TINYINT({
 *   length: 2,
 *   unsigned: true,
 *   NULL: false
 * })
 * @memberOf Schema
 * @function TINYINT
 */
exports.TINYINT = makeType(INT,  { type: 'TINYINT',    size: 1 });

/**
 * SMALLINT Column Type
 * @signature quell.SMALLINT([length])
 * @param {number} [length=4] Size of the integer.
 * @signature quell.SMALLINT(settings)
 * @param {object} settings Detailed column options
 * @example
 * quell.SMALLINT({
 *   length: 3,
 *   unsigned: true,
 *   NULL: false
 * })
 * @memberOf Schema
 * @function SMALLINT
 */
exports.SMALLINT = makeType(INT,  { type: 'SMALLINT',   size: 4 });

/**
 * MEDIUMINT Column Type
 * @signature quell.MEDIUMINT([length])
 * @param {number} [length=8] Size of the integer.
 * @signature quell.MEDIUMINT(settings)
 * @param {object} settings Detailed column options
 * @example
 * quell.MEDIUMINT({
 *   length: 10,
 *   unsigned: true,
 *   NULL: false
 * })
 * @memberOf Schema
 * @function MEDIUMINT
 */
exports.MEDIUMINT = makeType(INT,  { type: 'MEDIUMINT',  size: 8 });

/**
 * BIGINT Column Type
 * @signature quell.BIGINT([length])
 * @param {number} [length=20] Size of the integer.
 * @signature quell.BIGINT(settings)
 * @param {object} settings Detailed column options
 * @example
 * quell.BIGINT({
 *   length: 10,
 *   unsigned: true,
 *   NULL: false
 * })
 * @memberOf Schema
 * @function BIGINT
 */
exports.BIGINT = makeType(INT,  { type: 'BIGINT',     size: 20 });

/**
 * FLOAT Column Type
 * @signature quell.FLOAT([length], [precision])
 * @param {number} [length=10] Display length of the float value, in characters.
 * @param {number} [precision] Number of decimal places
 * @signature quell.FLOAT(settings)
 * @param {object} settings Detailed column options
 * @example
 * quell.FLOAT({
 *   length: 6,
 *   precision: 4
 *   NULL: false
 * })
 * @memberOf Schema
 * @function FLOAT
 */
exports.FLOAT = makeType(INT,  { type: 'FLOAT',      size: 10, precision: 2 });

/**
 * DOUBLE Column Type
 * @signature quell.DOUBLE([length], [precision])
 * @param {number} [length=10] Display length of the double value.
 * @param {number} [precision] Number of decimal places
 * @signature quell.DOUBLE(settings)
 * @param {object} settings Detailed column options
 * @example
 * quell.DOUBLE({
 *   length: 6,
 *   precision: 4
 *   NULL: false
 * })
 * @memberOf Schema
 * @function DOUBLE
 */
exports.DOUBLE = makeType(INT,  { type: 'DOUBLE',     size: 16, precision: 4 });

/**
 * DECIMAL Column Type
 * @signature quell.DECIMAL([length], [precision])
 * @param {number} length Display length of the decimal value.
 * @param {number} precision Number of decimal places
 * @signature quell.DECIMAL(settings)
 * @param {object} settings Detailed column options
 * @example
 * quell.DECIMAL({
 *   length: 6,
 *   precision: 4
 *   NULL: false
 * })
 * @memberOf Schema
 * @function DECIMAL
 */
exports.DECIMAL = makeType(INT,  { type: 'DECIMAL',    size: 0, precision: 20 });
// DECIMALS must have a size and precision defined in the schema, so we're being ambiguous with the values

/**
 * DATETIME Column Type
 * @signature quell.DATETIME
 * @memberOf Schema
 * @function DATETIME
 */
exports.DATETIME = makeType(DATETIME);

/**
 * TIMESTAMP Column Type
 * @signature quell.DATETIME
 * @memberOf Schema
 * @function DATETIME
 */
exports.TIMESTAMP = makeType(DATETIME,  { type: 'TIMESTAMP', NULL: false });

/**
 * DATE Column Type
 * @signature quell.DATE
 * @memberOf Schema
 * @function DATE
 */
exports.DATE = makeType(DATETIME,  { type: 'DATE',  mask: 'YYYY-MM-DD' });

/**
 * TIME Column Type
 * @signature quell.TIME
 * @memberOf Schema
 * @function TIME
 */
exports.TIME = makeType(DATETIME,  { type: 'DATE',  mask: 'HH:mm:ss' });

/**
 * YEAR Column Type
 * @signature quell.YEAR
 * @memberOf Schema
 * @function YEAR
 */
exports.YEAR = makeType(DATETIME,  { type: 'YEAR',  mask: 'YYYY' });

/**
 * ENUM Column Type
 * @signature quell.ENUM(option1, option2, option3, ...)
 * @param {string} options The possible values for the enum
 * @signature quell.ENUM(settings)
 * @param {object} settings Detailed column options
 * @example
 * quell.ENUM({
 *   options: ['Normal', 'Moderator', 'Admin'],
 *   NULL: false
 * })
 * @memberOf Schema
 * @function ENUM
 */
exports.ENUM = makeType(ENUM);

/**
 * Used to define any column type not natively supported by Quell.
 *
 * See the Schema entry for details of the column format.
 *
 * @signature quell.UNKNOWN(settings)
 * @param {Object} settings Type prototype
 * @memberOf Schema
 * @type {[type]}
 */
exports.UNKNOWN = makeType(TEXT);

