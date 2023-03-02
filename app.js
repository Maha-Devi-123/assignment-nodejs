const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const { format } = require("date-fns");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db;
//Installing DB and Server
const dbAndServerInstallation = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running!!");
    });
  } catch (error) {
    console.log(`Database Error: ${error.message}`);
    process.exit(1);
  }
};
dbAndServerInstallation();

//function to change case
const changeCase = (obj) => {
  return {
    id: obj.id,
    todo: obj.todo,
    priority: obj.priority,
    status: obj.status,
    category: obj.category,
    dueDate: format(new Date(obj.due_date), `yyyy-MM-dd`),
  };
};

app.get("/todos/", async (request, response) => {
  const { priority, status, category, search_q } = request.query;
  let getQuery = null;
  switch (true) {
    case priority !== undefined &&
      status !== undefined &&
      category !== undefined:
      getQuery = `SELECT * FROM todo WHERE priority="${priority}" AND status = "${status}" 
      AND category="${category}" ;`;
      break;
    case priority !== undefined &&
      status === undefined &&
      category === undefined:
      getQuery = `SELECT * FROM todo WHERE priority="${priority}";`;
      console.log("priority query");
      break;
    case priority !== undefined &&
      status !== undefined &&
      category === undefined:
      getQuery = `SELECT * FROM todo WHERE priority="${priority}" AND status = "${status}"  ;`;
      break;
    case priority === undefined &&
      status !== undefined &&
      category !== undefined:
      getQuery = `SELECT * FROM todo WHERE status = "${status}" 
      AND category="${category}" ;`;
      break;
    case priority === undefined &&
      status === undefined &&
      category !== undefined:
      getQuery = `SELECT * FROM todo WHERE
      category="${category}" ;`;
      break;
    case priority === undefined &&
      status !== undefined &&
      category === undefined:
      getQuery = `SELECT * FROM todo WHERE status = "${status}";`;
      break;
    case priority !== undefined &&
      status === undefined &&
      category !== undefined:
      getQuery = `SELECT * FROM todo WHERE priority="${priority}" 
      AND category="${category}";`;
      break;
    case search_q !== undefined:
      getQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
      console.log("search q query");
      break;
    default:
      getQuery = `SELECT * FROM todo ORDER BY id;`;
      console.log("default query");
      break;
  }
  const result = await db.all(getQuery);
  response.send(result.map(changeCase));
});

//API2
app.get(`/todos/:todoId/`, async (request, response) => {
  const { todoId } = request.params;
  const queryToGetSpecificTodo = `SELECT * FROM todo 
    WHERE id = ${todoId};`;
  const reponseToQuery = await db.get(queryToGetSpecificTodo);
  response.send(changeCase(reponseToQuery));
});

//API3
app.get(`/agenda/`, async (request, response) => {
  const { date } = request.query;
  const queryToGetTodoBasedOnDate = `SELECT * FROM todo WHERE due_date = "${date}";`;
  const responseToQuery = await db.all(queryToGetTodoBasedOnDate);
  response.send(responseToQuery);
});

//API4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const AddNewTodoQuery = `INSERT INTO todo 
    (id,
  todo,
  priority,
  status,
  category,due_date)
  VALUES(${id},
      "${todo}",
  "${priority}",
  "${status}",
  "${category}",
  "${dueDate}");`;
  await db.run(AddNewTodoQuery);
  response.send("Todo Successfully Added");
});

//API5
app.put("/todos/:todoId/", async (request, response) => {
  const { id } = request.params;
  const { todo, priority, status, category, dueDate } = request.body;
  let updateTodoQuery;
  switch (true) {
    case status !== undefined:
      updateTodoQuery = `UPDATE todo 
            SET 
            status="${status}" ;`;
      await db.run(updateTodoQuery);
      response.send("Status Updated");
      break;
    case todo !== undefined:
      updateTodoQuery = `UPDATE todo 
            SET 
            todo="${todo}" ;`;
      await db.run(updateTodoQuery);
      response.send("Todo Updated");
      break;
    case category !== undefined:
      updateTodoQuery = `UPDATE todo 
            SET 
            category="${category}" ;`;
      await db.run(updateTodoQuery);
      response.send("Category Updated");
      break;
    case priority !== undefined:
      updateTodoQuery = `UPDATE todo 
            SET 
            priority="${priority}" ;`;
      await db.run(updateTodoQuery);
      response.send("Priority Updated");
      break;
    case dueDate !== undefined:
      updateTodoQuery = `UPDATE todo 
            SET 
            due_date="${dueDate}" ;`;
      await db.run(updateTodoQuery);
      response.send("Due Date Updated");
      break;
  }
});

//API6
app.delete(`/todos/:todoId/`, async (request, response) => {
  const { todoId } = request.params;
  const queryToDeleteTodo = `DELETE FROM todo 
    WHERE id = ${todoId};`;
  await db.run(queryToDeleteTodo);
  response.send("Todo Deleted");
});
