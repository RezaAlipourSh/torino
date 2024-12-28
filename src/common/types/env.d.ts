namespace NodeJS {
  interface ProcessEnv {
    //app
    PORT: number;
    //db
    DB_PORT: number;
    DB_NAME: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_HOST: string;
  }
}
