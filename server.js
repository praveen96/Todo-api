var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000
/*var todos = [{
	id: 1,
	description: 'do some work',
	completed: false,
},
{
	id: 2,
	description: 'stop thinking',
	completed: false
},
{
	id: 3,
	description: 'browse fb',
	completed: true
}];*/
var todoNextID = 1;
var todos = [];

app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('TODO API root');
});

app.get('/todos', function (req, res) {
	var queryParams = req.query;

	var filteredTodos = todos;

	if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'true')
	{
		filteredTodos = _.where(filteredTodos, {completed: true});
	}
	else if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'false')
	{
		filteredTodos = _.where(filteredTodos, {completed: false});
	}

	if(queryParams.hasOwnProperty('q') && queryParams.q.length > 0)
	{
		filteredTodos = _.filter(filteredTodos, function (todo) {
			return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
		});
	}
	//res.json(todos);
	res.json(filteredTodos);
});

app.get('/todos/:id', function (req, res) {
	//2nd argument is base
	var todoID = parseInt(req.params.id, 10);

	/*var matchedTODO;

	todos.forEach(function (todo) {
		if(todo.id === todoID)
		{
			matchedTODO = todo;
		}
	});*/
	
	var matchedTODO = _.findWhere(todos, {id: todoID});

	if(matchedTODO)
	{
		res.json(matchedTODO);
	}
	else
	{
		res.status(404).send('Unable to find todo!');
	}

	res.send('Asking for todo with id of ' + req.params.id);
});

app.post('/todos', function (req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0)
	{
		return res.status(404).send();
	}
	body.description = body.description.trim();
	body.id = todoNextID;
	todoNextID++;
	todos.push(body);

	console.log('description ' + body.description);

	res.send(body);
});

app.delete('/todos/:id', function (req, res) {
	var todoID = parseInt(req.params.id, 10);
	var matchedTODO = _.findWhere(todos, {id: todoID});

	if(!matchedTODO)
	{
		return res.status(404).json({"error": "no todo found with this todo"});
	}
	todos = _.without(todos, matchedTODO);
	res.json(matchedTODO);
});

app.put('/todos/:id', function (req, res) {
	var todoID = parseInt(req.params.id, 10);
	var matchedTODO = _.findWhere(todos, {id: todoID});
	var body = _.pick(req.body, 'description', 'completed');
	var validAttributes = {};

	if(!matchedTODO)
	{
		return res.status(404).json({"error": "no todo found with this todo"});
	}

	if(body.hasOwnProperty('completed') && _.isBoolean(body.completed))
	{
		validAttributes.completed = body.completed;
	}
	else if(body.hasOwnProperty('completed'))
	{
		return res.status(404).send();
	}

	if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0)
	{
		validAttributes.description = body.description;
	}
	else if(body.hasOwnProperty('description'))
	{
		return res.status(404).send();
	}

	_.extend(matchedTODO, validAttributes);
	res.json(matchedTODO);
});

app.listen(PORT, function () {
	console.log('Express listening on port ' + PORT + '!');
});