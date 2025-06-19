import { openai } from './openai';
import fs from 'fs';
import path from 'path';

const VECTOR_STORE_FILE = path.join(process.cwd(), '.vector-store-id');

// Get the persistent course vector store ID
export function getCourseVectorStoreId(): string | null {
  try {
    if (fs.existsSync(VECTOR_STORE_FILE)) {
      return fs.readFileSync(VECTOR_STORE_FILE, 'utf8').trim();
    }
  } catch (error) {
    console.error('Error reading vector store ID:', error);
  }
  return null;
}

// For the per-user file uploads (legacy function for chat uploads)
let userVectorStoreId: string | null = null;

export async function getOrCreateVectorStore(): Promise<string> {
  if (userVectorStoreId) {
    return userVectorStoreId;
  }

  try {
    // Create a vector store for user uploads
    const vectorStore = await openai.vectorStores.create({
      name: "User Uploaded Files"
    });
    
    userVectorStoreId = vectorStore.id;
    console.log('Created user vector store:', userVectorStoreId);
    return userVectorStoreId;
  } catch (error) {
    console.error('Error creating vector store:', error);
    throw error;
  }
}

export async function addFileToVectorStore(fileId: string): Promise<void> {
  const vectorStoreId = await getOrCreateVectorStore();
  
  try {
    await openai.vectorStores.files.create(vectorStoreId, {
      file_id: fileId,
    });
    
    console.log(`Added file ${fileId} to vector store ${vectorStoreId}`);
  } catch (error) {
    console.error('Error adding file to vector store:', error);
    throw error;
  }
}

export function getVectorStoreId(): string | null {
  return userVectorStoreId;
}