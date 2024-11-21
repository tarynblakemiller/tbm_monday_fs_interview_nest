import { registerAs } from '@nestjs/config';

const config = {
  development: {
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
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
  test: {},
  production: {},
} as const;

export default config;

export const databaseConfig = registerAs('database', () => {
  const env = process.env.NODE_ENV || 'development';
  return config[env as keyof typeof config];
});

export const mondayConfig = registerAs('monday', () => ({
  apiUrl: process.env.MONDAY_API_URL,
  apiToken: process.env.MONDAY_API_TOKEN,
  boardId: process.env.MONDAY_BOARD_ID,
}));

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5173', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
}));
