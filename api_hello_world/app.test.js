const request = require('supertest');
const { app, db } = require('./app'); // Modification de l'importation pour inclure la pool
let { connection, testConfig } = require('./config.test'); // Importer la connexion

beforeAll(async () => {
  console.log('Connecting to the database...');
  try {
    await db; // Attendre la pool au lieu d'une connexion unique
    console.log('Connected successfully!');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
});

afterAll(async () => {
  console.log('Closing the database connection pool...');
  try {
    await db.end(); // Fermer la pool au lieu d'une connexion unique
    console.log('Connection pool closed successfully!');
  } catch (error) {
    console.error('Error closing the database connection pool:', error);
  }
});

beforeEach(() => {
  // Créer un mock pour la connexion à la base de données
  connection = {
    query: jest.fn(),
    end: jest.fn(),
  };
});

describe('GET /hello', () => {
  test('répond avec "Hello, World!"', async () => {
    // Simuler le résultat de la requête attendu
    jest.spyOn(connection, 'query').mockResolvedValueOnce([['Hello, World!']]);

    const response = await request(app).get('/hello');

    expect(response.text).toBe('Hello, World!');
    expect(response.statusCode).toBe(200);
    expect(connection.query).toHaveBeenCalledTimes(1);
  });
});