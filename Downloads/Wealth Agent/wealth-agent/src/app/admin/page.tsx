'use client';

import { useState, useEffect } from 'react';
import { Upload, CheckCircle, XCircle, Loader } from 'lucide-react';

interface CourseStatus {
  uploaded: boolean;
  vector_store_id?: string;
  vector_store_name?: string;
  file_count?: number;
  files?: Array<{
    id: string;
    status: string;
    created_at: number;
  }>;
}

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [courseStatus, setCourseStatus] = useState<CourseStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkCourseStatus();
  }, []);

  const checkCourseStatus = async () => {
    try {
      const response = await fetch('/api/admin/upload-course');
      const data = await response.json();
      setCourseStatus(data);
    } catch (error) {
      console.error('Error checking course status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setStatus('error');
        setMessage('Please select a PDF file');
        return;
      }
      setFile(selectedFile);
      setStatus('idle');
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setStatus('idle');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload-course', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(result.message);
        setFile(null);
        checkCourseStatus(); // Refresh status
      } else {
        setStatus('error');
        setMessage(result.error || 'Upload failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Upload failed. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Content Management</h1>
          <p className="text-gray-600 mb-8">Upload your Legacy Wealth Blueprint PDF for all users to access</p>

          {/* Current Status */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Current Status</h2>
            {courseStatus?.uploaded ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                <div>
                  <p className="font-medium">Course content is uploaded and ready</p>
                  <p className="text-sm text-gray-600">Vector Store: {courseStatus.vector_store_name}</p>
                  <p className="text-sm text-gray-600">Files: {courseStatus.file_count}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center text-orange-600">
                <XCircle className="w-5 h-5 mr-2" />
                <p>No course content uploaded yet</p>
              </div>
            )}
          </div>

          {/* Upload Section */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Course PDF
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  disabled={uploading}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {file ? file.name : 'Click to select PDF file'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    This will replace any existing course content
                  </p>
                </label>
              </div>
            </div>

            {file && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900">Selected File:</h3>
                <p className="text-blue-700">{file.name}</p>
                <p className="text-sm text-blue-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                !file || uploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {uploading ? (
                <div className="flex items-center justify-center">
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Uploading and Processing...
                </div>
              ) : (
                'Upload Course Content'
              )}
            </button>

            {/* Status Messages */}
            {message && (
              <div className={`p-4 rounded-lg ${
                status === 'success' ? 'bg-green-50 text-green-700' :
                status === 'error' ? 'bg-red-50 text-red-700' :
                'bg-blue-50 text-blue-700'
              }`}>
                {message}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-2">Instructions:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Upload your Legacy Wealth Blueprint PDF here</li>
              <li>• This content will be available to ALL users in ALL chat sessions</li>
              <li>• Users can ask questions about the course without uploading anything</li>
              <li>• The AI will automatically search the course content when relevant</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}