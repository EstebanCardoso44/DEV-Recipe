module.exports = {
    host: process.env.TEST_MYSQL_HOST || 'localhost',
    user: process.env.TEST_MYSQL_USER || 'test_user',
    password: process.env.TEST_MYSQL_PASSWORD || 'test_password',
    database: process.env.TEST_MYSQL_DATABASE || 'test_database',
  };
  
// config.test.js
test('dummy test', () => {
    expect(true).toBe(true);
  });
  