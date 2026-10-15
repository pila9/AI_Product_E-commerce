import { useState, type FormEvent } from 'react';
import { promptSuggestions } from '../data/products';

interface DiscoveryPanelProps {
  onSearch: (prompt: string) => void;
  isLoading: boolean;
  error: string | null;
  activeQuery: string;
  activeEditSummary: string | null;
  onClear: () => void;
}

export function DiscoveryPanel({
  onSearch,
  isLoading,
  error,
  activeQuery,
  activeEditSummary,
  onClear,
}: DiscoveryPanelProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSearch(inputValue.trim());
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    setInputValue(prompt);
    onSearch(prompt);
  };

  return (
    <section className="mb-12" aria-labelledby="discovery-title">
      <div className="max-w-2xl mx-auto text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 rounded-full">
          <span aria-hidden="true">✳</span>
          YOUR PERSONAL EDIT
        </span>
        <h3 id="discovery-title" className="mt-3 text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">
          What are you looking for?
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Tell us what matters. AI will find a few good matches just for you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mt-6" aria-label="AI discovery">
        <div className="relative">
          <label htmlFor="discovery-input" className="sr-only">
            Describe what you are looking for
          </label>
          <input
            id="discovery-input"
            type="search"
            placeholder="e.g. a calmer morning, a thoughtful gift..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            maxLength={300}
            disabled={isLoading}
            className="w-full px-6 py-4 text-base border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 dark:focus:border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            autoComplete="off"
            required
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Finding...' : 'Find my edit'}
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-4" aria-label="Try a suggestion">
          {promptSuggestions.map(({ prompt, label }) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSuggestionClick(prompt)}
              disabled={isLoading}
              className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-50 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </form>

      {(activeEditSummary || error) && (
        <div
          id="results-note"
          className={`mt-6 text-center text-sm ${error ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}
          role="status"
          aria-live="polite"
        >
          {error ? (
            error
          ) : (
            <>
              Your AI edit for &ldquo;{activeQuery}&rdquo;: {activeEditSummary}
            </>
          )}
        </div>
      )}

      {(activeQuery || activeEditSummary) && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onClear}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 underline underline-offset-2"
          >
            Show me everything
          </button>
        </div>
      )}
    </section>
  );
}