const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); // Ajout du module cors
const app = express();
const port = 2000;

// Utilisation du middleware cors
app.use(cors());

let connection; // Ajout de cette ligne pour déclarer la variable connection

const db = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

if (process.env.NODE_ENV !== 'test') {
  // Utiliser la connexion à la base de données pour exécuter une requête
  connection = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

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
}

app.get('/hello', (req, res) => {
  res.send('Hello, World!');
});

app.get('/recette', async (req, res) => {
  try {
    const query = 'SELECT * FROM Recipe';

    // Execute query
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

app.use(express.json()); // Middleware pour analyser le corps des requêtes en JSON

app.post('/recette', async (req, res) => {
  try {
    const { recipe_name } = req.body;

    // Vérifier si le nom de la recette est fourni
    if (!recipe_name) {
      return res.status(400).json({ error: "Le nom de la recette est requis" });
    }

    // Query pour insérer la nouvelle recette dans la base de données
    const insertQuery = 'INSERT INTO Recipe (recipe_name) VALUES (?)';

    // Exécuter la requête avec le nom de la recette
    db.query(insertQuery, [recipe_name], (error, result) => {
      if (error) {
        console.error('Erreur lors de l\'insertion de la recette dans la base de données :', error);
        res.status(500).json({ error: 'Erreur lors de l\'insertion de la recette dans la base de données' });
      } else {
        console.log('Recette insérée avec succès dans la base de données');
        res.status(201).json({ success: true, message: 'Recette créée avec succès' });
      }
    });

  } catch (error) {
    console.error('Erreur lors de la création de la recette :', error);
    res.status(500).json({ error: 'Erreur lors de la création de la recette' });
  }
});

module.exports = { app, db, connection }; // Ajout de connection ici
