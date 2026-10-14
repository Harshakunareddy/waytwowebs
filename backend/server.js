const app = require('./src/app');
const { sequelize } = require('./src/models');
const env = require('./src/config/environment');
const logger = require('./src/utils/logger');

const startServer = async () => {
  try {
    await sequelize.ensureDatabaseExists();
    await sequelize.authenticate();
    logger.info('Database connection established');

    await sequelize.sync({ alter: true });
    logger.info('Database synced');

    app.listen(env.port, () => {
      logger.info(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
    });
  } catch (err) {
    if (err.name === 'SequelizeConnectionRefusedError' || err.original?.code === 'ECONNREFUSED' || err.code === 'ECONNREFUSED') {
      logger.error(`Database is not running! Please make sure your MySQL server is running at ${env.db.host}:${env.db.port} and check your .env configuration.`);
    } else if (err.name === 'SequelizeAccessDeniedError' || err.code === 'ER_ACCESS_DENIED_ERROR') {
      logger.error(`Database access denied for user '${env.db.user}'. Please check your DB credentials in .env.`);
    } else if ((err.name === 'SequelizeDatabaseError' && err.original?.code === 'ER_BAD_DB_ERROR') || err.code === 'ER_BAD_DB_ERROR') {
      logger.error(`Database '${env.db.name}' does not exist. Please create the database first.`);
    } else if (err.name === 'SequelizeHostNotFoundError' || err.original?.code === 'ENOTFOUND' || err.code === 'ENOTFOUND') {
      logger.error(`Database host not found: '${env.db.host}'. Please check your DB_HOST setting in .env.`);
    } else if (err.name && err.name.startsWith('Sequelize')) {
      logger.error(`Database error: ${err.message || 'Unable to connect to database.'}`);
    } else {
      logger.error('Failed to start server:', err);
    }
    process.exit(1);
  }
};

startServer();
