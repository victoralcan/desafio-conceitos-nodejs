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
  const { username } = request.headers;

  const todos = users.find(user => user.username === username).todos;

  return response.status(200).json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;

  const newTodo = {
    id: uuidv4(), 
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  users.find(user => user.username === username).todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { username } = request.headers;

  const toModifyTodo = users.find(user => user.username === username).todos.find(todo => todo.id === id);

  if(!toModifyTodo) {
    return response.status(404).json({ error: 'Mensagem do erro' });
  }

  users.find(user => user.username === username).todos.find(todo => todo.id === id).title = title;
  users.find(user => user.username === username).todos.find(todo => todo.id === id).deadline = deadline;

  const modifiedTodo = users.find(user => user.username === username).todos.find(todo => todo.id === id);

  return response.status(200).json(modifiedTodo);
});

app.patch('/todos/:id/done', (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const toCheckAsDoneTodo = users.find(user => user.username === username).todos.find(todo => todo.id === id);

  if(!toCheckAsDoneTodo) {
    return response.status(404).json({ error: 'Mensagem do erro' });
  }

  users.find(user => user.username === username).todos.find(todo => todo.id === id).done = true;

  const todo = users.find(user => user.username === username).todos.find(todo => todo.id === id);

  return response.status(200).json(todo);
});

app.delete('/todos/:id', (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  const todos = user.todos;

  const todoIndex = todos.findIndex(todo => todo.id === id);

  if(todoIndex === -1) {
    return response.status(404).json({ error: 'Mensagem do erro' });
  }

  users.find(user => user.username === username).todos.splice(todoIndex, 1);

  const newUserTodos = users.find(user => user.username === username).todos;

  return response.status(204).json(newUserTodos);
});

module.exports = app;