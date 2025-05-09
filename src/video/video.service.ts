/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { TtsService } from '../services/tts.service';
import { GeminiService } from 'src/services/gemini.service';
import { VideoEditorService } from 'src/services/video-editor.service';

@Injectable()
export class VideoService {
  constructor(
    private readonly ttsService: TtsService,
    private readonly geminiService: GeminiService,
    private readonly videoEditorService: VideoEditorService,
  ) {}
  async create(createVideoDto: CreateVideoDto) {
    const theme = createVideoDto.theme;
    const content = await this.geminiService.generateContent(theme);

    console.log(content)
    
    // Improve text concatenation with proper spacing and punctuation
    const audioText = content
      .map((item) => item.frameText.trim())
      .join('. ');
    
    const audioPath = await this.ttsService.textToSpeech({
      input: audioText,
    });

    const imagesPath = await this.geminiService.generateImage(
      content.map((c) => c.frameImagePrompt),
    );

    const video = await this.videoEditorService.createVideo(
      audioPath,
      imagesPath,
    );

    console.log(video);
    return 'Vídeo criado com sucesso!';
  }
}
