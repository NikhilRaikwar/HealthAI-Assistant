import React from 'react';
import { Send, Loader } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
}

export function ChatInput({ input, setInput, handleSubmit, loading }: ChatInputProps) {
  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex gap-3 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your health-related question..."
        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500"
        disabled={loading}
        aria-label="Chat input"
      />
      <button
        type="submit"
        disabled={loading || !input.trim()}
        className="px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={loading ? "Sending message..." : "Send message"}
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            <span className="hidden sm:inline">Sending...</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span className="hidden sm:inline">Send</span>
          </>
        )}
      </button>
    </form>
  );
}