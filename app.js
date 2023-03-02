const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

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
  response.send(result);
});
