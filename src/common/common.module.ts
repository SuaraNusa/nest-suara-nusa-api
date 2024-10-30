import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import PrismaService from './prisma.service';
import ValidationService from './validation.service';
import { MailerService } from './mailer.service';

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
  ],
  providers: [PrismaService, ValidationService, MailerService],
  exports: [PrismaService, ValidationService, MailerService],
})
export class CommonModule {}
