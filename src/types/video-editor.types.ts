export interface VideoOptions {
  fps: number;
  loop: number;
  transition: boolean;
  transitionDuration: number;
  videoBitrate: number;
  videoCodec: string;
  size: string;
  audioBitrate: string;
  audioChannels: number;
  format: string;
  pixelFormat: string;
}

export interface VideoShowInstance {
  audio: (path: string) => VideoShowInstance;
  save: (output: string) => VideoShowInstance;
  on: (
    event: 'start' | 'error' | 'end',
    callback: (data: unknown) => void,
  ) => VideoShowInstance;
}