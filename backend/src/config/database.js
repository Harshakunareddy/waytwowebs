const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const env = require('./environment');
const logger = require('../utils/logger');

const ensureDatabaseExists = async () => {
  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
  });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${env.db.name}\`;`);
  await connection.end();
};

const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: false,
  },
});

sequelize.ensureDatabaseExists = ensureDatabaseExists;

module.exports = sequelize;
