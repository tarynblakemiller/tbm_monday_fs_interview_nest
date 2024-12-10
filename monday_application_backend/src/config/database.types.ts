export interface DatabaseConfig {
  dialect: 'postgres';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  autoLoadModels: boolean;
  define: {
    underscored: boolean;
    timestamps: boolean;
  };
  migrationStorage: string;
  migrationStorageTableName: string;
}
