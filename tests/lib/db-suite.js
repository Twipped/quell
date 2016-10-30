
var suite = require('tapsuite');
var mktmpio = require('../lib/mktmpio');
var quell = require('../../');
require('tapdate')();

var mysql = require('mysql');
var mysql2 = require('mysql2');

var dbs = { mysql, mysql2 };

module.exports = exports = function (fn) {
	Object.keys(dbs).forEach((dbName) => suite(dbName + ' integration', (t) => {
		var pool;

		t.before(() =>
			mktmpio.create()
				.then((db) => {
					t.harness.comment(`Database created: --user=${db.username} --password=${db.password} --host=${db.host} --port=${db.port}`);

					pool = dbs[dbName].createPool({
						host: db.host,
						port: db.port,
						user: 'root',
						password: db.password,
						database: 'test_data',
					});

					quell.connection = pool;

					return mktmpio.populate();
				})
				.then(() => t.harness.comment('Database populated'))
		);

		t.after(() =>
			new Promise((resolve) => {
				t.harness.comment('Disconnecting');
				pool.end(resolve);
			})
				.then(() => mktmpio.destroy())
				.then(() => t.harness.comment('Database destroyed'))
		);

		fn(t, () => pool);

	}));

};

