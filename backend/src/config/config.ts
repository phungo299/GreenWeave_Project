import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

interface Config {
  env: string;
  port: number;
  mongoUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  mailUser: string;
  mailPassword: string;
  apiUrl: string;
  corsOrigin: string;
  logLevel: string;
}

// Default configurations
const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/greenweave',
  jwtSecret: process.env.SECRET_KEY || 'toiyeujangwonyoung',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  mailUser: process.env.MAIL_USER || '',
  mailPassword: process.env.MAIL_PASSWORD || '',
  apiUrl: process.env.API_URL || 'http://localhost:5000',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  logLevel: process.env.LOG_LEVEL || 'info'
};

// Validate required environment variables
const requiredEnvVars: Array<keyof Config> = ['mongoUri', 'jwtSecret', 'mailUser', 'mailPassword'];

requiredEnvVars.forEach((varName) => {
  if (!config[varName]) {
    console.warn(`Warning: Environment variable ${varName} is not set`);
  }
});

export default config; 