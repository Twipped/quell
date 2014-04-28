# Quell <sup>v0.1.0</sup>

<!-- div -->


<!-- div -->

## <a id="quell"></a>`quell`
* [`quell`](#quelltablename-options)

<!-- /div -->


<!-- div -->

## `Model`
* [`Model`](#modeldata-options)
* [`Model.find`](#modelfindwhere)
* [`Model.loadSchema`](#modelloadschemaoptions-callback)

<!-- /div -->


<!-- div -->

## `Record`
* [`Record`](#record)
* [`Record.data`](#recorddata)
* [`Record.exists`](#recordexists)
* [`Record.get`](#recordgetfield--formatted)
* [`Record.set`](#recordsetfield--value-options)
* [`Record.unset`](#recordunsetfield--options)
* [`Record.has`](#recordhasfield)
* [`Record.load`](#recordloadvalue-field-options-callback)
* [`Record.save`](#recordsaveoptions-callback)
* [`Record.insert`](#recordinsertoptions-callback)
* [`Record.update`](#recordupdateoptions-callback)
* [`Record.delete`](#recorddeleteoptions-callback)

<!-- /div -->


<!-- /div -->


<!-- div -->


<!-- div -->

## `quell`

<!-- div -->

### <a id="quelltablename-options"></a>`quell([tablename, options])`
<a href="#quelltablename-options">#</a> [&#x24C8;](https://github.com/ChiperSoft/quell/blob/master/quell.js#L22 "View in source") [&#x24C9;][1]

Creates a model object using provided the tablename and/or prototype. All properties of the options object will applied to the model's prototype as initial values.

#### Arguments
1. `[tablename]` *(string)*:
2. `[options]` *(object)*:

* * *

<!-- /div -->


<!-- /div -->


<!-- div -->

## `Model`

<!-- div -->

### <a id="modeldata-options"></a>`Model([data, options])`
<a href="#modeldata-options">#</a> [&#x24C8;](https://github.com/ChiperSoft/quell/blob/master/quell.js#L73 "View in source") [&#x24C9;][1]

Model constructor used to create a new record. Takes the default data contents of the model.

#### Arguments
1. `[data]` *(object)*:
2. `[options]` *(object)*:

#### Example
```js
var User = new Quell('users')
var userRecord = new User();
```

* * *

<!-- /div -->


<!-- div -->

### <a id="modelfindwhere"></a>`Model.find([where])`
<a href="#modelfindwhere">#</a> [&#x24C8;](https://github.com/ChiperSoft/quell/blob/master/quell.js#L1042 "View in source") [&#x24C9;][1]

Creates a Queryize chain for loading multiple records.

Overrides the `exec` function to pre-wrap all results with Quell models.

See QueryizeJS documentation for more details.

#### Arguments
1. `[where]` *(object)*: An object hash of all columns to search against. Shortcut to calling .find().where()

* * *

<!-- /div -->


<!-- div -->

### <a id="modelloadschemaoptions-callback"></a>`Model.loadSchema([options, callback])`
<a href="#modelloadschemaoptions-callback">#</a> [&#x24C8;](https://github.com/ChiperSoft/quell/blob/master/quell.js#L1099 "View in source") [&#x24C9;][1]

Pre-loads the schema details for the model.

#### Arguments
1. `[options]` *(object)*:
2. `[callback]` *(Function)*:

* * *

<!-- /div -->


<!-- /div -->


<!-- div -->

## `Record`

<!-- div -->

### <a id="record"></a>`Record`
<a href="#record">#</a> [&#x24C8;](https://github.com/ChiperSoft/quell/blob/master/quell.js#L99 "View in source") [&#x24C9;][1]

*(Object)*: @name Record

* * *

<!-- /div -->


<!-- div -->

### <a id="recorddata"></a>`Record.data`
<a href="#recorddata">#</a> [&#x24C8;](https://github.com/ChiperSoft/quell/blob/master/quell.js#L107 "View in source") [&#x24C9;][1]

*(object)*: The raw model data.

* * *

<!-- /div -->


<!-- div -->

### <a id="recordexists"></a>`Record.exists`
<a href="#recordexists">#</a> [&#x24C8;](https://github.com/ChiperSoft/quell/blob/master/quell.js#L115 "View in source") [&#x24C9;][1]

*(boolean)*: Indicates if the record already exists in the database.  Will be null if existence is unknown.

* * *

<!-- /div -->


<!-- div -->

### <a id="recordgetfield--formatted"></a>`Record.get(field [, formatted])`
<a href="#recordgetfield--formatted">#</a> [&#x24C8;](https://github.com/ChiperSoft/quell/blob/master/quell.js#L133 "View in source") [&#x24C9;][1]

Gets the current value of a column from the Record.

#### Arguments
1. `field` *(string)*: The column to retrieve.
2. `[formatted]` *(boolean)*: Indicates if the data should be returned in the format MySQL would store it in. Defaults to true.

* * *

<!-- /div -->


<!-- div -->

### <a id="recordsetfield--value-options"></a>`Record.set(field [, value, options])`
<a href="#recordsetfield--value-options">#</a> [&#x24C8;](https://github.com/ChiperSoft/quell/blob/master/quell.js#L152 "View in source") [&#x24C9;][1]

Set a hash of attributes *(one or many)* on the model.

If any of the attributes change the model's state, a "change" event will be triggered on the model. Change events for specific attributes are also triggered, and you can bind to those as well, for example: change:title, and change:content. You may also pass individual keys and values.

#### Arguments
1. `field` *(string|object)*:
2. `[value]` *(mixed)*:
3. `[options]` *(object)*:

* * *

<!-- /div -->


<!-- div -->

### <a id="recordunsetfield--options"></a>`Record.unset(field [, options])`
<a href="#recordunsetfield--options">#</a> [&#x24C8;](https://github.com/ChiperSoft/quell/blob/master/quell.js#L228 "View in source") [&#x24C9;][1]

Remove an attribute by deleting it from the internal attributes hash.

Fires a "change" event unless silent is passed as an option.

#### Arguments
1. `field` *(string)*:
2. `[options]` *(object)*:

* * *

<!-- /div -->


<!-- div -->

### <a id="recordhasfield"></a>`Record.has(field)`
<a href="#recordhasfield">#</a> [&#x24C8;](https://github.com/ChiperSoft/quell/blob/master/quell.js#L239 "View in source") [&#x24C9;][1]

Returns `true` if the attribute is set to a non-null or non-undefined value.

#### Arguments
1. `field` *(string)*:

* * *

<!-- /div -->


<!-- div -->

### <a id="recordloadvalue-field-options-callback"></a>`Record.load([value, field, options, callback])`
<a href="#recordloadvalue-field-options-callback">#</a> [&#x24C8;](https://github.com/ChiperSoft/quell/blob/master/quell.js#L271 "View in source") [&#x24C9;][1]

Fetches a record from the database.

Load may be called in a variety of ways depending on the object state. The following are all methods that may be used to load a record from a table primary keyed on an 'id' column. Returns an ES6 Promise, but a traditional callback may be supplied as the last argument instead. If the response is false, a record could not be found matching the keys requested.

If no schema is defined on the model, Quell will load the schema from the database before performing the select.

#### Arguments
1. `[value]` *(mixed)*:
2. `[field]` *(string)*:
3. `[options]` *(object)*:
4. `[callback]` *(Function)*:

#### Example
```js
var record = new Model({id: 16});
record.load(); // Load using existing data already in the

record.load(16); // Load using primary key (note, does not work for tables with multiple primaries)

record.load(16, 'id'); // Load using a specific column value (column does not need to be a primary key)

record.load({id: 16}); // Load using multiple column values, or a column hash.
```

* * *

<!-- /div -->


<!-- div -->

### <a id="recordsaveoptions-callback"></a>`Record.save([options, callback])`
<a href="#recordsaveoptions-callback">#</a> [&#x24C8;](https://github.com/ChiperSoft/quell/blob/master/quell.js#L344 "View in source") [&#x24C9;][1]

Intelligently saves the record contents to the database.

`Record.save()` attempts to ascertain if the record already exists in the database by performing a query for the primary keys. This query is skipped if it is already known if the record exists due to a fetch or `Record.exists` being set to `true` or `false`.

If the record exists, an update is performed, otherwise a fresh insert is done. If the options object contains a truthy `replace` option, the save will always be a REPLACE.

See `Record.update` and `Record.insert` for details of those behaviors.

Returns an ES6 Promise, but a traditional callback may be supplied as the last argument instead.

#### Arguments
1. `[options]` *(object)*:
2. `[callback]` *(Function)*:

* * *

<!-- /div -->


<!-- div -->

### <a id="recordinsertoptions-callback"></a>`Record.insert([options, callback])`
<a href="#recordinsertoptions-callback">#</a> [&#x24C8;](https://github.com/ChiperSoft/quell/blob/master/quell.js#L394 "View in source") [&#x24C9;][1]

Inserts the record into the database as a new row.

If the table has an auto-incrementing id, that field on the record will be updated to the new id, overwriting any existing value.

If the options object contains a truthy `replace` option, the save will always be a REPLACE using the existing primary keys *(including an auto-incrementing key)*.

Returns an ES6 Promise, but a traditional callback may be supplied as the last argument instead.

If no schema is defined on the model, Quell will load the schema from the database before performing the insert.

#### Arguments
1. `[options]` *(object)*:
2. `[callback]` *(Function)*:

* * *

<!-- /div -->


<!-- div -->

### <a id="recordupdateoptions-callback"></a>`Record.update([options, callback])`
<a href="#recordupdateoptions-callback">#</a> [&#x24C8;](https://github.com/ChiperSoft/quell/blob/master/quell.js#L461 "View in source") [&#x24C9;][1]

Updates the database with the current contents of the record.

By default the update operation uses the primary keys of the record as the `WHERE` clause of the `UPDATE` query, and will throw an error if all of the primary keys do not contain values.  This behavior can be overridden by providing a `using` hash object in the update options which defines what column values to use for the update. This is the only way to perform an update if the table schema does not define any primary keys.

Returns an ES6 Promise, but a traditional callback may be supplied as the last argument instead.

If no schema is defined on the model, Quell will load the schema from the database before performing the update.

#### Arguments
1. `[options]` *(object)*:
2. `[callback]` *(Function)*:

* * *

<!-- /div -->


<!-- div -->

### <a id="recorddeleteoptions-callback"></a>`Record.delete([options, callback])`
<a href="#recorddeleteoptions-callback">#</a> [&#x24C8;](https://github.com/ChiperSoft/quell/blob/master/quell.js#L549 "View in source") [&#x24C9;][1]

Deletes the record from the database.

By default the delete operation uses the primary keys of the record as the `WHERE` clause of the `DELETE` query, and will throw an error if all of the primary keys do not contain values.  If the table schema does not define any primary keys, Quell will use all data on the record to conduct the query.  This behavior can be overridden by providing a `using` hash object in the delete options which defines what column values to use for the delete. An error will be thrown if no values exist to perform the delete with, so as to avoid deleting everything.

Returns an ES6 Promise, but a traditional callback may be supplied as the last argument instead.

If no schema is defined on the model, Quell will load the schema from the database before performing the delete.

#### Arguments
1. `[options]` *(object)*:
2. `[callback]` *(Function)*:

* * *

<!-- /div -->


<!-- /div -->


<!-- /div -->


  [1]: #quell "Jump back to the TOC."