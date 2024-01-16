const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

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

app.use(bodyParser.urlencoded({ extended: true }));

// Création des tables lors du démarrage de l'application
(async () => {
  try {
    const connection = await pool.getConnection();

    // Créer la table des utilisateurs
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      )
    `);

    // Créer la table des sessions
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    connection.release();
    console.log('Tables créées avec succès');
  } catch (error) {
    console.error('Erreur lors de la création des tables:', error);
  }
})();

// Route pour l'inscription
app.post('/register', async (req, res) => {
  // (La logique d'inscription reste inchangée)
});

// Route pour l'authentification

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows, fields] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);

        if (rows.length === 1) {
            const user = rows[0];

            // Vérification du mot de passe avec bcrypt
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                res.status(200).json({ message: 'Authentification réussie' });
            } else {
                res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect' });
            }
        } else {
            res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect' });
        }
    } catch (error) {
        console.error('Erreur lors de l\'authentification:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.listen(port, () => {
  console.log(`Serveur en écoute sur le port ${port}`);
});
