import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [UserModule, AuthenticationModule, CommonModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
