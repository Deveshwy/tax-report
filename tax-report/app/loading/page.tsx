'use client';

import { useEffect, useState } from 'react';

export default function Loading() {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Initializing...');

  useEffect(() => {
    // Get quiz data from localStorage
    const quizData = localStorage.getItem('quizData');

    if (!quizData) {
      // No data found, redirect to home
      window.location.href = '/';
      return;
    }

    const userData = JSON.parse(quizData);
    let progressInterval: NodeJS.Timeout;
    let messageInterval: NodeJS.Timeout;

    // Progress animation
    progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 1;
      });
    }, 50);

    // Update messages
    const messages = [
      'Initializing...',
      'Analyzing your responses...',
      'Calculating your tax profile...',
      'Identifying optimal strategies...',
      'Generating personalized recommendations...',
      'Finalizing your report...'
    ];

    let messageIndex = 0;
    messageInterval = setInterval(() => {
      if (messageIndex < messages.length) {
        setMessage(messages[messageIndex]);
        messageIndex++;
      }
    }, 800);

    // Generate report
    const generateReport = async () => {
      try {
        // Log what we're sending
        console.log('Sending userData:', userData);

        const response = await fetch('/api/generate-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to generate report');
        }

        // Store the HTML report in sessionStorage
        console.log('Storing report data in sessionStorage');
        console.log('HTML length:', result.html.length);
        console.log('User name:', userData.name);

        sessionStorage.setItem('reportHTML', result.html);
        sessionStorage.setItem('reportName', userData.name);
        sessionStorage.setItem('reportDate', new Date().toISOString());

        // Verify it was stored
        console.log('Stored in sessionStorage:', {
          hasHTML: !!sessionStorage.getItem('reportHTML'),
          hasName: !!sessionStorage.getItem('reportName'),
          hasDate: !!sessionStorage.getItem('reportDate')
        });

        // Complete progress and redirect
        setProgress(100);
        setMessage('Report generated successfully!');

        setTimeout(() => {
          console.log('Redirecting to /report...');
          window.location.href = '/report';
        }, 1000);

      } catch (error: any) {
        console.error('Error generating report:', error);
        const errorMessage = error.message || 'Unknown error occurred';

        // Show the specific error message
        setMessage(`Error: ${errorMessage}. Redirecting to home...`);

        // Clear localStorage and redirect after a delay
        setTimeout(() => {
          localStorage.removeItem('quizData');
          window.location.href = '/';
        }, 5000); // Increased delay to show error message
      } finally {
        clearInterval(progressInterval);
        clearInterval(messageInterval);
      }
    };

    // Start generating report after a short delay
    setTimeout(generateReport, 500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-md w-full text-center">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto bg-primary rounded-full flex items-center justify-center animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Generating Your Tax Strategy Report
        </h1>

        {/* Message */}
        <p className="text-lg text-gray-600 mb-8">
          {message}
        </p>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {progress}% complete
          </p>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">
            We're analyzing your responses and creating personalized tax strategies based on your unique situation. This usually takes about 30-60 seconds.
          </p>
        </div>
      </div>
    </div>
  );
}