import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VideoModule } from './video/video.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // torna as variáveis de ambiente disponíveis globalmente
    }),
    VideoModule,
  ],
})
export class AppModule {}
