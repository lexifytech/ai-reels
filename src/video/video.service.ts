import { Injectable } from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';

@Injectable()
export class VideoService {
  create(createVideoDto: CreateVideoDto) {
    // Aqui você implementará a lógica de criação do vídeo
    console.log(createVideoDto);
    return 'Vídeo criado com sucesso!';
  }
}
