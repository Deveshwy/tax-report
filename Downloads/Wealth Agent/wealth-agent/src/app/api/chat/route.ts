import { openai } from '@/lib/openai';
import { getVectorStoreId, getCourseVectorStoreId, getUserVectorStoreId } from '@/lib/vector-store';
import { 
  createUser, 
  getUser, 
  createConversation, 
  saveMessage, 
  updateConversationResponseId,
  generateConversationTitle
} from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

// Handle O3 model streaming (Chat Completions API)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleO3Streaming(response: any, conversationId: string, userId: string) {
  const encoder = new TextEncoder();
  let assistantContent = ''; // Accumulate the assistant's response
  
  const stream = new ReadableStream({
    async start(controller) {
      let streamClosed = false;
      
      const safeEnqueue = (data: Uint8Array) => {
        if (!streamClosed) {
          try {
            controller.enqueue(data);
          } catch (error) {
            console.error('Controller enqueue error:', error);
            streamClosed = true;
          }
        }
      };

      const safeClose = () => {
        if (!streamClosed) {
          try {
            controller.close();
            streamClosed = true;
          } catch (error) {
            console.error('Controller close error:', error);
          }
        }
      };

      const safeError = (error: unknown) => {
        if (!streamClosed) {
          try {
            controller.error(error);
            streamClosed = true;
          } catch (controllerError) {
            console.error('Controller error method failed:', controllerError);
          }
        }
      };

      try {
        console.log('Starting O3 streaming...');
        for await (const chunk of response) {
          if (streamClosed) break;
          
          console.log('O3 chunk:', JSON.stringify(chunk, null, 2));
          
          // Handle different chunk structures for O3
          const content = chunk.choices?.[0]?.delta?.content || '';
          if (content) {
            console.log('Streaming content chunk:', JSON.stringify(content));
            assistantContent += content; // Accumulate content for database save
            // O3 now provides proper markdown formatting with developer message
            safeEnqueue(encoder.encode(content));
          }
          
          // Check if stream is done
          const finishReason = chunk.choices?.[0]?.finish_reason;
          if (finishReason) {
            console.log('O3 stream finished with reason:', finishReason);
            break;
          }
        }
        console.log('O3 streaming completed successfully');
      } catch (error) {
        console.error('O3 streaming error:', error);
        // Send error message to client instead of just erroring
        safeEnqueue(encoder.encode('\n\nSorry, I encountered an error while processing your request. Please try again.'));
        safeError(error);
      } finally {
        // Save the assistant message to database if we have content
        if (assistantContent.trim()) {
          try {
            await saveMessage(conversationId, 'assistant', assistantContent, userId);
            console.log('Assistant message saved to database');
          } catch (error) {
            console.error('Error saving assistant message:', error);
          }
        }
        safeClose();
      }
    },
    cancel() {
      console.log('O3 stream cancelled by client');
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate the user
    const { userId } = await auth();
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { message, responseId, files, useThinkingMode, conversationId } = await req.json();

    if (!message) {
      return new Response('Message is required', { status: 400 });
    }

    // Ensure user exists in database
    try {
      await getUser(userId);
    } catch (error) {
      // User doesn't exist, create them with a default access expiration
      const accessExpiresAt = new Date();
      accessExpiresAt.setFullYear(accessExpiresAt.getFullYear() + 1); // 1 year access
      
      await createUser(userId, 'user@example.com', accessExpiresAt);
    }

    // Handle conversation management
    let currentConversationId = conversationId;
    
    // If no conversation ID provided, create a new conversation
    if (!currentConversationId) {
      const title = generateConversationTitle(message);
      const conversation = await createConversation(userId, title);
      currentConversationId = conversation.id;
    }

    // Save the user message to the database
    await saveMessage(currentConversationId, 'user', message, userId, files);

    // Use manual model selection - O3 for thinking mode, GPT-4.1 for fast mode
    const model = useThinkingMode ? 'o3' : 'gpt-4.1';
    const isO3Model = model.includes('o3');

    console.log(`Using model: ${model} (${useThinkingMode ? 'Thinking Mode' : 'Fast Mode'}) for message: "${message.substring(0, 100)}..."`);

    // O3 models use Chat Completions API, others use Responses API
    if (isO3Model) {
      console.log('Using O3 model - Chat Completions API');
      
      try {
        // O3 parameters with developer message to enable formatting
        const chatParams = {
          model: 'o3' as const,
          messages: [
            {
              role: 'developer' as const,
              content: 'formatting re-enabled'
            },
            {
              role: 'system' as const,
              content: `You are a Financial Co-Pilot AI assistant for Legacy Wealth Blueprint students. 

Your role is to:
1. Act as a proactive financial strategist and thought partner
2. Analyze financial data, documents, and scenarios
3. Provide step-by-step reasoning and show your calculations
4. Give actionable, specific advice rather than generic responses
5. Use proper Markdown formatting including headings, bullet points, tables, and code blocks
6. Format financial data in clear, readable tables when appropriate

IMPORTANT FORMATTING RULES:
- Use **bold** for headings and important terms
- Use proper markdown headers (# ## ###)
- Use bullet points and numbered lists for clear organization
- Use tables for comparing financial options
- Use math formatting for calculations: $formula$

When you perform calculations, show your work clearly with proper mathematical notation. Always aim to provide practical, implementable financial advice with excellent formatting.`
            },
            {
              role: 'user' as const,
              content: message
            }
          ],
          stream: true as const,
          max_completion_tokens: 2000,
          // O3 model only supports default temperature of 1
          // temperature: 1.0, // This is the default, so we can omit it
        };

        console.log('Creating O3 chat completion...');
        const response = await openai.chat.completions.create(chatParams);
        console.log('O3 response object created');
        
        return await handleO3Streaming(response, currentConversationId, userId);
      } catch (error) {
        console.error('O3 API Error:', error);
        return new Response(JSON.stringify({ 
          error: 'O3 model error', 
          details: error instanceof Error ? error.message : 'Unknown error' 
        }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Use OpenAI Responses API for non-O3 models
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

    // Add file search tool - always include course content + user-specific files
    const userVectorStoreId = await getUserVectorStoreId(userId);
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
    if (model !== 'o3') {
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
    let assistantContent = ''; // Accumulate the assistant's response
    let responseId = '';
    
    const stream = new ReadableStream({
      async start(controller) {
        let streamClosed = false;
        
        const safeEnqueue = (data: Uint8Array) => {
          if (!streamClosed) {
            try {
              controller.enqueue(data);
            } catch (error) {
              console.error('Controller enqueue error:', error);
              streamClosed = true;
            }
          }
        };

        const safeClose = () => {
          if (!streamClosed) {
            try {
              controller.close();
              streamClosed = true;
            } catch (error) {
              console.error('Controller close error:', error);
            }
          }
        };

        const safeError = (error: unknown) => {
          if (!streamClosed) {
            try {
              controller.error(error);
              streamClosed = true;
            } catch (controllerError) {
              console.error('Controller error method failed:', controllerError);
            }
          }
        };

        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          for await (const chunk of response as any) {
            if (streamClosed) break;
            
            console.log('Chunk received:', JSON.stringify(chunk));
            
            // Handle different chunk types from Responses API
            if (chunk.type === 'response.output_text.delta') {
              if (chunk.delta) {
                safeEnqueue(encoder.encode(chunk.delta));
              }
            } else if (chunk.type === 'response.output_text.done') {
              // Content is complete
              console.log('Content complete');
            } 
            // Tool Events - updated for correct Responses API event types
            else if (chunk.type === 'response.output_item.added' && chunk.item?.type === 'web_search_call') {
              assistantThinkingSteps.push({ tool: 'web_search', status: 'active', timestamp: Date.now() });
              safeEnqueue(encoder.encode('\n\n__TOOL_START__:web_search\n\n'));
            } else if (chunk.type === 'response.output_item.done' && chunk.item?.type === 'web_search_call') {
              const queries = chunk.item?.queries || [];
              const queryText = queries.length > 0 ? queries.join(', ') : 'current information';
              assistantThinkingSteps.push({ tool: 'web_search', status: 'completed', query: queryText, timestamp: Date.now() });
              safeEnqueue(encoder.encode(`__TOOL_COMPLETE__:web_search:${queryText}\n\n`));
            }
            // File Search Events  
            else if (chunk.type === 'response.output_item.added' && chunk.item?.type === 'file_search_call') {
              assistantThinkingSteps.push({ tool: 'file_search', status: 'active', timestamp: Date.now() });
              safeEnqueue(encoder.encode('\n\n__TOOL_START__:file_search\n\n'));
            } else if (chunk.type === 'response.output_item.done' && chunk.item?.type === 'file_search_call') {
              assistantThinkingSteps.push({ tool: 'file_search', status: 'completed', query: 'course materials', timestamp: Date.now() });
              safeEnqueue(encoder.encode('__TOOL_COMPLETE__:file_search:course materials\n\n'));
            }
            // Code Interpreter Events
            else if (chunk.type === 'response.output_item.added' && chunk.item?.type === 'code_interpreter_call') {
              assistantThinkingSteps.push({ tool: 'code_interpreter', status: 'active', timestamp: Date.now() });
              safeEnqueue(encoder.encode('\n\n__TOOL_START__:code_interpreter\n\n'));
            } else if (chunk.type === 'response.output_item.done' && chunk.item?.type === 'code_interpreter_call') {
              assistantThinkingSteps.push({ tool: 'code_interpreter', status: 'completed', query: 'calculations', timestamp: Date.now() });
              safeEnqueue(encoder.encode('__TOOL_COMPLETE__:code_interpreter:calculations\n\n'));
            }
            // Response Complete
            else if (chunk.type === 'response.completed') {
              // Send the response ID for conversation continuation
              safeEnqueue(encoder.encode(`\n\n__RESPONSE_ID__:${chunk.response.id}`));
            }
          }
        } catch (error) {
          console.error('Streaming error:', error);
          safeError(error);
        } finally {
          safeClose();
        }
      },
      cancel() {
        console.log('Stream cancelled by client');
      }
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