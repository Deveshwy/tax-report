'use client';

import { useEffect, useState } from 'react';

const financeTips = [
  {
    title: "Tax-Deductible Expenses",
    content: "Keep track of business expenses, home office costs, and professional development. These can significantly reduce your taxable income."
  },
  {
    title: "Retirement Contributions",
    content: "Maximize your 401(k) or IRA contributions. Not only do they secure your future, but they also lower your current tax bill."
  },
  {
    title: "Health Savings Account (HSA)",
    content: "HSAs offer a triple tax advantage: tax-deductible contributions, tax-free growth, and tax-free withdrawals for medical expenses."
  },
  {
    title: "Tax Loss Harvesting",
    content: "Sell investments at a loss to offset capital gains. You can deduct up to $3,000 in losses against ordinary income annually."
  },
  {
    title: "Charitable Contributions",
    content: "Donate to qualified charities to get deductions. Keep receipts and documentation for all charitable giving over $250."
  },
  {
    title: "Education Credits",
    content: "The American Opportunity Credit offers up to $2,500 per student for qualified education expenses."
  },
  {
    title: "Home Office Deduction",
    content: "If you work from home, you may deduct a portion of housing expenses. Track your home office space carefully."
  },
  {
    title: "Quarterly Estimated Taxes",
    content: "Self-employed? Pay quarterly estimated taxes to avoid underpayment penalties and manage cash flow better."
  },
  {
    title: "Bunching Deductions",
    content: "Consider 'bunching' deductible expenses in one year to exceed the standard deduction threshold."
  },
  {
    title: "Energy-Efficient Improvements",
    content: "Install solar panels or energy-efficient windows. Many green home improvements offer substantial tax credits."
  },
  {
    title: "Record Keeping",
    content: "Maintain organized records for all income and expenses. Good documentation is your best defense in case of an audit."
  },
  {
    title: "Tax-Advantaged Accounts",
    content: "Utilize 529 plans for education, FSA for healthcare, and employer benefits to maximize tax efficiency."
  }
];

export default function Loading() {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Initializing...');
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [reportGenerationStarted, setReportGenerationStarted] = useState(false);
  const [reportGenerationComplete, setReportGenerationComplete] = useState(false);

  // Smooth easing function for progress animation
  const easeOutQuart = (t: number): number => {
    return 1 - Math.pow(1 - t, 4);
  };

  useEffect(() => {
    // Get quiz data from localStorage
    const quizData = localStorage.getItem('quizData');

    if (!quizData) {
      // No data found, redirect to home
      window.location.href = '/';
      return;
    }

    const userData = JSON.parse(quizData);
    const maxDuration = 120000; // 120 seconds max wait time
    const startTime = Date.now();
    let progressTimeout: NodeJS.Timeout;
    let messageTimeout: NodeJS.Timeout;
    let tipTimeout: NodeJS.Timeout;

    // Smooth progress animation using easeOutQuart curve
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const rawProgress = Math.min(elapsed / maxDuration, 1);

      // Apply easing function - fast at start, slow at end
      const easedProgress = easeOutQuart(rawProgress);

      // Scale to 0-85% range during normal loading (leave room for final completion)
      let displayProgress = easedProgress * 85;

      // Don't exceed 85% until report is actually complete
      if (!reportGenerationComplete && displayProgress > 85) {
        displayProgress = 85;
      }

      setProgress(displayProgress);

      // Continue updating until report is complete
      if (!reportGenerationComplete && elapsed < maxDuration) {
        progressTimeout = setTimeout(updateProgress, 200);
      }
    };

    // Start progress animation
    progressTimeout = setTimeout(updateProgress, 100);

    // Rotate through tips every 4 seconds
    tipTimeout = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % financeTips.length);
    }, 4000);

    // Update progress messages at strategic points
    messageTimeout = setTimeout(() => {
      setMessage('Analyzing your financial situation...');
    }, 3000);

    setTimeout(() => {
      setMessage('Identifying tax optimization opportunities...');
    }, 10000);

    setTimeout(() => {
      setMessage('Generating personalized strategies...');
    }, 25000);

    setTimeout(() => {
      setMessage('Applying advanced tax algorithms...');
    }, 45000);

    setTimeout(() => {
      setMessage('Finalizing your comprehensive report...');
    }, 70000);

    // Generate report
    const generateReport = async () => {
      setReportGenerationStarted(true);

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

        // Mark report as complete
        setReportGenerationComplete(true);
        setProgress(100);
        setMessage('Report generated successfully!');

        setTimeout(() => {
          console.log('Redirecting to /report...');
          window.location.href = '/report';
        }, 1500);

      } catch (error: any) {
        console.error('Error generating report:', error);
        const errorMessage = error.message || 'Unknown error occurred';

        // Show the specific error message
        setMessage(`Error: ${errorMessage}. Redirecting to home...`);

        // Clear localStorage and redirect after a delay
        setTimeout(() => {
          localStorage.removeItem('quizData');
          window.location.href = '/';
        }, 5000);
      } finally {
        clearTimeout(progressTimeout);
        clearTimeout(messageTimeout);
        clearTimeout(tipTimeout);
      }
    };

    // Start generating report immediately
    generateReport();

    return () => {
      clearTimeout(progressTimeout);
      clearTimeout(messageTimeout);
      clearTimeout(tipTimeout);
    };
  }, [reportGenerationComplete]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-lg w-full">
        {/* Logo/Icon */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Generating Your Tax Strategy Report
        </h1>

        {/* Current Status Message */}
        <p className="text-center text-gray-600 mb-6">
          {message}
        </p>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-blue-600 h-4 rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white opacity-25 animate-pulse"></div>
            </div>
          </div>
          <p className="mt-2 text-center text-sm font-medium text-gray-700">
            {Math.round(progress)}% complete
          </p>
        </div>

        {/* Finance Tips Carousel */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center mb-3">
              <svg className="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-semibold text-gray-800">Quick Tax Tip</h3>
            </div>
            <div className="min-h-[60px] flex flex-col justify-center">
              <h4 className="font-medium text-gray-900 mb-1 transition-all duration-500">
                {financeTips[currentTipIndex].title}
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed transition-all duration-500">
                {financeTips[currentTipIndex].content}
              </p>
            </div>
            {/* Tip indicator dots */}
            <div className="flex justify-center mt-4 space-x-1">
              {financeTips.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentTipIndex
                      ? 'bg-primary w-6'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  onClick={() => setCurrentTipIndex(index)}
                  aria-label={`Go to tip ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Estimated Time */}
        <div className="flex items-center justify-center text-sm text-gray-500">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Estimated time: 2-3 minutes</span>
        </div>

        {/* Subtle loading indicator */}
        <div className="flex justify-center mt-6 space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
        </div>
      </div>
    </div>
  );
}