const express = require('express');
const bcrypt = require('bcrypt'); // Module pour le hachage des mots de passe
const jwt = require('jsonwebtoken'); // Module pour la gestion des tokens JWT
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 2000;

// Utilisation du middleware cors pour permettre les requêtes cross-origin
app.use(cors());
// Middleware pour parser le corps des requêtes en JSON
app.use(express.json());

// Connexion à la base de données MySQL
const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

// Création de la table Users si elle n'existe pas
const Sign = `
  CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
  )
`;

// Exécution de la requête de création de la table
db.query(createUsersTableQuery, (error) => {
  if (error) {
    console.error('Erreur lors de la création de la table Users :', error);
    throw error;
  }

  console.log('Table Users créée avec succès.');
});

// Endpoint pour l'inscription d'un nouvel utilisateur
app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Vérifier si l'utilisateur existe déjà dans la base de données
    const db = 'SELECT * FROM Users WHERE username = ?';
    db.query(userExistsQuery, [username], async (error, results) => {
      if (error) {
        console.error('Erreur lors de la vérification de l\'existence de l\'utilisateur :', error);
        return res.status(500).json({ error: 'Erreur lors de l\'inscription' });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: 'L\'utilisateur existe déjà' });
      }

      // Hacher le mot de passe pour le stockage sécurisé
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insérer le nouvel utilisateur dans la base de données
      const insertQuerySignLog = 'INSERT INTO Users (username, password) VALUES (?, ?)';
      db.query(insertUserQuery, [username, hashedPassword], (insertError) => {
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

// Endpoint pour la connexion d'un utilisateur existant
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Récupérer l'utilisateur depuis la base de données par son nom d'utilisateur
    const getUserQuery = 'SELECT * FROM Users WHERE username = ?';
    db.query(getUserQuery, [username], async (error, results) => {
      if (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur :', error);
        return res.status(500).json({ error: 'Erreur lors de la connexion' });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect' });
      }

      // Vérifier si le mot de passe fourni correspond à celui stocké dans la base de données
      const isPasswordValid = await bcrypt.compare(password, results[0].password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect' });
      }

      // Générer un token JWT pour l'authentification
      const token = jwt.sign({ userId: results[0].id, username: results[0].username }, 'votre_secret_jwt', { expiresIn: '1h' });

      // Envoyer le token au client
      res.json({ token });
    });
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// Lancement du serveur sur le port spécifié
app.listen(port, () => {
  console.log('Serveur en écoute sur le port', port);
});
