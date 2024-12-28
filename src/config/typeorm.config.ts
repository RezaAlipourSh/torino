import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export function TypeOrmConfig(): TypeOrmModuleOptions {
  const { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USERNAME } = process.env;
  return {
    type: "postgres",
    database: DB_NAME,
    port: +DB_PORT,
    password: DB_PASSWORD,
    username: DB_USERNAME,
    host: DB_HOST,
    autoLoadEntities: false,
    synchronize: true,
    entities: [
      "dist/**/**/**/*.entity{.js,.ts}",
      "dist/**/**/*.entity{.js,.ts}",
    ],
  };
}
