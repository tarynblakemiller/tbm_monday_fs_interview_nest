import { registerAs } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { DatabaseConfig } from './database.types';

export const environmentValidationSchema = Joi.object({
  //DB
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),

  //monday.com
  MONDAY_API_URL: Joi.string().uri().required(),
  MONDAY_API_TOKEN: Joi.string().required(),
  MONDAY_BOARD_ID: Joi.string().required(),

  //App
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(5173),
  CLIENT_URL: Joi.string().uri().default('http://localhost:5173'),
});

const config: Record<string, Partial<DatabaseConfig>> = {
  development: {
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'tarynblakemiller',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'fragrance_db',
    autoLoadModels: true,
    define: {
      underscored: true,
      timestamps: true,
    },
    migrationStorage: 'sequelize',
    migrationStorageTableName: 'sequelize_migrations',
  },
  test: {} as const,
  production: {} as const,
} as const;

export default config;

export const databaseConfig = registerAs('database', () => {
  const env = process.env.NODE_ENV || 'development';
  const currentConfig = config[env as keyof typeof config];
  if (!currentConfig) {
    throw new Error(`Invalid environment: ${env}`);
  }
  return currentConfig;
});

export const mondayConfig = registerAs('monday', () => {
  const config = {
    apiUrl: process.env.MONDAY_API_URL,
    apiToken: process.env.MONDAY_API_TOKEN,
    boardId: process.env.MONDAY_BOARD_ID,
  };

  Object.entries(config).forEach(([key, value]) => {
    if (!value) {
      throw new Error(`Missing required Monday.com configuration: ${key}`);
    }
  });
  return config;
});

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5173', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
}));
