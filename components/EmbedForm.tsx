
import React, { useState } from 'react';

interface EmbedFormProps {
  onAddQuiz: (embedCode: string) => Promise<void>;
}

const EmbedForm: React.FC<EmbedFormProps> = ({ onAddQuiz }) => {
  const [embedCode, setEmbedCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!embedCode.trim()) return;
    
    setIsSubmitting(true);
    await onAddQuiz(embedCode);
    setEmbedCode('');
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Embed</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={embedCode}
          onChange={(e) => setEmbedCode(e.target.value)}
          rows={4}
          placeholder='Paste your full embed code (iframe) here, e.g., <iframe src="..." title="Content" width="100%" height="700px"></iframe>'
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-4 text-sm transition"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting || !embedCode.trim()}
          className="w-full sm:w-auto bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition duration-150 ease-in-out shadow-md disabled:bg-indigo-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save and Display Content'}
        </button>
      </form>
    </div>
  );
};

export default EmbedForm;
