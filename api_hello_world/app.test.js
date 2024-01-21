const request = require('supertest');
const mysql = require('mysql2/promise');
const { app } = require('./app');
const testConfig = require('./config.test');

let connection;

beforeAll(async () => {
  console.log('Connecting to the database...');
  try {
    connection = await mysql.createConnection(testConfig);
    console.log('Connected successfully!');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
});

afterAll(async () => {
  if (connection) {
    await connection.end();
  }
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

beforeEach(async () => {
  // Réinitialiser l'état de la base de données si nécessaire
  await connection.query('DELETE FROM votre_table');
});
