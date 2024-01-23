const mysql = require('mysql2/promise');

// Configuration pour les tests
const testConfig = {
  host: process.env.TEST_MYSQL_HOST || 'localhost',
  user: process.env.TEST_MYSQL_USER || 'test_user',
  password: process.env.TEST_MYSQL_PASSWORD || 'test_password',
  database: process.env.TEST_MYSQL_DATABASE || 'test_database',
};

// Créer une connexion à la base de données pour les tests
const connection = mysql.createConnection(testConfig);

require('iconv-lite').encodingExists('cesu8'); // Ajout de cette ligne pour gérer l'erreur 

module.exports = {
  connection,  // Exporter la connexion pour qu'elle puisse être utilisée dans les tests
  testConfig,
};

test('dummy test', () => {
  expect(true).toBe(true);
});
