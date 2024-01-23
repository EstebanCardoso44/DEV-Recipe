const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); // Ajout du module cors
const app = express();
const port = 2000;
const bcrypt = require('bcrypt');


// Utilisation du middleware cors
app.use(cors());

app.use(express.json());



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

// Création de la table User
const createUserTableQuery = `
  CREATE TABLE IF NOT EXISTS User (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
  )`;

db.query(createUserTableQuery, (error) => {
  if (error) {
    console.error('Erreur lors de la création de la table User :', error);
    throw error;
  }

  console.log('Table User créée avec succès.');
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

// Insertion d'exemples d'utilisateurs
const insertIntoUserQuery = `
  INSERT INTO User (username, password) VALUES
    ('john_doe', '${bcrypt.hashSync('johns_password', 10)}'),
    ('jane_smith', '${bcrypt.hashSync('janes_password', 10)}')
`;

db.query(insertIntoUserQuery, (err) => {
  if (err) {
    console.error('Erreur lors de l\'insertion des valeurs dans la table User :', err);
  } else {
    console.log('Valeurs insérées dans la table User');
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

  app.use(express.json())
  // Endpoint pour la création de compte (signup)
  app.post('/register', async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Check if both username and password are provided
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
  
      // Query to insert the new user into the User table
      const insertUserQuery = 'INSERT INTO User (username, password) VALUES (?, ?)';
  
      // Execute the query with the username and password
      db.query(insertUserQuery, [username, password], (error, result) => {
        if (error) {
          console.error('Error inserting user into the database:', error);
          res.status(500).json({ error: 'Error inserting user into the database' });
        } else {
          console.log('User inserted successfully into the database');
          res.status(201).json({ success: true, message: 'User registered successfully' });
        }
      });
  
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ error: 'Error registering user' });
    }
  });