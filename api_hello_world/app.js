const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 2000;

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.get('/hello', (req, res) => {
  res.send('Hello, World!');
});

app.get('/recette', async (req, res) => {
  try {
    const [rows, fields] = await pool.promise().query('SELECT * FROM Recipe');
    res.json({ recipes: rows });
  } catch (error) {
    console.error("Error fetching data from database:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log("Server is listening on Port", port);
});
