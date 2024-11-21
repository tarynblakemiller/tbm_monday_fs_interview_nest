// import { Sequelize } from 'sequelize-typescript';
// import { SEQUELIZE } from '../constants/sequelize.constant';
// // import { Fragrance } from '../fragrances/entities/fragrance.entity';
// import { ConfigService } from '@nestjs/config';

// export const databaseProviders = [
//   {
//     provide: SEQUELIZE,
//     inject: [ConfigService],
//     useFactory: async () => {
//       const sequelize = new Sequelize({
//         dialect: 'postgres',
//         host: process.env.DB_HOST || 'localhost',
//         port: Number(process.env.DB_PORT) || 5432,
//         username: process.env.DB_USER || 'tarynblakemiller',
//         password: process.env.DB_PASSWORD,
//         database: 'fragrance_db',
//       });
//       return sequelize;
//     },
//   },
// ];
