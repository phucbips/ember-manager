import { useState } from 'react'

interface QuizFormProps {
  onSubmit: (embedCode: string) => Promise<void> | void
}

export default function QuizForm({ onSubmit }: QuizFormProps) {
  const [embedCode, setEmbedCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!embedCode.trim()) {
      setError('Please enter embed code')
      return
    }

    setIsSubmitting(true)
    setError(null)
    
    try {
      await onSubmit(embedCode)
      setEmbedCode('')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add quiz')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="embedCode" className="block text-sm font-medium text-gray-700 mb-2">
          Embed Code
        </label>
        <textarea
          id="embedCode"
          value={embedCode}
          onChange={(e) => setEmbedCode(e.target.value)}
          placeholder="Paste your embed code here..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      
      <button
        type="submit"
        disabled={isSubmitting || !embedCode.trim()}
        className="btn-primary disabled:opacity-50"
      >
        {isSubmitting ? 'Adding...' : 'Add Quiz'}
      </button>
    </form>
  )
}