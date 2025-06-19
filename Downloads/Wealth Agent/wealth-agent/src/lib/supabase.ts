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