import { openai, getModelForMessage } from '@/lib/openai';
import { getVectorStoreId, getCourseVectorStoreId } from '@/lib/vector-store';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message, responseId, files } = await req.json();

    if (!message) {
      return new Response('Message is required', { status: 400 });
    }

    // Use smart model selection - O3 for complex queries, GPT-4o for simple ones with tools
    const model = getModelForMessage(message);

    console.log(`Using model: ${model} for message: "${message.substring(0, 100)}..."`);

    // Use OpenAI Responses API instead of Chat Completions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const responseParams: any = {
      model,
      input: message,
      stream: true,
      temperature: 0.7,
      instructions: `You are a Financial Co-Pilot AI assistant for Legacy Wealth Blueprint students. 

Your role is to:
1. Act as a proactive financial strategist and thought partner
2. Analyze financial data, documents, and scenarios
3. Provide step-by-step reasoning and show your calculations
4. Cite sources when referencing uploaded materials or web sources
5. Give actionable, specific advice rather than generic responses
6. Use web search for current market data, interest rates, economic news, and financial trends
7. Search course materials for educational content and principles
8. Combine current market information with course teachings for comprehensive advice

IMPORTANT FORMATTING RULES:
- Use **bold** for headings and important terms
- Use *italics* for emphasis
- For mathematical formulas, ALWAYS wrap them in dollar signs:
  - Inline math: $formula$ (e.g., $A = P(1 + r)^t$)
  - Display math: $$formula$$ (e.g., $$A = P \\left(1 + \\frac{r}{n}\\right)^{nt}$$)
- Use \\ for backslashes in LaTeX (e.g., \\frac{}{}, \\left(), \\right())
- Use proper LaTeX syntax for fractions: \\frac{numerator}{denominator}

When you perform calculations, show your work clearly with proper mathematical notation. When you reference information from uploaded files, cite the specific source. Always aim to provide practical, implementable financial advice.`
    };

    // Add file search tool - always include course content + any user files
    const userVectorStoreId = getVectorStoreId();
    const courseVectorStoreId = getCourseVectorStoreId();
    const tools = [];
    
    // Collect all vector store IDs
    const vectorStoreIds = [];
    if (courseVectorStoreId) {
      vectorStoreIds.push(courseVectorStoreId);
    }
    if (files && files.length > 0 && userVectorStoreId) {
      vectorStoreIds.push(userVectorStoreId);
    }
    
    // Always add file search if we have course content or user files
    if (vectorStoreIds.length > 0) {
      tools.push({ 
        type: "file_search",
        vector_store_ids: vectorStoreIds
      });
    }
    
    // Add hosted tools only for compatible models (not O3)
    if (model !== 'o3-mini') {
      // Add web search for current financial information
      tools.push({
        type: "web_search_preview",
        search_context_size: "medium"
      });
      
      // Add code interpreter for calculations  
      tools.push({
        type: "code_interpreter",
        container: {
          type: "auto"
        }
      });
    }
    
    if (tools.length > 0) {
      responseParams.tools = tools;
    }

    // If continuing existing conversation, include previous_response_id
    if (responseId) {
      responseParams.previous_response_id = responseId;
    }

    const response = await openai.responses.create(responseParams);

    // Create a ReadableStream to handle streaming response
    const encoder = new TextEncoder();
    const assistantThinkingSteps: Array<{ tool: string; status: string; timestamp: number; query?: string }> = [];
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          for await (const chunk of response as any) {
            console.log('Chunk received:', JSON.stringify(chunk));
            
            // Handle different chunk types from Responses API
            if (chunk.type === 'response.output_text.delta') {
              if (chunk.delta) {
                controller.enqueue(encoder.encode(chunk.delta));
              }
            } else if (chunk.type === 'response.output_text.done') {
              // Content is complete
              console.log('Content complete');
            } 
            // Tool Events - updated for correct Responses API event types
            else if (chunk.type === 'response.output_item.added' && chunk.item?.type === 'web_search_call') {
              assistantThinkingSteps.push({ tool: 'web_search', status: 'active', timestamp: Date.now() });
              controller.enqueue(encoder.encode('\n\n__TOOL_START__:web_search\n\n'));
            } else if (chunk.type === 'response.output_item.done' && chunk.item?.type === 'web_search_call') {
              const queries = chunk.item?.queries || [];
              const queryText = queries.length > 0 ? queries.join(', ') : 'current information';
              assistantThinkingSteps.push({ tool: 'web_search', status: 'completed', query: queryText, timestamp: Date.now() });
              controller.enqueue(encoder.encode(`__TOOL_COMPLETE__:web_search:${queryText}\n\n`));
            }
            // File Search Events  
            else if (chunk.type === 'response.output_item.added' && chunk.item?.type === 'file_search_call') {
              assistantThinkingSteps.push({ tool: 'file_search', status: 'active', timestamp: Date.now() });
              controller.enqueue(encoder.encode('\n\n__TOOL_START__:file_search\n\n'));
            } else if (chunk.type === 'response.output_item.done' && chunk.item?.type === 'file_search_call') {
              assistantThinkingSteps.push({ tool: 'file_search', status: 'completed', query: 'course materials', timestamp: Date.now() });
              controller.enqueue(encoder.encode('__TOOL_COMPLETE__:file_search:course materials\n\n'));
            }
            // Code Interpreter Events
            else if (chunk.type === 'response.output_item.added' && chunk.item?.type === 'code_interpreter_call') {
              assistantThinkingSteps.push({ tool: 'code_interpreter', status: 'active', timestamp: Date.now() });
              controller.enqueue(encoder.encode('\n\n__TOOL_START__:code_interpreter\n\n'));
            } else if (chunk.type === 'response.output_item.done' && chunk.item?.type === 'code_interpreter_call') {
              assistantThinkingSteps.push({ tool: 'code_interpreter', status: 'completed', query: 'calculations', timestamp: Date.now() });
              controller.enqueue(encoder.encode('__TOOL_COMPLETE__:code_interpreter:calculations\n\n'));
            }
            // Response Complete
            else if (chunk.type === 'response.completed') {
              // Send the response ID for conversation continuation
              controller.enqueue(encoder.encode(`\n\n__RESPONSE_ID__:${chunk.response.id}`));
            }
          }
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}