const mysql = require("mysql2");
const root = process.env.MYSQL_HOST;
const user = process.env.MYSQL_USER;
const password = process.env.MYSQL_PASSWORD;
const database = process.env.MYSQL_DATABASE;
const connection = mysql.createConnection({
  host: root,
  user: user,
  password: password,
  database: database,
});

connection.connect((error) => {
  if (error) {
    console.log("Error connect :", error.message);
    return;
  }
  console.log("Connect success ");
});

async function graph_status(req, res) {
  return new Promise((resolve, reject) => {
    const query = "SELECT Meter_Status FROM tlm_data";

    connection.query(query, (err, result) => {
      if (err) {
        console.log("Error fetching data:", err.message);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}
module.exports = graph_status;
