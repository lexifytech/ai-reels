/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import * as videoshow from 'videoshow';
import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fs from 'fs';
import { VideoOptions, VideoShowInstance } from '../types/video-editor.types';

@Injectable()
export class VideoEditorService {
  private readonly outputDir: string;

  constructor() {
    this.outputDir = path.join(process.cwd(), 'medias');
  }

  async createVideo(audioPath: string, imagesPath: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      // First, check if files exist
      if (!fs.existsSync(audioPath)) {
        reject(new Error(`Audio file not found: ${audioPath}`));
        return;
      }

      for (const imagePath of imagesPath) {
        if (!fs.existsSync(imagePath)) {
          reject(new Error(`Image file not found: ${imagePath}`));
          return;
        }
      }

      ffmpeg.ffprobe(audioPath, (err: any, metadata: any) => {
        if (err) {
          console.error('Error getting audio duration:', err);
          reject(err);
          return;
        }

        const audioDuration = metadata.format.duration;
        // Adiciona um pequeno buffer para garantir que o vídeo cubra todo o áudio
        const frameDuration = Math.ceil(audioDuration / imagesPath.length) + 0.0003;

        const videoOptions = {
          fps: 30,
          loop: frameDuration,
          transition: false,
          videoBitrate: '2000k',
          videoCodec: 'libx264',
          size: '1080x1920',
          audioBitrate: '128k',
          audioChannels: 2,
          format: 'mp4',
          pixelFormat: 'yuv420p',
          outputOptions: [
            '-preset', 'ultrafast',
            '-movflags', '+faststart',
            '-profile:v', 'baseline',
            '-pix_fmt', 'yuv420p',
            '-strict', 'experimental'
          ]
        };

        videoshow(imagesPath, videoOptions)
          .audio(audioPath)
          .save(path.join(this.outputDir, 'video.mp4'))
          .on('start', (command: any) => {
            console.log('FFmpeg process started:', command);
          })
          .on('error', (err: any) => {
            console.error('Error:', err);
            reject(err);
          })
          .on('end', (output: any) => {
            console.log('Video created at:', output);
            resolve(output);
          });
      });
    });
  }
}
