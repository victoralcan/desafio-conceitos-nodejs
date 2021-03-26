const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const existsUser = users.find(user => user.username === username);

  if (!existsUser) {
    return response.status(400).json({ error: 'Mensagem do erro' });
  }

  request.username = username;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const alreadyExistsUser = users.some(user => user.username === username);

  if (alreadyExistsUser) {
    return response.status(400).json({ error: 'Mensagem do erro' });
  }

  const newUser = {
    name,
    username,
    id: uuidv4(),
    todos: []
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  const { username } = request;

  return response.status(200).json(username.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request;

  const newTodo = {
    id: uuidv4(), // precisa ser um uuid
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  users.find(user => user.username === username).todos.push(newTodo);

  return response.status(200).send();
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const toModifyTodo = users.find(user => user.username === username).todos.find(todo => todo.id === id);

  if(!toModifyTodo) {
    return response.status(400).json({ error: 'Mensagem do erro' });
  }

  users.find(user => user.username === username).todos.find(todo => todo.id === id).title = title;
  users.find(user => user.username === username).todos.find(todo => todo.id === id).deadline = deadline;

  return response.status(200).send();
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const toCheckAsDoneTodo = users.find(user => user.username === username).todos.find(todo => todo.id === id);

  if(!toCheckAsDoneTodo) {
    return response.status(400).json({ error: 'Mensagem do erro' });
  }

  users.find(user => user.username === username).todos.find(todo => todo.id === id).done = true;


});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const toDeleteTodoIndex = users.find(user => user.username === username).todos.findIndex(todo => todo.id === id);

  if(!toDeleteTodoIndex) {
    return response.status(400).json({ error: 'Mensagem do erro' });
  }

  users.find(user => user.username === username).todos.splice(toDeleteTodoIndex, 1);

  return response.status(200).send();
});

module.exports = app;