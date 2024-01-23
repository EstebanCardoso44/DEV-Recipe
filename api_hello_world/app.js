const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const loginRouter = require('./login'); // Chemin relatif pour importer login.js

const app = express();
const port = 2000;

// Utilisation du middleware cors
app.use(cors());

const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

console.log(process.env.MYSQL_HOST);

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS Recipe (
      id INT AUTO_INCREMENT PRIMARY KEY,
      recipe_name VARCHAR(255) NOT NULL
    )`;

db.query(createTableQuery, (error) => {
  if (error) {
    console.error('Erreur lors de la création de la table Recipe :', error);
    throw error;
  }

  console.log('Table Recipe créée avec succès.');
});

const insertIntoRecipe = `
    INSERT INTO Recipe (recipe_name) VALUES
      ('Tema ce poulet'),
      ('BOULETTE')
  `;

db.query(insertIntoRecipe, (err) => {
  if (err) {
    console.error('Erreur lors de l\'insertion des valeurs dans la table Recipe :', err);
  } else {
    console.log('Valeurs insérées dans la table Recipe');
  }
});

db.connect(error => {
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

app.get('/recette', async (req, res) => {
  try {
    // Query to retrieve data from the "recipe" table
    const query = 'SELECT * FROM Recipe';

    // Execute the query
    db.query(query, (error, results) => {
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