import { Conversation, Message } from '@/types/conversation';

const CONVERSATIONS_STORAGE_KEY = 'wealth-agent-conversations';
const ACTIVE_CONVERSATION_KEY = 'wealth-agent-active-conversation';

export function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateConversationTitle(firstMessage: string): string {
  // Take first 50 characters of the first message, clean it up
  const cleaned = firstMessage.replace(/\n/g, ' ').trim();
  if (cleaned.length <= 50) return cleaned;
  
  // Find the last space before character 50 to avoid cutting words
  const truncated = cleaned.substring(0, 47);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 20 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}

export function createNewConversation(firstMessage?: string): Conversation {
  const now = new Date();
  const conversation: Conversation = {
    id: generateConversationId(),
    title: firstMessage ? generateConversationTitle(firstMessage) : 'New Chat',
    messages: [],
    createdAt: now,
    updatedAt: now,
    uploadedFiles: []
  };
  
  return conversation;
}

export function saveConversations(conversations: Conversation[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    const serializable = conversations.map(conv => ({
      ...conv,
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
      messages: conv.messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      }))
    }));
    
    localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(serializable));
  } catch (error) {
    console.error('Failed to save conversations:', error);
  }
}

export function loadConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.map((conv: any) => ({
      ...conv,
      createdAt: new Date(conv.createdAt),
      updatedAt: new Date(conv.updatedAt),
      messages: conv.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    }));
  } catch (error) {
    console.error('Failed to load conversations:', error);
    return [];
  }
}

export function saveActiveConversationId(conversationId: string | null): void {
  if (typeof window === 'undefined') return;
  
  if (conversationId) {
    localStorage.setItem(ACTIVE_CONVERSATION_KEY, conversationId);
  } else {
    localStorage.removeItem(ACTIVE_CONVERSATION_KEY);
  }
}

export function loadActiveConversationId(): string | null {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem(ACTIVE_CONVERSATION_KEY);
}

export function updateConversationTitle(conversations: Conversation[], conversationId: string, newTitle: string): Conversation[] {
  return conversations.map(conv => 
    conv.id === conversationId 
      ? { ...conv, title: newTitle, updatedAt: new Date() }
      : conv
  );
}

export function deleteConversation(conversations: Conversation[], conversationId: string): Conversation[] {
  return conversations.filter(conv => conv.id !== conversationId);
}

export function addMessageToConversation(
  conversations: Conversation[], 
  conversationId: string, 
  message: Message
): Conversation[] {
  return conversations.map(conv => 
    conv.id === conversationId 
      ? { 
          ...conv, 
          messages: [...conv.messages, message],
          updatedAt: new Date()
        }
      : conv
  );
}

export function updateMessageInConversation(
  conversations: Conversation[], 
  conversationId: string, 
  messageId: string, 
  updates: Partial<Message>
): Conversation[] {
  return conversations.map(conv => 
    conv.id === conversationId 
      ? {
          ...conv,
          messages: conv.messages.map(msg => 
            msg.id === messageId ? { ...msg, ...updates } : msg
          ),
          updatedAt: new Date()
        }
      : conv
  );
}