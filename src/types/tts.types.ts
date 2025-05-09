export interface TtsOptions {
  input: string;
  voice?: string;
  response_format?: string;
  download_format?: string;
  stream?: boolean;
  speed?: number;
  return_download_link?: boolean;
  lang_code?: string;
}

export interface TtsRequestPayload {
  voice: string;
  download_format: string;
  stream: boolean;
  input: string;
  return_download_link: boolean;
  lang_code: string;
  response_format: string;
  speed: number;
}

export interface TtsRequestConfig {
  responseType: 'arraybuffer';
  headers: {
    'Content-Type': string;
    Authorization: string;
  };
}