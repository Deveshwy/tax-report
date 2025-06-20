import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getConversationMessages } from '@/lib/supabase';

// GET /api/conversations/[id]/messages - Get all messages for a conversation
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messages = await getConversationMessages(params.id, user.id);
    
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation messages' }, 
      { status: 500 }
    );
  }
}