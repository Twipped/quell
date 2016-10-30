
var suite = require('../lib/db-suite');
var quell = require('../../');

suite((t, getPool) => {
	var Employee = quell('employees');
	var Department = quell('departments'); // eslint-disable-line
	var EmployeeDepartment = quell('dept_emp');

	t.test('load by primary key', (t) => {
		var employee = new Employee();

		return employee.load(10006)
			.then(() => {
				t.equal(employee.get('emp_no'),               '10006',                  'emp_no');
				t.equal(employee.get('emp_no', false),        10006,                    'emp_no');
				t.equal(employee.get('birth_date'),           '1953-04-20',             'birth_date');
				t.dateSame(employee.get('birth_date', false), new Date('1953-04-20 00:00:00'),   'birth_date');
				t.equal(employee.get('first_name'),           'Anneke',                 'first_name');
				t.equal(employee.get('last_name'),            'Preusig',                'last_name');
				t.equal(employee.get('gender'),               'F',                      'gender');
				t.equal(employee.get('hire_date'),            '1989-06-02',             'hire_date');
				t.equal(employee.get('notappearinginthistest'), undefined, 'notappearinginthistest');
			});
	});

	t.test('load by explicit key', (t) => {
		var employee = new Employee();

		return employee.load('Saniya', 'first_name')
			.then(() => {
				t.equal(employee.get('emp_no'),               '10008',                  'emp_no');
				t.equal(employee.get('emp_no', false),        10008,                    'emp_no');
				t.equal(employee.get('birth_date'),           '1958-02-19',             'birth_date');
				t.dateSame(employee.get('birth_date', false), new Date('1958-02-19 00:00:00'),   'birth_date');
				t.equal(employee.get('first_name'),           'Saniya',                 'first_name');
				t.equal(employee.get('last_name'),            'Kalloufi',                'last_name');
				t.equal(employee.get('gender'),               'M',                      'gender');
				t.equal(employee.get('hire_date'),            '1994-09-15',             'hire_date');
				t.equal(employee.get('notappearinginthistest'), undefined, 'notappearinginthistest');
			});
	});

	t.test('load by multiple key object', (t) => {
		var employeeDept = new EmployeeDepartment();

		return employeeDept.load({ emp_no: 10010, dept_no: 'd006' })
			.then(() => {
				t.equal(employeeDept.get('emp_no'),                 '10010',                          'emp_no');
				t.equal(employeeDept.get('emp_no', false),          10010,                            'emp_no');
				t.equal(employeeDept.get('dept_no'),                'd006',                           'emp_no');
				t.equal(employeeDept.get('dept_no', false),         'd006',                           'emp_no');
				t.equal(employeeDept.get('from_date'),              '2000-06-26',                     'birth_date');
				t.dateSame(employeeDept.get('from_date', false),    new Date('2000-06-26 00:00:00'),  'birth_date');
				t.equal(employeeDept.get('notappearinginthistest'), undefined, 'notappearinginthistest');
			});
	});

	t.test('load a record, change it, save change', (t) => {
		var employee = new Employee();

		return employee.load(10019)
			.then(() => {
				employee.set('gender', 'F');
				return employee.save();
			})
			.then(() => new Promise((resolve, reject) => {
				getPool().query('SELECT gender FROM employees WHERE emp_no = 10019', (err, result) => {
					if (err) return reject(err);
					return resolve(result[0]);
				});
			}))
			.then((result) => {
				t.equal(result.gender, 'F');
			});
	});

});
