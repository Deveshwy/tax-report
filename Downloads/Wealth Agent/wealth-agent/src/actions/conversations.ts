'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { conversations, messages, users } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Helper function to get or create user
async function getOrCreateUser() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Check if user exists
  const existingUser = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  
  if (existingUser.length > 0) {
    return existingUser[0];
  }

  // Create new user if doesn't exist
  // Note: In a real app, you'd get email from Clerk
  const newUser = await db.insert(users).values({
    clerkId: userId,
    email: 'user@example.com', // This should come from Clerk user data
    accessExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
  }).returning();

  return newUser[0];
}

// Get all conversations for current user
export async function getConversations() {
  try {
    const user = await getOrCreateUser();
    
    const userConversations = await db
      .select({
        id: conversations.id,
        title: conversations.title,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
        openaiResponseId: conversations.openaiResponseId,
      })
      .from(conversations)
      .where(eq(conversations.userId, user.id))
      .orderBy(desc(conversations.updatedAt));

    return userConversations;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw new Error('Failed to fetch conversations');
  }
}

// Create a new conversation
export async function createConversation(title?: string) {
  try {
    const user = await getOrCreateUser();
    
    const newConversation = await db.insert(conversations).values({
      userId: user.id,
      title: title || 'New Conversation',
    }).returning();

    revalidatePath('/');
    return newConversation[0];
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw new Error('Failed to create conversation');
  }
}

// Get messages for a specific conversation
export async function getConversationMessages(conversationId: string) {
  try {
    const user = await getOrCreateUser();
    
    // Verify user owns this conversation
    const conversation = await db
      .select()
      .from(conversations)
      .where(and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, user.id)
      ))
      .limit(1);

    if (conversation.length === 0) {
      throw new Error('Conversation not found or access denied');
    }

    const conversationMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    return conversationMessages.map(msg => ({
      ...msg,
      thinkingSteps: msg.thinkingSteps ? JSON.parse(msg.thinkingSteps) : [],
    }));
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    throw new Error('Failed to fetch conversation messages');
  }
}

// Add a message to a conversation
export async function addMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  options?: {
    filesAttached?: string[];
    modelUsed?: string;
    thinkingSteps?: any[];
  }
) {
  try {
    const user = await getOrCreateUser();
    
    // Verify user owns this conversation
    const conversation = await db
      .select()
      .from(conversations)
      .where(and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, user.id)
      ))
      .limit(1);

    if (conversation.length === 0) {
      throw new Error('Conversation not found or access denied');
    }

    const newMessage = await db.insert(messages).values({
      conversationId,
      role,
      content,
      filesAttached: options?.filesAttached || [],
      modelUsed: options?.modelUsed,
      thinkingSteps: options?.thinkingSteps ? JSON.stringify(options.thinkingSteps) : null,
    }).returning();

    // Update conversation's updatedAt timestamp
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, conversationId));

    revalidatePath('/');
    return newMessage[0];
  } catch (error) {
    console.error('Error adding message:', error);
    throw new Error('Failed to add message');
  }
}

// Update conversation title
export async function updateConversationTitle(conversationId: string, title: string) {
  try {
    const user = await getOrCreateUser();
    
    const updatedConversation = await db
      .update(conversations)
      .set({ 
        title,
        updatedAt: new Date()
      })
      .where(and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, user.id)
      ))
      .returning();

    if (updatedConversation.length === 0) {
      throw new Error('Conversation not found or access denied');
    }

    revalidatePath('/');
    return updatedConversation[0];
  } catch (error) {
    console.error('Error updating conversation title:', error);
    throw new Error('Failed to update conversation title');
  }
}

// Update conversation's OpenAI response ID
export async function updateConversationResponseId(conversationId: string, responseId: string) {
  try {
    const user = await getOrCreateUser();
    
    await db
      .update(conversations)
      .set({ 
        openaiResponseId: responseId,
        updatedAt: new Date()
      })
      .where(and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, user.id)
      ));

    return { success: true };
  } catch (error) {
    console.error('Error updating conversation response ID:', error);
    throw new Error('Failed to update conversation response ID');
  }
}

// Delete a conversation
export async function deleteConversation(conversationId: string) {
  try {
    const user = await getOrCreateUser();
    
    const deleted = await db
      .delete(conversations)
      .where(and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, user.id)
      ))
      .returning();

    if (deleted.length === 0) {
      throw new Error('Conversation not found or access denied');
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw new Error('Failed to delete conversation');
  }
}

// Generate a conversation title based on the first message
export async function generateConversationTitle(firstMessage: string): Promise<string> {
  // Simple title generation - you could use OpenAI for this
  const words = firstMessage.split(' ').slice(0, 6);
  let title = words.join(' ');
  
  if (title.length > 50) {
    title = title.substring(0, 47) + '...';
  }
  
  return title || 'New Conversation';
}