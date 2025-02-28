import { NestFactory } from "@nestjs/core";
import { AppModule } from "./module/app/app.module";
import { SwaggerConfig } from "./config/swagger.config";
import { BadRequestException, ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory(errors) {
        return new BadRequestException(errors);
      },
      transform: true,
    })
  );
  SwaggerConfig(app);
  const { PORT, DB_HOST } = process.env;
  await app.listen(PORT, () => {
    console.log(`http://${DB_HOST}:${PORT}`);
    console.log(`http://${DB_HOST}:${PORT}/swagger`);
  });
}
bootstrap();
