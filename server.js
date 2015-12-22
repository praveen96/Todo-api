var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

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

	db.todo.findAll({where: where}).then(function (todos) {
		res.json(todos);
	}, function (error) {
		res.status(500).send();
	});
});

app.get('/todos/:id', function(req, res) {
	var todoID = parseInt(req.params.id, 10);

	db.todo.findById(todoID).then(function (todo) {
		// !! -> taking a value that's not a boolean and converting it into it's truthy version
		// e.g. if todo is an array/object and is equal to null. then !!(null) = !(false) = boolean true
		if(!!todo)
		{
			res.json(todo.toJSON());
		}
		else
		{
			res.status(404).send();
		}
	}, function (error) {
		res.status(500).send();
	});
});

app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	console.log("aya " + db.hasOwnProperty('todo'));
	
	db.todo.create(body).then(function (todo) {
		res.json(todo.toJSON());
	}, function (error) {
		res.status(400).json(error);
	});
});

app.delete('/todos/:id', function(req, res) {
	var todoID = parseInt(req.params.id, 10);
	var matchedTODO = _.findWhere(todos, {
		id: todoID
	});

	if (!matchedTODO) {
		return res.status(404).json({
			"error": "no todo found with this todo"
		});
	}
	todos = _.without(todos, matchedTODO);
	res.json(matchedTODO);
});

app.put('/todos/:id', function(req, res) {
	var todoID = parseInt(req.params.id, 10);
	var matchedTODO = _.findWhere(todos, {
		id: todoID
	});
	var body = _.pick(req.body, 'description', 'completed');
	var validAttributes = {};

	if (!matchedTODO) {
		return res.status(404).json({
			"error": "no todo found with this todo"
		});
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status(404).send();
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		return res.status(404).send();
	}

	_.extend(matchedTODO, validAttributes);
	res.json(matchedTODO);
});

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '!');
	});
});