/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import { SchemaType } from '@google/generative-ai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import {
  VideoFrame,
  GenerateContentResponse,
  GenerateImageOptions,
} from '../types/gemini.types';

@Injectable()
export class GeminiService {
  private readonly genAI: GoogleGenerativeAI;
  private readonly imageDir: string;

  constructor(private readonly configService: ConfigService) {
    this.genAI = new GoogleGenerativeAI(
      this.configService.get<string>('GEMINI_KEY') || '',
    );
    this.imageDir = path.join(process.cwd(), 'medias', 'images');
  }

  async generateContent(theme: string): Promise<VideoFrame[]> {
    try {
      const schema = {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            frameDuration: { type: SchemaType.INTEGER },
            frameText: { type: SchemaType.STRING },
            frameImagePrompt: { type: SchemaType.STRING },
          },
          required: ['frameDuration', 'frameText', 'frameImagePrompt'],
        },
      };

      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: schema as any,
        },
      });

      const prompt = `Crie uma poesia (apenas o texto para uma api de tts) com rima com teor mal humorado, irônico, engraçado, e ácido para redes sociais (reels) em pt-BR separado em quadros (frames) para o tema '${theme}'. O vídeo deve ter apenas 5 frames e com duração média de 40 segundos.`;
      const iaOptions = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      };

      const result = await model.generateContent(iaOptions);
      const data = result.response.text();
      return JSON.parse(data) as VideoFrame[];
    } catch (error: any) {
      throw new Error(`Erro na geração de conteúdo: ${error.message}`);
    }
  }

  async generateImage(prompts: string[]): Promise<string[]> {
    try {
      if (prompts.length > 10) {
        throw new Error('O número máximo de prompts permitido é 10');
      }
  
      // Import sharp as a CommonJS module
      const sharp = require('sharp');
      
      const apiKey = this.configService.get<string>('GEMINI_KEY');
      const imagePaths: string[] = [];
      await fs.promises.mkdir(this.imageDir, { recursive: true });
  
      // Adiciona especificações de tamanho aos prompts
      const formattedPrompts = prompts.map(prompt => 
        `${prompt}. A imagem deve ter proporção 9:16 (vertical), otimizada para Reels do Instagram e TikTok.`
      );
  
      // Dimensões padrão para Reels (1080x1920)
      const targetWidth = 1080;
      const targetHeight = 1920;
  
      // Processa cada prompt individualmente
      for (const prompt of formattedPrompts) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`;
        
        const payload = {
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            responseModalities: ["IMAGE", "TEXT"]
          }
        };
  
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
  
        if (!res.ok) {
          throw new Error(
            `Falha na geração da imagem: ${res.status} ${res.statusText}`
          );
        }
  
        const json = await res.json();
        const parts = json.candidates?.[0]?.content?.parts;
        const imagePart = parts?.find((p: { inlineData?: { data: string } }): boolean => Boolean(p.inlineData));
  
        if (!imagePart?.inlineData) {
          throw new Error('Nenhum dado de imagem retornado pela API do Gemini');
        }
  
        // Gerar nome de arquivo único
        const fileName = `image_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
        const imagePath = path.join(this.imageDir, fileName);
  
        // Converter base64 para buffer
        const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64');
        
        // Processar e redimensionar a imagem com Sharp - CORRIGIDO
        await sharp(imageBuffer)
          .resize({
            width: targetWidth,
            height: targetHeight,
            fit: 'cover',
            position: 'center'
          })
          .toFormat('png')
          .toFile(imagePath);
        
        imagePaths.push(imagePath);
      }
  
      return imagePaths;
    } catch (error) {
      throw new Error(`Erro na geração das imagens: ${(error as Error).message}`);
    }
  }
}
