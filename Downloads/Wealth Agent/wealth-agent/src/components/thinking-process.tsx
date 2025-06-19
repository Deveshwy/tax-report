'use client';

import React from 'react';
import { Search, FileSearch, Calculator, CheckCircle, Loader2 } from 'lucide-react';

interface ThinkingStep {
  id: string;
  tool: 'web_search' | 'file_search' | 'code_interpreter';
  status: 'active' | 'completed';
  query?: string;
  startTime: number;
}

interface ThinkingProcessProps {
  steps: ThinkingStep[];
}

export function ThinkingProcess({ steps }: ThinkingProcessProps) {
  if (steps.length === 0) return null;

  const getIcon = (tool: string, status: string) => {
    const IconComponent = tool === 'web_search' ? Search : 
                         tool === 'file_search' ? FileSearch : 
                         Calculator;
    
    if (status === 'completed') {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    
    return (
      <div className="flex items-center">
        <Loader2 className="w-3 h-3 animate-spin text-blue-600 mr-1" />
        <IconComponent className="w-4 h-4 text-blue-600" />
      </div>
    );
  };

  const getStepText = (step: ThinkingStep) => {
    const baseText = {
      web_search: 'Searching the web',
      file_search: 'Searching course materials', 
      code_interpreter: 'Running calculations'
    }[step.tool];

    if (step.status === 'completed') {
      if (step.tool === 'web_search' && step.query) {
        return `Web search complete: "${step.query}"`;
      }
      return `${baseText} complete`;
    }

    if (step.tool === 'web_search' && step.query) {
      return `${baseText} for: "${step.query}"`;
    }

    return `${baseText}...`;
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center mb-3">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
        <span className="text-sm font-medium text-blue-900">AI is thinking...</span>
      </div>
      
      <div className="space-y-2">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center space-x-3">
            {getIcon(step.tool, step.status)}
            <span className={`text-sm ${
              step.status === 'completed' ? 'text-green-700' : 'text-blue-700'
            }`}>
              {getStepText(step)}
            </span>
            {step.status === 'active' && (
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function parseThinkingEvents(chunk: string, currentSteps: ThinkingStep[]): ThinkingStep[] {
  const newSteps = [...currentSteps];
  
  // Parse tool start events
  const toolStartMatch = chunk.match(/__TOOL_START__:(\w+)/);
  if (toolStartMatch) {
    const tool = toolStartMatch[1] as 'web_search' | 'file_search' | 'code_interpreter';
    
    // Check if we already have ANY step for this tool (active or completed)
    const existingStep = newSteps.find(step => step.tool === tool);
    
    if (!existingStep) {
      newSteps.push({
        id: `${tool}-${Date.now()}`,
        tool,
        status: 'active',
        startTime: Date.now()
      });
    }
  }
  
  // Parse tool complete events
  const toolCompleteMatch = chunk.match(/__TOOL_COMPLETE__:(\w+):(.+)/);
  if (toolCompleteMatch) {
    const tool = toolCompleteMatch[1] as 'web_search' | 'file_search' | 'code_interpreter';
    const query = toolCompleteMatch[2].trim();
    
    // Find the most recent active step for this tool
    const stepIndex = newSteps.findIndex(step => step.tool === tool && step.status === 'active');
    if (stepIndex !== -1) {
      newSteps[stepIndex] = {
        ...newSteps[stepIndex],
        status: 'completed',
        query: query !== 'current information' && query !== 'course materials' && query !== 'calculations' ? query : undefined
      };
    }
  }
  
  return newSteps;
}