import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { CommonModule } from './common/common.module';
import { ConfigModule } from '@nestjs/config';
import { MailerService } from './common/mailer.service';

@Module({
  imports: [
    UserModule,
    AuthenticationModule,
    CommonModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
