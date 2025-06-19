import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export function shouldUseO3(message: string): boolean {
  const complexityTriggers = [
    'analyze', 'calculate', 'breakdown', 'explain step by step',
    'research', 'compare', 'evaluate', 'plan', 'strategy'
  ];
  
  const hasComplexTrigger = complexityTriggers.some(trigger => 
    message.toLowerCase().includes(trigger)
  );
  
  return hasComplexTrigger || message.length > 600;
}

export function getModelForMessage(message: string): string {
  return shouldUseO3(message) ? 'o3' : 'gpt-4.1';
}