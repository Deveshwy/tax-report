import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { 
  createConversation, 
  getUserConversations,
  generateConversationTitle
} from '@/lib/supabase';

// GET /api/conversations - Get all conversations for the current user
export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await getUserConversations(user.id);
    
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' }, 
      { status: 500 }
    );
  }
}

// POST /api/conversations - Create a new conversation
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, firstMessage } = await req.json();
    
    // Generate title from first message if not provided
    const conversationTitle = title || (firstMessage ? generateConversationTitle(firstMessage) : null);
    
    const conversation = await createConversation(user.id, conversationTitle);
    
    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' }, 
      { status: 500 }
    );
  }
}