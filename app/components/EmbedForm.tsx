import React, { useState } from 'react';
import { validateEmbedCode } from '../utils';

interface EmbedFormProps {
  onAddQuiz: (embedCode: string) => Promise<void>;
}

const EmbedForm: React.FC<EmbedFormProps> = ({ onAddQuiz }) => {
  const [embedCode, setEmbedCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!embedCode.trim()) {
      setError('Please enter an embed code.');
      return;
    }

    if (!validateEmbedCode(embedCode)) {
      setError('Invalid embed code. Please ensure it contains a valid iframe or embed tag with src attribute.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      await onAddQuiz(embedCode);
      setEmbedCode('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving the embed code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEmbedCode(e.target.value);
    if (error) setError(null);
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Add New Embed</h2>
          <p className="text-gray-600 text-sm">
            Paste your full embed code below. The system will automatically extract the source URL and title.
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="embedCode" className="block text-sm font-medium text-gray-700 mb-2">
              Embed Code
            </label>
            <textarea
              name="embedCode"
              id="embedCode"
              value={embedCode}
              onChange={handleInputChange}
              rows={6}
              placeholder='Paste your full embed code here, e.g., <iframe src="https://example.com/embed" title="Quiz Title" width="100%" height="700px"></iframe>'
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              disabled={isSubmitting}
            />
            <p className="mt-2 text-xs text-gray-500">
              Supports iframe and embed tags. Make sure your code includes a valid src attribute.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isSubmitting || !embedCode.trim()}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Embed
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => {
                setEmbedCode('');
                setError(null);
              }}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmbedForm;