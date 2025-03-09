namespace NodeJS {
  interface ProcessEnv {
    //app
    PORT: number;
    HOST: string;
    //db
    DB_PORT: number;
    DB_NAME: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_HOST: string;
    //token
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    // S3
    S3_ACCESS_KEY: string;
    S3_SECRET_KEY: string;
    S3_BUCKET_NAME: string;
    S3_ENDPOINT: string;

    //ZarinPal
    ZARINPAL_VERIFY_URL: string;
    ZARINPAL_REQUEST_URL: string;
    ZARINPAL_MERCHANT_ID: string;
    ZARINPAL_GATEWAY_URL: string;
  }
}
