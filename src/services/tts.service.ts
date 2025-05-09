/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';
import * as path from 'path';
import {
  TtsOptions,
  TtsRequestPayload,
  TtsRequestConfig,
} from '../types/tts.types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TtsService {
  private readonly audioDir: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.audioDir = path.join(process.cwd(), 'medias', 'audios');
  }

  async textToSpeech(options: TtsOptions): Promise<string> {
    const {
      input,
      voice = 'am_adam(0.1)',
      response_format = 'mp3',
      download_format = 'mp3',
      stream = true,
      speed = 1,
      return_download_link = true,
      lang_code = 'p',
    } = options;

    try {
      const payload: TtsRequestPayload = {
        voice,
        download_format,
        stream,
        input,
        return_download_link,
        lang_code,
        response_format,
        speed,
      };

      const config: TtsRequestConfig = {
        responseType: 'arraybuffer',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.configService.get('KOKORO_API_KEY') || '',
        },
      };

      const response = await this.httpService
        .post('http://0.0.0.0:8880/v1/audio/speech', payload, config)
        .toPromise();

      const bufferRes = Buffer.from(response?.data);
      await fs.promises.mkdir(this.audioDir, { recursive: true });
      const audioPath = path.join(this.audioDir, 'audio.mp3');
      await fs.promises.writeFile(audioPath, bufferRes);

      return audioPath;
    } catch (error) {
      throw new Error(`Erro ao gerar áudio: ${(error as Error).message}`);
    }
  }
}
