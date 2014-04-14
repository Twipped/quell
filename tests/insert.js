var provider = require('nodeunit-dataprovider');
var seaquell = require('../seaquell');
var Promise = require('es6-promise').Promise;

// exports['insert using promise'] = function (test) {
	
// 	var Model = seaquell('users', {
// 		connection: mockConnection(),
// 		schema: {
// 			columns: []
// 		}
// 	});
// 	var model = new Model({id:1, name:'john doe'});
	
// 	model._promiseValidateSchema = function () {
// 		return Promise.resolve();
// 	};

// 	model.buildInsertQuery = function (tablename, write, replace) {
// 		return {query: "QUERY", data: [22]};
// 	};

// 	model.promiseQueryRun = function (query, connection) {
// 		return Promise.resolve({insertId: 5});
// 	};

// 	model.insert().then(function (actual) {
// 		test.ok(true, 'promise resolved');
// 		test.done();
// 	}, function (err) {
// 		console.error(err);
// 		test.ok(false, 'promise rejected');
// 		test.done();
// 	});

// };
