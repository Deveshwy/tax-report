import { openai } from '@/lib/openai';
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

// Store vector store ID in a simple file (in production, use a database)
const VECTOR_STORE_FILE = path.join(process.cwd(), '.vector-store-id');

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate it's a PDF
    if (file.type !== 'application/pdf') {
      return Response.json({ 
        error: 'Only PDF files are supported for course content.' 
      }, { status: 400 });
    }

    console.log(`Uploading course PDF: ${file.name} (${file.size} bytes)`);

    // Convert File to the format OpenAI expects
    const fileBuffer = await file.arrayBuffer();
    
    // Create a proper File object for OpenAI
    const openaiFile = new File([fileBuffer], file.name, { type: file.type });

    // Upload to OpenAI Files API
    const uploadedFile = await openai.files.create({
      file: openaiFile,
      purpose: 'assistants',
    });

    console.log(`File uploaded to OpenAI: ${uploadedFile.id}`);

    // Create vector store for course content
    const vectorStore = await openai.vectorStores.create({
      name: "Legacy Wealth Blueprint Course Content",
      expires_after: {
        anchor: "last_active_at",
        days: 365 // Keep for 1 year
      }
    });

    console.log(`Vector store created: ${vectorStore.id}`);

    // Add file to vector store
    await openai.vectorStores.files.create(vectorStore.id, {
      file_id: uploadedFile.id,
    });

    console.log(`File added to vector store`);

    // Save vector store ID to file (in production, use database)
    fs.writeFileSync(VECTOR_STORE_FILE, vectorStore.id);

    // Wait for processing to complete
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max
    
    while (attempts < maxAttempts) {
      const files = await openai.vectorStores.files.list(vectorStore.id);
      const fileStatus = files.data.find(f => f.id === uploadedFile.id);
      
      if (fileStatus?.status === 'completed') {
        console.log('File processing completed');
        break;
      } else if (fileStatus?.status === 'failed') {
        throw new Error('File processing failed');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    return Response.json({
      success: true,
      message: 'Course PDF uploaded and ready for all users',
      file_id: uploadedFile.id,
      vector_store_id: vectorStore.id,
      filename: file.name,
      size: file.size
    });

  } catch (error) {
    console.error('Course upload error:', error);
    return Response.json({ 
      error: 'Course upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Check if course is already uploaded
    if (fs.existsSync(VECTOR_STORE_FILE)) {
      const vectorStoreId = fs.readFileSync(VECTOR_STORE_FILE, 'utf8');
      
      // Verify vector store still exists
      try {
        const vectorStore = await openai.vectorStores.retrieve(vectorStoreId);
        const files = await openai.vectorStores.files.list(vectorStoreId);
        
        return Response.json({
          uploaded: true,
          vector_store_id: vectorStoreId,
          vector_store_name: vectorStore.name,
          file_count: files.data.length,
          files: files.data.map(f => ({
            id: f.id,
            status: f.status,
            created_at: f.created_at
          }))
        });
      } catch {
        // Vector store doesn't exist anymore, remove the file
        fs.unlinkSync(VECTOR_STORE_FILE);
        return Response.json({ uploaded: false });
      }
    }
    
    return Response.json({ uploaded: false });
  } catch (error) {
    console.error('Error checking course status:', error);
    return Response.json({ error: 'Failed to check course status' }, { status: 500 });
  }
}