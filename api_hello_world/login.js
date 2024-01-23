const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const cors = require('cors');
const router = express.Router();

router.use(cors());
router.use(express.json());

const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

const createUsersTableQuery = `
  CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_username VARCHAR(255) NOT NULL,
    recipe_password VARCHAR(255) NOT NULL
  )
`;

db.query(createUsersTableQuery, (error) => {
  if (error) {
    console.error('Erreur lors de la création de la table Users :', error);
    throw error;
  }

  console.log('Table Users créée avec succès.');
});

router.post('/signup', async (req, res) => {
  try {
    const { recipe_username, recipe_password } = req.body;

    // Vérifier si l'utilisateur existe déjà dans la base de données
    const userExistsQuery = 'SELECT * FROM Users WHERE recipe_username = ?';
    db.query(userExistsQuery, [recipe_username], async (error, results) => {
      if (error) {
        console.error('Erreur lors de la vérification de l\'existence de l\'utilisateur :', error);
        return res.status(500).json({ error: 'Erreur lors de l\'inscription' });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: 'L\'utilisateur existe déjà' });
      }

      // Hacher le mot de passe pour le stockage sécurisé
      const hashedPassword = await bcrypt.hash(recipe_password, 10);

      // Insérer le nouvel utilisateur dans la base de données
      const insertUserQuery = 'INSERT INTO Users (recipe_username, recipe_password) VALUES (?, ?)';
      db.query(insertUserQuery, [recipe_username, hashedPassword], (insertError) => {
        if (insertError) {
          console.error('Erreur lors de l\'insertion de l\'utilisateur :', insertError);
          return res.status(500).json({ error: 'Erreur lors de l\'inscription' });
        }

        return res.status(201).json({ message: 'Inscription réussie' });
      });
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription :', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { recipe_username, recipe_password } = req.body;

    // Récupérer l'utilisateur depuis la base de données par son nom d'utilisateur
    const getUserQuery = 'SELECT * FROM Users WHERE recipe_username = ?';
    db.query(getUserQuery, [recipe_username], async (error, results) => {
      if (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur :', error);
        return res.status(500).json({ error: 'Erreur lors de la connexion' });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect' });
      }

      // Vérifier si le mot de passe fourni correspond à celui stocké dans la base de données
      const isPasswordValid = await bcrypt.compare(recipe_password, results[0].recipe_password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect' });
      }

      // Générer un token JWT pour l'authentification
      const token = jwt.sign({ userId: results[0].id, recipe_username: results[0].recipe_username }, 'votre_secret_jwt', { expiresIn: '1h' });

      // Envoyer le token au client
      res.json({ token });
    });
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});


module.exports = router;
