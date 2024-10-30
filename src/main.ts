import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NoVerifiedEmailGuard } from './authentication/guard/no-verified-email.guard';
import PrismaService from './common/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const swaggerConfig = new DocumentBuilder()
    .setTitle('SuaraNusa API Documentation')
    .setDescription('SuaraNusa API Documentation - Bangkit 2024 Batch II')
    .setVersion('1.0')
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, documentFactory);

  // Global Guards
  app.useGlobalGuards(
    new NoVerifiedEmailGuard(app.get(Reflector), app.get(PrismaService)),
  );

  BigInt.prototype['toJSON'] = function () {
    const bigInt = Number.parseInt(this.toString());
    return bigInt ?? this.toString();
  };
  await app.listen(3000);
}

bootstrap();
