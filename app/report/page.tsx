'use client';

import { useEffect, useState } from 'react';

export default function Report() {
  const [reportHTML, setReportHTML] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [reportName, setReportName] = useState<string>('');
  const [reportDate, setReportDate] = useState<string>('');

  useEffect(() => {
    // Get report data from sessionStorage
    const html = sessionStorage.getItem('reportHTML');
    const name = sessionStorage.getItem('reportName');
    const date = sessionStorage.getItem('reportDate');

    console.log('Report page loading:', { hasHTML: !!html, name, date });

    if (!html) {
      // No report found, redirect to home
      console.log('No HTML found in sessionStorage, redirecting to home');
      window.location.href = '/';
      return;
    }

    setReportHTML(html);
    setReportName(name || '');
    setReportDate(date ? new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : '');
    setIsLoading(false);

    // Don't cleanup immediately - let the user see the report
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // For now, use print dialog. In a real implementation, you might use a library like html2pdf
    window.print();
  };

  const handleNewReport = () => {
    localStorage.removeItem('quizData');
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with controls */}
      <div className="sticky top-0 z-10 bg-white shadow-sm border-b print:hidden">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Tax Strategy Report for {reportName}
              </h1>
              <p className="text-sm text-gray-600">Generated on {reportDate}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                🖨️ Print
              </button>
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                📄 Download PDF
              </button>
              <button
                onClick={handleNewReport}
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
              >
                ➕ New Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="max-w-6xl mx-auto p-4">
        <div
          className="bg-white shadow-lg rounded-lg overflow-hidden"
          dangerouslySetInnerHTML={{ __html: reportHTML }}
        />
      </div>

      {/* Footer - Only visible when not printing */}
      <div className="mt-12 pb-8 print:hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Want a Complete Wealth Strategy?
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            This mini-report covers your top tax strategies. The full Legacy Wealth Blueprint includes
            43+ tax strategies, investment guidance, debt elimination, and asset protection.
          </p>
          <button className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all transform hover:scale-105">
            Learn About Legacy Wealth Blueprint →
          </button>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          @page {
            margin: 0.5in;
          }
        }
      `}</style>
    </div>
  );
}