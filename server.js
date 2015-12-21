var express = require('express');
var bodyParser = require('body-parser');

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
	res.json(todos);
});

app.get('/todos/:id', function (req, res) {
	//2nd argument is base
	var todoID = parseInt(req.params.id, 10);

	var matchedTODO;

	todos.forEach(function (todo) {
		if(todo.id === todoID)
		{
			matchedTODO = todo;
		}
	});

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
	var body = req.body;

	body.id = todoNextID;
	todoNextID++;
	todos.push(body);
	
	console.log('description ' + body.description);

	res.send(body);
});

app.listen(PORT, function () {
	console.log('Express listening on port ' + PORT + '!');
});