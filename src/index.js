const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checkIfUserAccountExists(req, res, next) {
  const { username } = req.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  req.user = user;

  return next();
}

app.get("/users", (req, res) => {
  return res.status(200).json(users);
});

app.post("/users", (req, res) => {
  const { name, username } = req.body;

  const usernameIsTaken = users.some((user) => user.username === username);

  if (usernameIsTaken) {
    return res.status(400).json({ error: "User already taken" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);
  return res.status(201).json(user);
});

app.get("/todos", checkIfUserAccountExists, (req, res) => {
  const { user } = req;

  return res.status(200).json(user.todos);
});

app.post("/todos", checkIfUserAccountExists, (req, res) => {
  const { user } = req;
  const { title, deadline } = req.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return res.status(201).json(todo);
});

app.put("/todos/:id", checkIfUserAccountExists, (req, res) => {
  const { id } = req.params;
  const { title, deadline } = req.body;
  const { user } = req;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  res.status(200).json(todo);
});

app.patch("/todos/:id/done", checkIfUserAccountExists, (req, res) => {
  const { id } = req.params;
  const { user } = req;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }

  todo.done = true;

  res.status(200).json(todo);
});

app.delete("/todos/:id", checkIfUserAccountExists, (req, res) => {
  const { user } = req;
  const { id } = req.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }

  user.todos.splice(todo, 1);

  res.status(204).send();
});

module.exports = app;
