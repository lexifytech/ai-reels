/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TtsService {
  constructor(private readonly httpService: HttpService) {}

  async generateSpeech(options: {
    input: string;
    voice?: string;
    response_format?: string;
    download_format?: string;
    stream?: boolean;
    speed?: number;
    return_download_link?: boolean;
    lang_code?: string;
  }): Promise<string> {
    const {
      input,
      voice = 'am_adam(0.1)',
      response_format = 'mp3',
      download_format = 'mp3',
      stream = true,
      speed = 1.3,
      return_download_link = true,
      lang_code = 'p',
    } = options;

    try {
      const response = await this.httpService
        .post(
          'http://0.0.0.0:8880/v1/audio/speech',
          {
            voice,
            download_format,
            stream,
            input,
            return_download_link,
            lang_code,
            response_format,
            speed,
          },
          {
            responseType: 'arraybuffer',
            headers: {
              'Content-Type': 'application/json',
              Authorization: process.env.KOKORO_API_KEY || '',
            },
          },
        )
        .toPromise();

      const bufferRes = Buffer.from(response?.data);
      const tempDir = path.join(process.cwd(), 'medias', 'downloaded_audios');
      await fs.promises.mkdir(tempDir, { recursive: true });
      const audioPath = path.join(tempDir, 'audio.mp3');
      fs.writeFileSync(audioPath, bufferRes);

      return audioPath;
    } catch (error) {
      throw new Error(`Erro ao gerar áudio: ${error.message}`);
    }
  }
}
