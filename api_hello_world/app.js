const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const port = 2000;

let connection;

if (process.env.NODE_ENV !== 'test') {
  // Utiliser la connexion à la base de données pour exécuter une requête
  connection = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  // Pas besoin de connection.connect() ici avec createPool
} else {
  const testConfig = require('./config.test');
  connection = mysql.createPool(testConfig);
  // Pas besoin de connection.connect() ici avec createPool
}

app.get('/hello', async (req, res) => {
  if (connection) {
    // Utiliser la connexion à la base de données pour exécuter une requête
    const [rows] = await connection.query('SELECT 1');
    console.log(rows);
  }

  res.send('Hello, World!');
});

module.exports = { app, connection };
