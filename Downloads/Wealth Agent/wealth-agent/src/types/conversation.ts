export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  thinkingSteps?: ThinkingStep[];
}

export interface ThinkingStep {
  id: string;
  tool: 'web_search' | 'file_search' | 'code_interpreter';
  status: 'active' | 'completed';
  query?: string;
  startTime: number;
}

export interface UploadedFile {
  id: string;
  filename: string;
  size: number;
  type: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  responseId?: string;
  uploadedFiles?: UploadedFile[];
}

export interface ConversationState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;
}