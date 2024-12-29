import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function SwaggerConfig(app:INestApplication):void {
    const document = new DocumentBuilder()
    .setTitle("Torino")
    .setDescription("Torino backend")
    .setVersion("v0.0.1")
    .addBearerAuth({
        type: 'http',
        bearerFormat:"JWT",
        in:"header",
        scheme:"bearer"
    }, "Authorization")
    .build()

    const swaggerDocument = SwaggerModule.createDocument(app , document)
    SwaggerModule.setup("/swagger",app ,swaggerDocument)
}