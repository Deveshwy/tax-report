'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, Paperclip, Sparkles, Brain, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MarkdownRenderer } from './markdown-renderer';
import { ThinkingProcess, parseThinkingEvents } from './thinking-process';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  thinkingSteps?: ThinkingStep[];
}

interface ThinkingStep {
  id: string;
  tool: 'web_search' | 'file_search' | 'code_interpreter';
  status: 'active' | 'completed';
  query?: string;
  startTime: number;
}

interface UploadedFile {
  id: string;
  filename: string;
  size: number;
  type: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [currentThinkingSteps, setCurrentThinkingSteps] = useState<ThinkingStep[]>([]);
  const [useThinkingMode, setUseThinkingMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  const clearChat = () => {
    setMessages([]);
    setUploadedFiles([]);
    setResponseId(null);
    setCurrentThinkingSteps([]);
    if (isClient) {
      localStorage.removeItem('wealth-agent-messages');
      localStorage.removeItem('wealth-agent-response-id');
      // Keep thinking mode preference when clearing chat
      // localStorage.removeItem('wealth-agent-thinking-mode');
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isLoading) {
      // During streaming, scroll less frequently to avoid overflow
      const timeoutId = setTimeout(scrollToBottom, 200);
      return () => clearTimeout(timeoutId);
    } else {
      // Only scroll immediately when not loading
      scrollToBottom();
    }
  }, [messages, isLoading]);

  // Save to localStorage (client-side only)
  useEffect(() => {
    if (isClient && messages.length > 0) {
      localStorage.setItem('wealth-agent-messages', JSON.stringify(messages));
    }
  }, [messages, isClient]);

  useEffect(() => {
    if (isClient && responseId) {
      localStorage.setItem('wealth-agent-response-id', responseId);
    }
  }, [responseId, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('wealth-agent-thinking-mode', JSON.stringify(useThinkingMode));
    }
  }, [useThinkingMode, isClient]);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    if (isClient) {
      const saved = localStorage.getItem('wealth-agent-messages');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setMessages(parsed.map((m: Message & { timestamp: string }) => ({ ...m, timestamp: new Date(m.timestamp) })));
        } catch (error) {
          console.error('Failed to load messages from localStorage:', error);
        }
      }

      const savedResponseId = localStorage.getItem('wealth-agent-response-id');
      if (savedResponseId) {
        setResponseId(savedResponseId);
      }

      const savedThinkingMode = localStorage.getItem('wealth-agent-thinking-mode');
      if (savedThinkingMode) {
        try {
          setUseThinkingMode(JSON.parse(savedThinkingMode));
        } catch (error) {
          console.error('Failed to load thinking mode from localStorage:', error);
        }
      }
    }
  }, [isClient]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const uploadedFile = await response.json();
      setUploadedFiles(prev => [...prev, uploadedFile]);
    } catch (error) {
      console.error('File upload error:', error);
      alert('File upload failed. Please try again.');
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setCurrentThinkingSteps([]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          responseId: responseId,
          files: uploadedFiles.map(f => f.id),
          useThinkingMode: useThinkingMode,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to send message: ${response.status} - ${errorText}`);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        thinkingSteps: []
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Clear loading state immediately when we start receiving the response
      setIsLoading(false);

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          
          // Check for response ID in the chunk
          if (chunk.includes('__RESPONSE_ID__:')) {
            const responseIdMatch = chunk.match(/__RESPONSE_ID__:([^\s]+)/);
            if (responseIdMatch) {
              setResponseId(responseIdMatch[1]);
              continue; // Don't display this chunk
            }
          }
          
          // Handle thinking process events
          if (chunk.includes('__TOOL_START__') || chunk.includes('__TOOL_COMPLETE__')) {
            const updatedSteps = parseThinkingEvents(chunk, currentThinkingSteps);
            setCurrentThinkingSteps(updatedSteps);
            
            // Only update the message with thinking steps, don't show in loading state
            setMessages(prev => 
              prev.map(msg => 
                msg.id === assistantMessage.id 
                  ? { ...msg, thinkingSteps: [...updatedSteps] }
                  : msg
              )
            );
            continue; // Don't display these chunks as content
          }
          
          // Regular content chunks
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setIsLoading(false); // Clear loading on error
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setCurrentThinkingSteps([]);
    }
  };


  if (!isClient) {
    return <div className="min-h-screen bg-background" />; // Prevent hydration mismatch
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Chat Header */}
      <div className="border-b bg-card px-4 py-4 flex-shrink-0">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-foreground">AI Financial Assistant</h1>
                <Badge 
                  variant={useThinkingMode ? "default" : "secondary"} 
                  className={`text-xs ${
                    useThinkingMode 
                      ? 'bg-purple-100 text-purple-700 border-purple-200' 
                      : 'bg-blue-100 text-blue-700 border-blue-200'
                  }`}
                >
                  {useThinkingMode ? (
                    <>
                      <Brain className="w-3 h-3 mr-1" />
                      O3 Think
                    </>
                  ) : (
                    <>
                      <Zap className="w-3 h-3 mr-1" />
                      GPT-4.1 Fast
                    </>
                  )}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {useThinkingMode 
                  ? 'Advanced reasoning mode for complex analysis' 
                  : 'Fast response mode for quick questions'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {uploadedFiles.length > 0 && (
              <Badge variant="secondary" className="gap-2">
                <Paperclip className="w-3 h-3" />
                {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 relative">
        <ScrollArea className="h-full">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {messages.length === 0 && (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-md space-y-6">
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                    <Bot className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-foreground">How can I help you today?</h2>
                    <p className="text-muted-foreground">I&apos;m your AI-powered financial strategist. Upload documents, ask questions, or request analysis.</p>
                  </div>
                  
                  <div className="grid gap-3 text-left">
                    <Card className="p-4 hover:shadow-md transition-all cursor-pointer border-2 hover:border-primary/20">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">💡</div>
                        <div className="font-medium text-foreground">Analyze my portfolio performance</div>
                      </div>
                    </Card>
                    <Card className="p-4 hover:shadow-md transition-all cursor-pointer border-2 hover:border-primary/20">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">📊</div>
                        <div className="font-medium text-foreground">Calculate compound interest</div>
                      </div>
                    </Card>
                    <Card className="p-4 hover:shadow-md transition-all cursor-pointer border-2 hover:border-primary/20">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">📈</div>
                        <div className="font-medium text-foreground">Review my budget spreadsheet</div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className="mb-6">
                {message.role === 'assistant' ? (
                  // Assistant messages: Left-aligned with avatar, full width available
                  <div className="flex gap-4">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Show thinking process for assistant messages */}
                      {message.thinkingSteps && message.thinkingSteps.length > 0 && (
                        <div className="mb-3">
                          <ThinkingProcess steps={message.thinkingSteps} />
                        </div>
                      )}
                      
                      <Card className="bg-muted/50 border-none">
                        <CardContent className="px-3 py-2">
                          <MarkdownRenderer content={message.content} />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  // User messages: Right-aligned with adaptive width
                  <div className="flex gap-4 justify-end">
                    <div className="max-w-[80%] space-y-2">
                      <Card className="bg-primary text-primary-foreground w-fit ml-auto">
                        <CardContent className="px-3 py-2">
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>
            ))}
        
            {isLoading && (
              <div className="mb-6">
                <div className="flex gap-4">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Card className="bg-muted/50 border-none">
                      <CardContent className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-sm text-muted-foreground">AI is thinking...</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
        
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="border-t bg-card p-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((file) => (
                <Badge key={file.id} variant="secondary" className="gap-2 py-1.5">
                  <Paperclip className="w-3 h-3" />
                  <span>{file.filename}</span>
                </Badge>
              ))}
            </div>
          )}
          
          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx,.csv,.xls,.xlsx"
              className="hidden"
            />
            
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (!isLoading && input.trim()) {
                        sendMessage();
                      }
                    }
                  }}
                  placeholder="Ask about your finances, portfolio, or get market insights..."
                  className="min-h-[52px] max-h-32 resize-none pr-12"
                  disabled={isLoading}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute right-2 bottom-2 h-8 w-8 p-0"
                  title="Upload file"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Think Mode Toggle */}
              <Button
                variant={useThinkingMode ? "default" : "outline"}
                size="lg"
                onClick={() => setUseThinkingMode(!useThinkingMode)}
                className={`px-4 transition-all duration-200 ${
                  useThinkingMode 
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg' 
                    : 'hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700'
                }`}
                title={useThinkingMode ? "Using O3 reasoning model" : "Using GPT-4.1 fast model"}
              >
                {useThinkingMode ? (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Think
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Fast
                  </>
                )}
              </Button>
              
              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                size="lg"
                className="px-6"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}