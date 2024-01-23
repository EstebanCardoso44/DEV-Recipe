const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); // Ajout du module cors
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
    recipe_name VARCHAR(255) NOT NULL,
    categorie TEXT,
    description TEXT,
    ingredients TEXT,
    instructions TEXT,
    preparation_time INT,
    cooking_time INT,
    total_time INT,
    servings INT,
    cuisine_type VARCHAR(50),
    difficulty_level VARCHAR(50)
  )`;

const insertIntoRecipe = `
  INSERT INTO Recipe (recipe_name,categorie, description, ingredients, instructions, preparation_time, cooking_time, total_time, servings, cuisine_type, difficulty_level)
  VALUES
    ('Tema ce poulet','Plat principal', 'Une délicieuse recette de poulet avec une sauce spéciale.', '500g de poulet, 2 cuillères à soupe de sauce soja, ...', '1. Mariner le poulet dans la sauce soja. 2. Cuire à feu moyen pendant 20 minutes.', 15, 20, 35, 4, 'Française', 'Facile'),
    ('BOULETTE','dessert', 'Une recette de boulettes de viande savoureuse.', '300g de viande hachée, 1 oignon haché, ...', '1. Mélanger la viande hachée avec oignon. 2. Former des boulettes et cuire.', 10, 30, 40, 3, 'Italienne', 'Moyen')
`;

db.query(createTableQuery, (error) => {
  if (error) {
    console.error('Erreur lors de la création de la table Recipe :', error);
    throw error;
  }

  console.log('Table Recipe créée avec succès.');
});

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

app.use(express.json()); // Middleware pour analyser le corps des requêtes en JSON

app.post('/recette', async (req, res) => {
  try {
    const {
      recipe_name,
      categorie,
      description,
      ingredients,
      instructions,
      preparation_time,
      cooking_time,
      total_time,
      servings,
      cuisine_type,
      difficulty_level
    } = req.body;

    // Vérifier si le nom de la recette est fourni
    if (!recipe_name) {
      return res.status(400).json({ error: "Le nom de la recette est requis" });
    }

    // Query pour insérer la nouvelle recette dans la base de données
    const insertQuery = `
      INSERT INTO Recipe (
        recipe_name, 
        categorie, 
        description, 
        ingredients, 
        instructions, 
        preparation_time, 
        cooking_time, 
        total_time, 
        servings, 
        cuisine_type, 
        difficulty_level
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      recipe_name,
      categorie || null,
      description || null,
      ingredients || null,
      instructions || null,
      preparation_time || null,
      cooking_time || null,
      total_time || null,
      servings || null,
      cuisine_type || null,
      difficulty_level || null
    ];

    // Exécuter la requête avec les valeurs de la recette
    db.query(insertQuery, values, (error, result) => {
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
