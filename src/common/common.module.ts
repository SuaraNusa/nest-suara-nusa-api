import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import PrismaService from './prisma.service';
import ValidationService from './validation.service';
import { MailerCustomService } from './mailer.service';
import { ModelRegistryService } from './model-registry.service';
import { CloudStorageService } from './cloud-storage.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    WinstonModule.forRoot({
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
      ],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule
      inject: [ConfigService], // Inject ConfigService
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true, // use SSL
          service: configService.get<string>('EMAIL_HOST'),
          auth: {
            user: configService.get<string>('EMAIL_USERNAME'),
            pass: configService.get<string>('EMAIL_PASSWORD'),
          },
        },
      }),
    }),
  ],
  providers: [
    PrismaService,
    ValidationService,
    MailerCustomService,
    ModelRegistryService,
    CloudStorageService,
  ],
  exports: [
    PrismaService,
    ValidationService,
    MailerCustomService,
    ModelRegistryService,
    CloudStorageService,
  ],
})
export class CommonModule {}
