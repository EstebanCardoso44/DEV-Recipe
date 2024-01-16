const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 2000;

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

console.log(process.env.MYSQL_HOST);

app.get('/recette', async (req, res) => {
  try {
    // Query to retrieve data from the "recipe" table
    const query = 'SELECT * FROM recipe';

    // Execute the query
    connection.query(query, (error, results) => {
      if (error) {
        console.error('Erreur lors de la récupération des données depuis la base de données :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des données depuis la base de données' });
      } else {
        // Send the retrieved data as JSON
        res.json(results);
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des données depuis la base de données :', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des données depuis la base de données' });
  }
});

connection.connect(error => {
  if (error) {
    console.log("A error has been occurred "
      + "while connecting to database.");
    throw error;
  }

  //If Everything goes correct, Then start Express Server
  app.listen(port, () => {
    console.log("Database connection is Ready and "
      + "Server is Listening on Port ", port);
  })
});

app.get('/hello', (req, res) => {
  res.send('Hello, World!');
});