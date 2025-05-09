import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { TtsService } from 'src/services/tts.service';
import { HttpModule } from '@nestjs/axios';
import { GeminiService } from 'src/services/gemini.service';
import { VideoEditorService } from 'src/services/video-editor.service';

@Module({
  controllers: [VideoController],
  providers: [VideoService, TtsService, GeminiService, VideoEditorService],
  imports: [HttpModule],
})
export class VideoModule {}
