var Sequelize = require('sequelize');

var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			//notEmpty: true
			//len: [1]     //take strings of length >= 1
			len: [1, 250] //take string of length b/w 1-250
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
});

/*sequelize.sync({
	//force: true
}).then(function() {
	console.log('Everything is synced');

	Todo.create({
		description: 'kuch karna hai!',
		completed: false
	}).then(function(todo) {
		//console.log('Finished!');
		//console.log(todo);
		return Todo.create({
			description: 'xyz'
		}).then(function () {
			//return Todo.findById(1);
			return Todo.findAll({
				//where: {
				//	completed: false
				//}
				where: {
					description: {	
						$like: '%X%'
					}
				}
			});
		}).then(function (todo) {
			if(todo)
			{
				//console.log(todo.toJSON());
				todo.forEach(function (todo) {
					console.log(todo.toJSON());
				});
			}
			else
			{
				console.log('no todo found');
			}
		})
	}).catch(function (error) {
		console.log(error);
	});
});*/

sequelize.sync().then(function () {
	console.log('Everything is synced');

	Todo.findById(3).then(function (todo) {
		if(todo)
		{
			console.log(todo.toJSON());
		}
		else
		{
			console.log('todo not found');
		}
	});
});