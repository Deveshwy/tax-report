import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { createUser } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, accessMonths = 12 } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Create invitation in Clerk
    const clerk = await clerkClient();
    const invitation = await clerk.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
      publicMetadata: {
        accessMonths,
        invitedAt: new Date().toISOString()
      }
    });

    // Calculate access expiration
    const accessExpiresAt = new Date();
    accessExpiresAt.setMonth(accessExpiresAt.getMonth() + accessMonths);

    // Pre-create user record in our database (will be linked when they accept invite)
    try {
      await createUser(invitation.id, email, accessExpiresAt);
    } catch (error) {
      console.log('User might already exist in database:', error);
    }

    return NextResponse.json({ 
      success: true, 
      invitationId: invitation.id,
      email,
      accessExpiresAt: accessExpiresAt.toISOString()
    });
    
  } catch (error) {
    console.error('Zapier invite error:', error);
    return NextResponse.json({ 
      error: 'Failed to create invitation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}