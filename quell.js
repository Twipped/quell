var assign = require('lodash.assign');
var types = require('./lib/types');
var queryize = require('queryize');
var Promise = require('es6-promise').Promise;
var proxmis = require('proxmis');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var modelBase;

/**
 * Creates a model object using provided the tablename and/or prototype.
 * All properties of the options object will applied to the model's prototype as initial values.
 *
 * @name  quell
 * @typedef Quell
 * @constructor
 * @param  {string} [tablename]
 * @param  {object} [options]
 * @return {Model}
 */
var quell = module.exports = function (tablename, options) {

	if (typeof tablename === 'object') {
		options = tablename;
	} else {
		options = options || {};
		options.tablename = tablename;
	}

	if (!options.tablename || typeof options.tablename !== 'string') {throw new TypeError('Tablename must be a string.');}

	var model = function () {
		if (model.connection) {
			this.connection = model.connection;
		}
		modelBase.apply(this, arguments);
	};

	// Copy over the Model members
	assign(model, modelBase);

	// Create the new Model prototype
	model.prototype = Object.create(modelBase.prototype);

	// Apply any overrides
	assign(model.prototype, options);

	model.prototype.tablename = model.tablename = options.tablename;
	model.connection = model.prototype.connection = options.connection || quell.connection || false;

	return model;
};

assign(quell, types);

/**
 * Model constructor used to create a new record.
 * Takes the default data contents of the model.
 *
 *     var User = new Quell('users')
 *     var userRecord = new User();
 *
 * @name Model
 * @typedef Model
 * @constructor
 * @param  {object} [data]
 * @param  {object} [options]
 * @return {Record}
 */
modelBase = quell._model = function (data, options) {
	data = data || {};
	options = options || {};

	if (options.connection) {
		this.connection = options.connection;
	} else if (quell.connection) {
		this.connection = quell.connection;
	}

	this.data = {};
	this.set(data, options);
	this.changed = {};

	EventEmitter.call(this);
	this.initialize.apply(this, arguments);
};

util.inherits(modelBase, EventEmitter);


/**
 * @name Record
 * @typedef Record
 * @type {Object}
 */
assign(modelBase.prototype, {
	/**
	 * The raw model data.
	 * @memberOf Record
	 * @internal Not intended for direct access.  Use Record.get() and Record.set() instead.
	 * @type {object}
	 */
	data: null,

	/**
	 * Indicates if the record already exists in the database.  Will be null if existence is unknown.
	 * @memberOf Record
	 * @type {boolean}
	 */
	exists: null,

	/**
	 * Function called at model initialization.  Receives all arguments passed to `new Model()`.
	 * @memberOf Record
	 */
	initialize: function () {},


	/**
	 * Gets the current value of a column from the Record.
	 * @memberOf Record
	 * @param  {string} field The column to retrieve.
	 * @param  {boolean} [formatted] Indicates if the data should be returned in the format MySQL would store it in. Defaults to true.
	 * @return {[type]}
	 */
	get: function (field, formatted) {
		// default to formatted unless the user passed false
		if ((formatted || formatted === undefined) && this.schema && this.schema.columns && this.schema.columns[field]) {
			return this.schema.columns[field].format(this.data[field]);
		} else {
			return this.data[field];
		}
	},

	/**
	 * Set a hash of attributes (one or many) on the model.
	 * If any of the attributes change the model's state, a "change" event will be triggered on the model. Change events for specific attributes are also triggered, and you can bind to those as well, for example: change:title, and change:content. You may also pass individual keys and values.
	 * @memberOf Record
	 * @param {string|object} field
	 * @param {mixed} [value]
	 * @param {object} [options]
	 */
	set: function (field, value, options) {
		var attr, attrs, unset, changes, silent, changing, prev, current;
		if (!field) {
			return this;
		}

		// Handle both `"field", value` and `{field: value}` -style arguments.
		if (typeof field === 'object') {
			attrs = field;
			options = value;
		} else {
			(attrs = {})[field] = value;
		}

		options = options || {};

		// Extract data and options.
		unset           = options.unset;
		silent          = options.silent;
		changes         = [];
		changing        = this._changing;
		this._changing  = true;

		if (!changing) {
			this._previousData = clone(this.data);
			this.changed = {};
		}
		current = this.data;
		prev = this._previousData;

		// For each `set` data, update or delete the current value.
		for (attr in attrs) {
			value = attrs[attr];
			if (!isEqual(current[attr], value, this.schema && this.schema[attr])) {changes.push(attr);}
			if (!isEqual(prev[attr], value, this.schema && this.schema[attr])) {
				this.changed[attr] = value;
			} else {
				delete this.changed[attr];
			}
			if (unset) {
				delete current[attr];
			} else {
				current[attr] = value;
			}
		}

		// Trigger all relevant data changes.
		if (!silent) {
			if (changes.length) {this._pending = true;}
			for (var i = 0, l = changes.length; i < l; i++) {
				this.emit('change:' + changes[i], this, current[changes[i]], options);
			}
		}

		// You might be wondering why there's a `while` loop here. Changes can
		// be recursively nested within `"change"` events.
		if (changing) {return this;}
		if (!silent) {
			while (this._pending) {
				this._pending = false;
				this.emit('change', this, options);
			}
		}
		this._pending = false;
		this._changing = false;
		return this;
	},

	/**
	 * Remove an attribute by deleting it from the internal attributes hash.
	 * Fires a "change" event unless silent is passed as an option.
	 * @memberOf Record
	 * @param  {string} field
	 * @param  {object} [options]
	 */
	unset: function (field, options) {
		return this.set(field, void 0, assign({}, options, {unset: true}));
	},

	/**
	 * Returns `true` if the attribute is set to a non-null or non-undefined value.
	 * @memberOf Record
	 * @param  {string}  field
	 * @return {Boolean}
	 */
	has: function (field) {
		return this.get(field, false) !== undefined;
	},

	load: function (value, field, callback) {
		switch (arguments.length) {
		case 3:
			break;
		case 2:
			if (typeof field === 'function') {
				callback = field;
				field = undefined;
			}
			break;
		case 1:
			if (typeof value === 'function') {
				callback = value;
				value = undefined;
				field = undefined;
			}
		}

		var defer;
		if (value === undefined) {
			defer = this._loadWithExisting();
		} else if (typeof value === 'object') {
			defer = this._loadWithMultiColumn(value);
		} else if (isScalar(value)) {
			if (field === undefined) {
				defer = this._loadWithPrimaryKey(value);
			} else {
				defer = this._loadWithSingleColumn(value, field);
			}
		}

		if (typeof callback === 'function') {
			var self = this;
			return defer.then(
				function () { callback(null, self); },
				function (err) { callback(err); }
			);
		} else {
			return defer;
		}
	},

	save: function (options, callback) {
		var self = this;

		if (typeof options === 'function') {
			callback = options;
			options = {};
		} else {
			options = options || {};
			options.callback = options.callback || callback;
		}

		if (options.replace) {
			var ai = this.schema && this.schema.autoincrement;
			if (ai) {
				this.unset(ai);
			}

			return this.insert(options);

		}

		return Promise.cast(self.exists === null ? self._promiseIfExists() : self.exists)
			.then(function (exists) {
				if (exists) {
					return self.update(options, callback);
				} else {
					return self.insert(options, callback);
				}
			});
	},

	insert: function (options, callback) {
		if (typeof options === 'function') {
			callback = options;
			options = {callback: callback};
		} else {
			options = options || {};
			options.callback = options.callback || callback;
		}

		var self = this;
		return this._promiseValidateSchema().then(function () {
			var write = {},
				fields = Object.keys(self.data),
				field, type,
				i = 0,
				c = fields.length;

			for (;i < c;i++) {
				field = fields[i];
				type = self.schema.columns[field];

				if (type && (options.replace || self.schema.autoincrement !== field)) {
					write[field] = type.prepare(self.data[field]);
				}
			}

			return quell._buildInsertQuery(self.tablename, write, options.replace);
		}).then(function (query) {
			return quell._promiseQueryRun(query.query, query.data, self.connection || options.connection || quell.connection);
		}).then(function (result) {
			if (self.schema.autoincrement && result && result.insertId !== undefined) {
				self.data[self.schema.autoincrement] = result.insertId;
			}

			if (options.callback) {
				options.callback(null, self);
			}

			return self;
		}).catch(function (err) {
			if (options.callback) {
				callback(err);
			}

			return Promise.reject(err);
		});
	},

	update: function (options, callback) {
		if (typeof options === 'function') {
			callback = options;
			options = {callback: callback};
		} else {
			options = options || {};
			options.callback = options.callback || callback;
		}

		var self = this;
		return this._promiseValidateSchema().then(function () {
			var lookup = {},
				write = {},
				fields = Object.keys(self.data),
				field, type,
				i,c;

			for (i = 0, c = self.schema.primaries.length;i < c;i++) {
				field = self.schema.primaries[i];
				type = self.schema.columns[field];

				if (!self.has(field)) {
					throw new Error('Could not update quell record, required primary key value was absent: ' + field);
				} else {
					lookup[field] = type.prepare(self.data[field]);
				}
			}

			for (i = 0, c = fields.length;i < c;i++) {
				field = fields[i];
				type = self.schema.columns[field];

				if (type && (options.replace || self.schema.autoincrement !== field)) {
					write[field] = type.prepare(self.data[field]);
				}
			}

			return quell._buildUpdateQuery(self.tablename, write, lookup);
		}).then(function (query) {
			return quell._promiseQueryRun(query.query, query.data, self.connection || options.connection || quell.connection);
		}).then(function () {
			if (options.callback) {
				options.callback(null, self);
			}

			return self;
		}).catch(function (err) {
			if (options.callback) {
				callback(err);
			}

			return Promise.reject(err);
		});
	},


	delete: function (options, callback) {
		if (typeof options === 'function') {
			callback = options;
			options = {callback: callback};
		} else {
			options = options || {};
			options.callback = options.callback || callback;
		}

		var self = this;
		return this._promiseValidateSchema().then(function () {
			var lookup = {},
				lookupCount = 0,
				field, type,
				fields = self.schema.primaries,
				i = 0,
				c = fields.length;

			// If the schema has no primary keys, use any column data we have.
			if (c) {
				for (;i < c;i++) {
					field = fields[i];
					type = self.schema.columns[field];

					if (!self.has(field)) {
						throw new Error('Could not delete quell record, required primary key value was absent: ' + field);
					} else {
						lookup[field] = type.prepare(self.data[field]);
						lookupCount++;
					}
				}
			} else {
				fields = Object.keys(self.schema.columns);
				c = fields.length;

				for (;i < c;i++) {
					field = fields[i];
					type = self.schema.columns[field];

					if (self.has(field)) {
						lookup[field] = type.prepare(self.data[field]);
						lookupCount++;
					}
				}
			}

			if (!lookupCount) {
				throw new Error('Could not delete quell record, no data was available to delete against.');
			}


			return quell._buildDeleteQuery(self.tablename, lookup);
		}).then(function (query) {
			return quell._promiseQueryRun(query.query, query.data, self.connection || options.connection || quell.connection);
		}).then(function () {
			self.exists = false;

			if (options.callback) {
				options.callback(null, self);
			}

			return self;
		}).catch(function (err) {
			if (options.callback) {
				callback(err);
			}

			return Promise.reject(err);
		});
	},


	_loadWithExisting: function () {
		var self = this;
		return this._promiseValidateSchema().then(function () {
			if (!self.schema.primaries || !self.schema.primaries.length) {
				throw new Error('Could not load quell model using existing data; table has no primary keys.');
			}

			var lookup = {},
				field, type,
				i,c;

			for (i = 0, c = self.schema.primaries.length;i < c;i++) {
				field = self.schema.primaries[i];
				type = self.schema.columns[field];

				if (!self.has(field)) {
					throw new Error('Could not load quell record, required primary key value was absent: ' + field);
				} else {
					lookup[field] = type.prepare(self.data[field]);
				}
			}

			return self._loadUsing(lookup);
		});
	},

	_loadWithPrimaryKey: function (value) {
		var self = this;
		return this._promiseValidateSchema().then(function () {
			if (!self.schema.primaries.length) {
				throw new Error('Could not load quell model using existing data; schema has no primary keys.');
			}

			if (self.schema.primaries.length > 1) {
				throw new Error('Could not load quell model using single primary key, schema has more than one primary key.');
			}

			var key = self.schema.primaries[0],
				type = self.schema.columns[key],
				lookup = {};

			lookup[key] = type.prepare(value);

			return self._loadUsing(lookup);
		});
	},

	_loadWithSingleColumn: function (value, field) {
		var self = this;
		return this._promiseValidateSchema().then(function () {
			var type = self.schema.columns[field],
				lookup = {};

			if (!type) {
				throw new Error('Could not load quell model, ' + field + ' does not exist in the table schema.');
			}

			lookup[field] = type.prepare(value);

			return self._loadUsing(lookup);
		});
	},

	_loadWithMultiColumn: function (search) {
		var self = this;
		return this._promiseValidateSchema().then(function () {
			if (typeof search !== 'object' || !Object.keys(search).length) {
				throw new Error('Could not load quell model; provided data was empty or not an object.');
			}

			var lookup = {},
				fields = Object.keys(search),
				field, type,
				i,c;

			for (i = 0, c = fields.length;i < c;i++) {
				field = fields[i];
				type = self.schema.columns[field];

				if (!type) {
					throw new Error('Could not load quell model, ' + field + ' does not exist in the table schema.');
				} else {
					lookup[field] = type.prepare(search[field]);
				}
			}

			return self._loadUsing(lookup);
		});
	},


	_loadUsing: function (lookup) {
		var self = this;
		var query = quell._buildSelectQuery(self.tablename, lookup);

		return quell._promiseQueryRun(query.query, query.data, self.connection).then(function (results) {
			// If results are returned, then we found the row and can map the data onto the model
			// If no results were returned, then the row wasn't found and we resolve with false.
			if (results.length) {
				self.exists = true;
				self.set(results[0]);
				self.changed = {};
				return self;
			} else {
				self.exists = false;
				return false;
			}
		});
	},

	_promiseIfExists: function () {
		var self = this;
		return this._promiseValidateSchema().then(function () {
			var lookup = {},
				key,
				i = 0,
				c = self.schema.primaries.length;

			// if there are no primary keys, then it is impossible to determine if this row existed
			// in a previous state. Therefore, we return true if we already knew it existed before
			// or false if the previous state is unknown.  This means that all new models without
			// primary keys will default to inserts.
			if (!c) {
				return (!!self.exists);
			}

			// Iterate over all primary keys. If we do not have a value for a key, assume the
			// record does not exist. If all keys have values, perform a lookup of those fields
			// and values to verify that the row exists.
			for (;i < c;i++) {
				key = self.schema.primaries[i];
				if (!self.has(key)) {
					return (self.exists = false);
				} else if (self.schema.columns[key]) {
					lookup[key] = self.schema.columns[key].prepare(self.data[key]);
				}
			}

			var query = quell._buildSelectQuery(self.tablename, lookup, self.schema.primaries);

			return quell._promiseQueryRun(query.query, query.data, self.connection).then(function (results) {
				self.exists = !!results.length;
				return self.exists;
			});

		});
	},

	_promiseValidateSchema: function () {
		var self = this;

		if (!this.connection) {
			throw new Error('quell model does not have a MySQL connection or pool defined.');
		}

		// if we have a schema already marked as good, just continue the callback chain
		if (this.schema && this.schema.loaded) {
			return Promise.resolve();
		}

		var valid =
			this.schema &&
			this.schema.primaries &&
			Array.isArray(this.schema.primaries) &&
			this.schema.columns &&
			Object.keys(this.schema.columns).length
		;

		if (!valid) {
			return quell._promiseTableSchema(this.tablename, this.connection).then(function (schema) {
				self.schema = schema;
			});
		} else {
			return Promise.resolve();
		}
	}
});



quell._buildSelectQuery = function (tablename, lookup, select) {
	var q = queryize()
		.select(select || undefined)
		.from(tablename)
		.where(lookup);

	return q.compile();
};

quell._buildInsertQuery = function (tablename, write, replace) {
	var q = queryize()[replace ? 'replace' : 'insert'](write)
		.into(tablename);

	return q.compile();
};

quell._buildUpdateQuery = function (tablename, write, lookup) {
	var q = queryize()
		.update(tablename)
		.set(write)
		.where(lookup);

	return q.compile();
};

quell._buildDeleteQuery = function (tablename, lookup) {
	var q = queryize()
		.deleteFrom(tablename)
		.where(lookup);

	return q.compile();
};

quell._promiseQueryRun = function (query, data, mysql) {
	var callback = proxmis();
	mysql.query(query, data, callback);
	return callback;
};



quell._promiseTableSchema = function (tablename, mysql) {
	var defer = proxmis();

	mysql.query('DESCRIBE ' + tablename, defer);

	return defer.then(function (results) {
		var schema = {
			columns: {},
			primaries: [],
			autoincrement: false,
			loaded: true
		};

		var i = 0, c = results.length;
		for (;i < c;i++) {
			parseRow(results[i]);
		}

		function parseRow (row) {
			var matches;
			var column = {
				NULL: row.Null === 'YES'
			};

			if (row.Type === 'date' || row.Type === 'datetime' || row.Type === 'timestamp' || row.Type === 'time' || row.Type === 'year') {
				column = types[row.Type.toUpperCase()](column);
			}

			else if ((matches = row.Type.match(/^(decimal|float|double)\((\d+),(\d+)\)/))) {
				column.size = parseInt(matches[2], 10);
				column.precision = parseInt(matches[3], 10);
				column.unsigned = row.Type.indexOf('unsigned') >= 0;
				column = types[matches[1].toUpperCase()](column);
			}

			else if ((matches = row.Type.match(/^((?:big|medium|small|tiny)?int(?:eger)?)\((\d+)\)/))) {
				column.size = parseInt(matches[2], 10);
				column.unsigned = row.Type.indexOf('unsigned') >= 0;
				column = types[matches[1].toUpperCase()](column);
			}

			else if ((matches = row.Type.match(/^enum\((.*)\)/))) {
				column.options = matches[1].split(',').map(function (o) { return o.slice(1, -1);});
				column = types.ENUM(column);
			}

			else if ((matches = row.Type.match(/^((?:var)?char)\((\d+)\)/))) {
				column.size = parseInt(matches[2], 10);
				column = types[matches[1].toUpperCase()](column);
			}

			//didn't find a known type. Split the type field by opening parens to get the type name without other info.
			else {
				column.type = row.Type.split('(')[0].toUpperCase();
				if (types[column.type]) {
					column = types[column.type](column);
				} else {
					column = types.UNKNOWN(column);
				}
			}

			schema.columns[row.Field] = column;

			if (row.Key === 'PRI') {
				schema.primaries.push(row.Field);
			}

			if (row.Extra === 'auto_increment') {
				schema.autoincrement = row.Field;
			}
		}

		return schema;
	});
};

modelBase.find = function (where) {
	var self = this;
	var q = queryize().select().from(this.tablename);
	if (where) {
		q.where(where);
	}

	var exec = q.run;
	q.exec = function (conn, callback) {
		switch (arguments.length) {
		case 2:
			break;
		case 1:
			if (typeof conn === 'function') {
				callback = conn;
				conn = self.connection || quell.connection || undefined;
			}
			break;
		case 0:
			conn = self.connection || quell.connection;
			break;
		}

		if (!conn) {
			throw new Error('You must provide a node-mysql connection or pool for this query to use.');
		}

		var defer = proxmis();
		exec.call(q, conn, defer);

		return defer.then(function (results) {
			results = results.map(function (row) {
				return new self(row);
			});

			if (callback) {
				callback(null, results);
			}
			return results;
		}, function (err) {
			if (callback) {
				callback(err);
			}
			return Promise.reject(err);
		});
	};

	return q;
};

/**
 * Pre-loads the schema details for the model.
 * @memberOf Model
 * @param  {object}   [options]
 * @param  {Function} [callback]
 * @return {Promise}
 */
modelBase.loadSchema = function (options, callback) {
	if (typeof options === 'function') {
		callback = options;
		options = {callback: callback};
	} else {
		options = options || {};
		options.callback = options.callback || callback;
	}

	var self = this;
	return quell._promiseTableSchema(this.tablename, (options && options.connection) || self.connection || quell.connection).then(function (schema) {
		self.schema = schema;
		if (options.callback) {
			callback(null, self);
		}
		return self;
	}, function (err) {
		if (callback) {
			callback(err);
		}
		return Promise.reject(err);
	});
};

/** Utility Functions *******************************************************************************************/

function isScalar (value) {
	switch (typeof value) {
	case 'string':
	case 'number':
	case 'boolean':
		return true;
	default:
		return false;
	}
}

function clone (obj) {
	var cloned = Object.create(obj),
		property;
	for (property in obj) {
		cloned[property] = obj[property];
	}
	return cloned;
}

function isEqual (a, b, ctype) {
	if (ctype) {
		return ctype.compare(a, b);
	}

	if (a === b) {return true;}

	return false;
}

