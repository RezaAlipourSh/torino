import { NestFactory } from "@nestjs/core";
import { AppModule } from "./module/app/app.module";
import { config } from "dotenv";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const { PORT, DB_HOST } = process.env;
  await app.listen(PORT, () => {
    console.log(`http://${DB_HOST}:${PORT}`);
  });
}
bootstrap();
