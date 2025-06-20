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

// For the per-user file uploads - now properly managed per user
const userVectorStores = new Map<string, string>();

export async function getOrCreateVectorStore(): Promise<string> {
  throw new Error('getOrCreateVectorStore is deprecated. Use getUserVectorStoreId(userId) instead.');
}

// Get or create user-specific vector store
export async function getUserVectorStoreId(userId: string): Promise<string> {
  // Check if we already have a vector store for this user
  if (userVectorStores.has(userId)) {
    return userVectorStores.get(userId)!;
  }

  try {
    // Create a vector store for this specific user
    const vectorStore = await openai.vectorStores.create({
      name: `User Files - ${userId.substring(0, 8)}`
    });
    
    const vectorStoreId = vectorStore.id;
    userVectorStores.set(userId, vectorStoreId);
    console.log(`Created user vector store for ${userId}:`, vectorStoreId);
    return vectorStoreId;
  } catch (error) {
    console.error('Error creating user vector store:', error);
    throw error;
  }
}

export async function addFileToVectorStore(fileId: string): Promise<void> {
  throw new Error('addFileToVectorStore is deprecated. Use addFileToUserVectorStore(userId, fileId) instead.');
}

export async function addFileToUserVectorStore(userId: string, fileId: string): Promise<void> {
  const vectorStoreId = await getUserVectorStoreId(userId);
  
  try {
    await openai.vectorStores.files.create(vectorStoreId, {
      file_id: fileId,
    });
    
    console.log(`Added file ${fileId} to user vector store ${vectorStoreId} for user ${userId}`);
  } catch (error) {
    console.error('Error adding file to user vector store:', error);
    throw error;
  }
}

export function getVectorStoreId(): string | null {
  throw new Error('getVectorStoreId is deprecated. Use getUserVectorStoreId(userId) instead.');
}