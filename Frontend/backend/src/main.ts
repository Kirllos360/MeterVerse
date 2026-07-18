import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Bootstrap");

  app.setGlobalPrefix("api/v1");
  app.enableCors({ origin: process.env.FRONTEND_URL || "http://localhost:3030", credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`MeterVerse API running on port ${port}`);
}
bootstrap();
