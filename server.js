var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');

var app = express();
var PORT = process.env.PORT || 3000;
var todoNextID = 1;
var todos = [];

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('TODO API root');
});

app.get('/todos', function(req, res) {
	var query = req.query;
	var where = {};

	var filteredTodos = todos;

	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}

	if (query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			$like: '%' + query.q + '%'
		};
	}

	db.todo.findAll({
		where: where
	}).then(function(todos) {
		res.json(todos);
	}, function(error) {
		res.status(500).send();
	});
});

app.get('/todos/:id', function(req, res) {
	var todoID = parseInt(req.params.id, 10);

	db.todo.findById(todoID).then(function(todo) {
		// !! -> taking a value that's not a boolean and converting it into it's truthy version
		// e.g. if todo is an array/object and is equal to null. then !!(null) = !(false) = boolean true
		if (!!todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).send();
		}
	}, function(error) {
		res.status(500).send();
	});
});

app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	//console.log("aya " + db.hasOwnProperty('todo'));

	db.todo.create(body).then(function(todo) {
		res.json(todo.toJSON());
	}, function(error) {
		res.status(400).json(error);
	});
});

app.delete('/todos/:id', function(req, res) {
	var todoID = parseInt(req.params.id, 10);

	db.todo.destroy({
		where: {
			id: todoID
		}
	}).then(function(rowsDeleted) {
		if (rowsDeleted === 0) {
			res.status(404).json({
				error: "no todo with id"
			})
		} else {
			// 204 -> everything went well and there is nothing to send back
			res.status(204).send();
		}
	}, function(error) {
		res.status(500).send();
	});
});

app.put('/todos/:id', function(req, res) {
	var todoID = parseInt(req.params.id, 10);

	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).send();
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		// not adding the last 2 checks in this if was causing heroku to succeed even if description was passed to update with a boolean
		attributes.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).send();
	}

	db.todo.findById(todoID).then(function(todo) {
		if (todo) {
			todo.update(attributes).then(function(todo) {
				res.json(todo.toJSON());
			}, function(error) {
				//400 -> invalid syntax
				res.status(400).json(error);
			});
		} else {
			res.status(404).send();
		}
	}, function(error) {
		res.status(500).send();
	})
});

app.post('/users', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function(user) {
		res.json(user.toPublicJSON());
	}, function(error) {
		res.status(400).json(error);
	});
});

app.post('/users/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.authenticate(body).then(function(user) {
		var token = user.generateToken('authentication');

		if (token) {
			res.header('Auth', ).json(user.toPublicJSON());
		} else {
			res.status(401).send();
		}
	}, function(error) {
		res.status(401).send();
	});

	/*if (typeof body.email !== 'string' || typeof body.password !== 'string') {
		return res.status(400).send();
	}

	db.user.findOne({
		where: {
			email: body.email
		}
	}).then(function(user) {
		if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
			// 401 -> authentication is possible but failed
			return res.status(401).send();
		}

		res.json(user.toPublicJSON());
	}).then(function(error) {
		res.status(500).send();
	})*/

	//res.json(body);
});

db.sequelize.sync({
	force: true
}).then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '!');
	});
});