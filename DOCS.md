# Quell <sup>v0.1.0</sup>

<!-- div -->


<!-- div -->

## <a id="quell"></a>`quell`
* [`quell`](#quelltablename-options)

<!-- /div -->


<!-- div -->

## `Model`
* [`Model`](#modeldata-options)

<!-- /div -->


<!-- div -->

## `Record`
* [`Record`](#prototype)
* [`Record.get`](#recordgetfield--formatted)
* [`Record.set`](#recordsetfield--value-options)

<!-- /div -->


<!-- div -->

## `data`
* [`data`](#data)

<!-- /div -->


<!-- div -->

## `exists`
* [`exists`](#exists)

<!-- /div -->


<!-- div -->

## `unset`
* [`unset`](#unsetfield--options)

<!-- /div -->


<!-- div -->

## `has`
* [`has`](#hasfield)

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
<a href="#modeldata-options">#</a> [&#x24C8;](https://github.com/ChiperSoft/quell/blob/master/quell.js#L67 "View in source") [&#x24C9;][1]

Model constructor used to create a new record. Takes the default data contents of the model.

var User = new Quell('users')     var userRecord = new User();

#### Arguments
1. `[data]` *(object)*:
2. `[options]` *(object)*:

* * *

<!-- /div -->


<!-- /div -->


<!-- div -->

## `Record`

<!-- div -->

### <a id="prototype"></a>`prototype`
<a href="#prototype">#</a> [&#x24C8;](https://github.com/ChiperSoft/quell/blob/master/quell.js#L93 "View in source") [&#x24C9;][1]

*(Object)*: @name Record

* * *

<!-- /div -->


<!-- div -->

### <a id="recordgetfield--formatted"></a>`Record.get(field [, formatted])`
<a href="#recordgetfield--formatted">#</a> [&#x24C8;](https://github.com/ChiperSoft/quell/blob/master/quell.js#L121 "View in source") [&#x24C9;][1]

Gets the current value of a column from the Record.

#### Arguments
1. `field` *(string)*: The column to retrieve.
2. `[formatted]` *(boolean)*: Indicates if the data should be returned in the format MySQL would store it in. Defaults to true.

* * *

<!-- /div -->


<!-- div -->

### <a id="recordsetfield--value-options"></a>`Record.set(field [, value, options])`
<a href="#recordsetfield--value-options">#</a> [&#x24C8;](https://github.com/ChiperSoft/quell/blob/master/quell.js#L138 "View in source") [&#x24C9;][1]

Set a hash of attributes *(one or many)* on the model.
	 * If any of the attributes change the model's state, a "change" event will be triggered on the model. Change events for specific attributes are also triggered, and you can bind to those as well, for example: change:title, and change:content. You may also pass individual keys and values.

#### Arguments
1. `field` *(string|object)*:
2. `[value]` *(mixed)*:
3. `[options]` *(object)*:

* * *

<!-- /div -->


<!-- /div -->


<!-- div -->

## `data`

<!-- div -->

### <a id="data"></a>`data`
<a href="#data">#</a> [&#x24C8;](https://github.com/ChiperSoft/quell/blob/master/quell.js#L99 "View in source") [&#x24C9;][1]

*(object)*: The raw model data.

* * *

<!-- /div -->


<!-- /div -->


<!-- div -->

## `exists`

<!-- div -->

### <a id="exists"></a>`exists`
<a href="#exists">#</a> [&#x24C8;](https://github.com/ChiperSoft/quell/blob/master/quell.js#L105 "View in source") [&#x24C9;][1]

*(boolean)*: Indicates if the record already exists in the database.  Will be null if existence is unknown.

* * *

<!-- /div -->


<!-- /div -->


<!-- div -->

## `unset`

<!-- div -->

### <a id="unsetfield--options"></a>`unset(field [, options])`
<a href="#unsetfield--options">#</a> [&#x24C8;](https://github.com/ChiperSoft/quell/blob/master/quell.js#L212 "View in source") [&#x24C9;][1]

Remove an attribute by deleting it from the internal attributes hash.
	 * Fires a "change" event unless silent is passed as an option.

#### Arguments
1. `field` *(string)*:
2. `[options]` *(object)*:

* * *

<!-- /div -->


<!-- /div -->


<!-- div -->

## `has`

<!-- div -->

### <a id="hasfield"></a>`has(field)`
<a href="#hasfield">#</a> [&#x24C8;](https://github.com/ChiperSoft/quell/blob/master/quell.js#L221 "View in source") [&#x24C9;][1]

Returns `true` if the attribute is set to a non-null or non-undefined value.

#### Arguments
1. `field` *(string)*:

* * *

<!-- /div -->


<!-- /div -->


<!-- /div -->


  [1]: #quell "Jump back to the TOC."