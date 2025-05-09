export interface VideoFrame {
  frameDuration: number;
  frameText: string;
  frameImagePrompt: string;
}

export interface GeminiContentPart {
  inlineData?: {
    data: string;
  };
}

export interface GeminiContent {
  parts: GeminiContentPart[];
}

export interface GeminiCandidate {
  content: GeminiContent;
}

export interface GenerateContentResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        inlineData?: {
          data: string;
        };
      }>;
    };
  }>;
}

export interface GenerateImagePart {
  text: string;
}

export interface GenerateImageContent {
  parts: GenerateImagePart[];
}

export interface GenerateImageOptions {
  contents: GenerateImageContent[];
  generationConfig: {
    responseModalities: string[];
  };
}