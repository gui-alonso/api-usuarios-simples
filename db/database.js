const mysql = require('mysql2/promise');
require('dotenv').config(); // Caso queira usar variáveis de ambiente

// Configuração do MySQL
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'api_users_simples',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = db;
