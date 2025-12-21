'use client';

import React, { useState, useEffect } from 'react';
import { Question, QuizResponses } from '@/types/quiz';

const questions: Question[] = [
  {
    id: 'name',
    question: "What's your name?",
    type: 'text',
    required: true,
    placeholder: 'Enter your full name'
  },
  {
    id: 'email',
    question: "What's your email address?",
    type: 'text',
    required: true,
    placeholder: 'your@email.com'
  },
  {
    id: 'q1',
    question: 'Approximate total household income last year',
    type: 'number',
    required: true,
    placeholder: 'Enter amount (e.g., 125000)',
    helperText: 'Round to the nearest $5,000'
  },
  {
    id: 'q2',
    question: 'Which state do you live in?',
    type: 'select',
    required: true,
    options: [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
      'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Florida',
      'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana',
      'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
      'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
      'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
      'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
      'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
      'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah',
      'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
    ]
  },
  {
    id: 'q3',
    question: 'How do you primarily earn your income? (Select all that apply)',
    type: 'multiselect',
    required: true,
    options: [
      'W-2 Employee (traditional job)',
      'Self-employed / Freelancer / 1099 Contractor',
      'Business owner (LLC, S-Corp, or C-Corp)',
      'Real estate investor',
      'Investment income (dividends, capital gains)',
      'Retired / Pension income'
    ]
  },
  {
    id: 'q4',
    question: 'If you have a business or side income, approximately how much NET PROFIT does it generate annually?',
    type: 'select',
    required: true,
    options: [
      "I don't have business/side income",
      'Under $30,000',
      '$30,000 - $60,000',
      '$60,000 - $100,000',
      '$100,000 - $200,000',
      '$200,000+'
    ]
  },
  {
    id: 'q4a',
    question: 'Approximately how much NET PROFIT does your business generate annually?',
    type: 'number',
    required: true,
    placeholder: 'Enter net profit amount (e.g., 75000)',
    helperText: 'Round to the nearest $5,000',
    condition: {
      field: 'q3',
      values: ['Self-employed / Freelancer / 1099 Contractor', 'Business owner (LLC, S-Corp, or C-Corp)', 'Real estate investor']
    }
  },
  {
    id: 'q5',
    question: 'Do you currently use any of these tax strategies? (Select all that apply)',
    type: 'multiselect',
    required: true,
    options: [
      'Maximize retirement contributions (401k, IRA)',
      'Home office deduction',
      'Business vehicle deduction',
      'S-Corporation election',
      'Real estate depreciation',
      'HSA contributions',
      'None of the above',
      "I'm not sure"
    ]
  },
  {
    id: 'q6',
    question: "What's your current filing status?",
    type: 'select',
    required: true,
    options: [
      'Single',
      'Married filing jointly',
      'Married filing separately',
      'Head of household'
    ]
  },
  {
    id: 'q7',
    question: 'Which of these best describes your homeownership situation?',
    type: 'select',
    required: true,
    options: [
      'Primary residence only',
      'Second home only',
      'Both primary and second home',
      'None'
    ]
  },
  {
    id: 'q8',
    question: 'Do you own or are you interested in owning rental/investment property?',
    type: 'select',
    required: true,
    options: [
      'Yes, I currently own rental property',
      'No, but I\'m interested in the next 1-2 years',
      'No, not interested in real estate',
      'I own commercial property'
    ]
  },
  {
    id: 'q8a',
    question: 'How many rental units do you own?',
    type: 'select',
    required: true,
    options: [
      '1 unit',
      '2-5 units',
      '6-10 units',
      '10+ units'
    ],
    condition: {
      field: 'q8',
      values: ['Yes, I currently own rental property']
    }
  },
  {
    id: 'q9',
    question: 'How much time can you realistically dedicate to implementing tax strategies per week?',
    type: 'select',
    required: true,
    options: [
      'Less than 1 hour',
      '1-3 hours',
      '3-5 hours',
      '5-10 hours',
      '10+ hours'
    ]
  },
  {
    id: 'q10',
    question: "What's your comfort level with tax strategies?",
    type: 'select',
    required: true,
    options: [
      'Conservative: I only want IRS-safe, well-established strategies',
      'Moderate: I\'m comfortable with legitimate strategies that require professional guidance',
      'Aggressive: I want maximum savings and am willing to implement complex strategies'
    ]
  },
  {
    id: 'q11',
    question: "What's your PRIMARY tax goal?",
    type: 'select',
    required: true,
    options: [
      'Reduce my current year tax bill as much as possible',
      'Build tax-free retirement wealth (Roth strategies)',
      'Create ongoing tax deductions through real estate',
      'Optimize my business structure',
      'All of the above - comprehensive strategy'
    ]
  },
  {
    id: 'q12',
    question: 'Any specific situation we should know about? (Optional)',
    type: 'text',
    required: false,
    placeholder: "E.g., Planning to sell a property, starting a new business, have significant capital gains, spouse doesn't work, etc."
  }
];

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isAnimating, setIsAnimating] = useState(false);

  // Filter questions based on conditions
  const getVisibleQuestions = () => {
    return questions.filter(q => {
      if (!q.condition) return true;

      const conditionValue = answers[q.condition.field];
      if (!conditionValue) return false;

      if (Array.isArray(conditionValue)) {
        return q.condition.values.some(v => conditionValue.includes(v));
      }

      return q.condition.values.includes(conditionValue);
    });
  };

  const visibleQuestions = getVisibleQuestions();
  const q = visibleQuestions[currentQuestion] || visibleQuestions[0];

  // Reset current question if it goes out of bounds when conditions change
  useEffect(() => {
    if (currentQuestion >= visibleQuestions.length && visibleQuestions.length > 0) {
      setCurrentQuestion(visibleQuestions.length - 1);
    }
  }, [currentQuestion, visibleQuestions]);

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleAnswerAndNext = (questionId: string, value: any) => {
    handleAnswer(questionId, value);
    // Auto-advance for single-choice questions
    const currentQ = questions[currentQuestion];
    if (currentQ && currentQ.type === 'select') {
      setTimeout(() => handleNext(), 300); // Small delay for better UX
    }
  };

  const handleNext = () => {
    if (currentQuestion < visibleQuestions.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQuestion(prev => {
          const next = prev + 1;
          return next < visibleQuestions.length ? next : prev;
        });
        setIsAnimating(false);
      }, 300);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQuestion(prev => {
          const back = prev - 1;
          return back >= 0 ? back : 0;
        });
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleSubmit = () => {
    // Validate name and email are filled
    if (!answers.name || !answers.email) {
      alert('Please enter your name and email address before submitting.');
      return;
    }

    // Prepare responses for API
    const responses: QuizResponses = {
      q1: typeof answers.q1 === 'string' ? parseInt(answers.q1) || 0 : (answers.q1 || 0),
      q2: answers.q2,
      q3: answers.q3 || [],
      q4: answers.q4,
      q4a: answers.q4a ? (typeof answers.q4a === 'string' ? parseInt(answers.q4a) : answers.q4a) : undefined,
      q5: answers.q5 || [],
      q6: answers.q6,
      q7: answers.q7,
      q8: answers.q8,
      q8a: answers.q8a,
      q9: answers.q9,
      q10: answers.q10,
      q11: answers.q11,
      q12: answers.q12
    };

    const userData = {
      name: answers.name,
      email: answers.email,
      responses
    };

    console.log('Saving to localStorage:', userData);
    // Store in localStorage and redirect to loading page
    localStorage.setItem('quizData', JSON.stringify(userData));
    window.location.href = '/loading';
  };

  const isCurrentQuestionAnswered = () => {
    if (!q) return false;
    const answer = answers[q.id];
    if (q.required) {
      if (q.type === 'multiselect') {
        return answer && answer.length > 0;
      }
      if (q.type === 'number') {
        // Answer can be string (while typing) or number (after blur)
        if (!answer || answer === '') return false;
        const numValue = typeof answer === 'string' ? parseInt(answer) : answer;
        return !isNaN(numValue) && numValue >= 1000 && numValue <= 10000000;
      }
      return answer && answer !== '';
    }
    return true;
  };

  const progress = ((currentQuestion + 1) / visibleQuestions.length) * 100;

  // Handle Enter key press
  // For text inputs, we'll handle Enter key separately

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestion + 1} of {visibleQuestions.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-300 ${
          isAnimating ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'
        }`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {q.question}
            {q.required && <span className="text-red-500 ml-1">*</span>}
          </h2>

          {q.type === 'select' && q.options && (
            <div className="space-y-3">
              {q.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={option}
                    checked={answers[q.id] === option}
                    onChange={(e) => handleAnswer(q.id, e.target.value)}
                    onClick={() => handleAnswerAndNext(q.id, option)}
                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <span className="ml-3 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          )}

          {q.type === 'multiselect' && q.options && (
            <div className="space-y-3">
              {q.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    value={option}
                    checked={(answers[q.id] || []).includes(option)}
                    onChange={(e) => {
                      const current = answers[q.id] || [];
                      if (e.target.checked) {
                        handleAnswer(q.id, [...current, option]);
                      } else {
                        handleAnswer(q.id, current.filter((o: string) => o !== option));
                      }
                    }}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="ml-3 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          )}

          {q.type === 'text' && (
            <input
              type={q.id === 'email' ? 'email' : 'text'}
              value={answers[q.id] || ''}
              onChange={(e) => handleAnswer(q.id, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isCurrentQuestionAnswered()) {
                  e.preventDefault();
                  handleNext();
                }
              }}
              placeholder={q.placeholder || 'Enter your answer'}
              className="w-full p-4 border-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-black"
            />
          )}

          {q.type === 'number' && (
            <div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={answers[q.id] ? answers[q.id].toString() : ''}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow empty string or numbers only
                  if (value === '' || /^\d+$/.test(value)) {
                    // Store as string while typing, convert to number on blur or submit
                    handleAnswer(q.id, value);
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value && /^\d+$/.test(value)) {
                    const numValue = parseInt(value);
                    // Only validate range on blur
                    if (numValue >= 1000 && numValue <= 10000000) {
                      handleAnswer(q.id, numValue);
                    } else {
                      // Show error feedback
                      alert('Please enter an amount between $1,000 and $10,000,000');
                      handleAnswer(q.id, '');
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isCurrentQuestionAnswered()) {
                    e.preventDefault();
                    // Trigger blur to validate
                    e.currentTarget.blur();
                    if (isCurrentQuestionAnswered()) {
                      handleNext();
                    }
                  }
                }}
                placeholder={q.placeholder || 'Enter amount'}
                className="w-full p-4 border-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-black"
              />
              {q.helperText && (
                <p className="text-sm text-gray-500 mt-2">{q.helperText}</p>
              )}
              {answers[q.id] && answers[q.id] !== '' && (
                <p className="text-sm text-gray-600 mt-1 font-medium">
                  Formatted: ${new Intl.NumberFormat('en-US').format(parseInt(answers[q.id]))}
                </p>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentQuestion === 0}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={handleNext}
              disabled={!isCurrentQuestionAnswered()}
              className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              {currentQuestion === visibleQuestions.length - 1 ? 'Generate My Report' : 'Next →'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Your information is secure and will only be used to generate your personalized tax strategy report.
        </p>
      </div>
    </div>
  );
}