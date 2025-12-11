import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SignatureModule } from './signature/signature.module';

@Module({
  imports: [SignatureModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
