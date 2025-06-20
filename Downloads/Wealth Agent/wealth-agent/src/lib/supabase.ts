import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Database functions
export async function createUser(clerkId: string, email: string, accessExpiresAt: Date) {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      clerk_id: clerkId,
      email,
      access_expires_at: accessExpiresAt.toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'clerk_id'
    });

  if (error) {
    throw error;
  }

  return data;
}

export async function getUser(clerkId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateUserAccess(clerkId: string, accessExpiresAt: Date) {
  const { data, error } = await supabase
    .from('users')
    .update({
      access_expires_at: accessExpiresAt.toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('clerk_id', clerkId);

  if (error) {
    throw error;
  }

  return data;
}

// Conversation management functions
export async function createConversation(clerkId: string, title?: string, openaiResponseId?: string) {
  const user = await getUser(clerkId);
  
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: user.id,
      title,
      openai_response_id: openaiResponseId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getConversations(clerkId: string) {
  const user = await getUser(clerkId);
  
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function updateConversation(conversationId: string, updates: { title?: string; openai_response_id?: string }) {
  const { data, error } = await supabase
    .from('conversations')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', conversationId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function addMessage(conversationId: string, role: 'user' | 'assistant', content: string, filesAttached?: string[]) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
      files_attached: filesAttached || [],
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}