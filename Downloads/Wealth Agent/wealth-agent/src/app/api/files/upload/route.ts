import { openai } from '@/lib/openai';
import { addFileToUserVectorStore } from '@/lib/vector-store';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Authenticate the user
    const { userId } = await auth();
    
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'text/csv',
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
    ];

    if (!allowedTypes.includes(file.type)) {
      return Response.json({ 
        error: 'Invalid file type. Only PDF, DOCX, CSV, and Excel files are supported.' 
      }, { status: 400 });
    }

    // Convert File to the format OpenAI expects
    const fileBuffer = await file.arrayBuffer();
    const fileBlob = new Blob([fileBuffer], { type: file.type });

    // Upload to OpenAI
    const uploadedFile = await openai.files.create({
      file: fileBlob as File, // Cast to File type for OpenAI
      purpose: 'assistants',
    });

    // Add file to user-specific vector store for file search
    await addFileToUserVectorStore(userId, uploadedFile.id);

    return Response.json({
      id: uploadedFile.id,
      filename: file.name,
      size: file.size,
      type: file.type,
      status: 'uploaded'
    });

  } catch (error) {
    console.error('File upload error:', error);
    return Response.json({ error: 'File upload failed' }, { status: 500 });
  }
}