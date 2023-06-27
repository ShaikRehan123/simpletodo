const express = require("express");
const cors = require("cors");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "todoApplication.db");

console.log(databasePath);

const app = express();

app.use(cors());
app.use(express.json());

let database = null;

const initializeDBAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(9090, () => {
      console.log("Server is running at http://localhost:9090/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
  const createTodoTableQuery = `
  CREATE TABLE IF NOT EXISTS todo (
    id INTEGER PRIMARY KEY,
    todo TEXT,
    status TEXT
  );`;

  await database.run(createTodoTableQuery);
};

initializeDBAndServer();

// API 1: Get all the todos
app.get("/todos/", async (request, response) => {
  const getTodosQuery = `
        SELECT
        *
        FROM
        todo;`;
  const todosArray = await database.all(getTodosQuery);
  response.json({
    todos: todosArray,
    status: "success",
  });
});

// API 2: Create a todo
app.post("/todos/", async (request, response) => {
  const { todo } = request.body;
  const id = Math.floor(Math.random() * 1000);
  const status = "TODO";

  const createTodoQuery = `
        INSERT INTO
        todo (id, todo, status)
        VALUES
        (${id}, '${todo}', '${status}');`;

  await database.run(createTodoQuery);
  response.send({
    id: id,
    status: "success",
  });
});

// API 3: Toggling the status of a todo
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  let status = "";

  const getTodoQuery = `
            SELECT
            *
            FROM
            todo
            WHERE
            id = ${todoId};`;

  const todo = await database.get(getTodoQuery);

  if (todo.status === "TODO") {
    status = "DONE";
  } else {
    status = "TODO";
  }

  const updateTodoQuery = `
            UPDATE
            todo
            SET
            status = '${status}'
            WHERE
            id = ${todoId};`;

  await database.run(updateTodoQuery);
  response.send({
    status: "Success",
  });
});

// API 4: Delete a todo
app.delete("/todos/:todoId/", async (request, response) => {
  try {
    const { todoId } = request.params;
    const deleteTodoQuery = `
            DELETE FROM
            todo
            WHERE
            id = ${todoId};`;
    await database.run(deleteTodoQuery);
    response.send({
      status: "Success",
    });
  } catch (e) {
    console.log(e);
    response.send({
      status: "Failure",
    });
  }
});

module.exports = app;
