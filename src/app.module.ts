import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { CommonModule } from './common/common.module';
import { ConfigModule } from '@nestjs/config';
import { PredictModule } from './predict/predict.module';
import { QuestionModule } from './question/question.module';
import { InstrumentModule } from './instrument/instrument.module';

@Module({
  imports: [
    UserModule,
    AuthenticationModule,
    CommonModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PredictModule,
    QuestionModule,
    InstrumentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
