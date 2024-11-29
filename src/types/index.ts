export interface ChatMessage {
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

export interface FileUploadResponse {
  success: boolean;
  text?: string;
  error?: string;
}