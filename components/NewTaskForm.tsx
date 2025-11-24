import React, { useState } from 'react';
import { IconPlus, IconTerminal } from './Icons';

interface NewTaskFormProps {
  onSubmit: (prompt: string) => void;
  isSubmitting: boolean;
}

export const NewTaskForm: React.FC<NewTaskFormProps> = ({ onSubmit, isSubmitting }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onSubmit(prompt);
    setPrompt('');
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-slate-700 shadow-xl shadow-black/20">
        <IconTerminal className="w-8 h-8 text-indigo-400" />
      </div>
      <h2 className="text-2xl font-bold text-slate-100 mb-2">Create New Job</h2>
      <p className="text-slate-400 mb-8 max-w-md">
        Submit a prompt to the AI worker. The system will process your request asynchronously and return the result.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-lg">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the task (e.g., 'Generate a Python script to check server status')..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none h-32 transition-all placeholder:text-slate-600"
            disabled={isSubmitting}
          />
          <div className="absolute bottom-3 right-3">
            <button
              type="submit"
              disabled={isSubmitting || !prompt.trim()}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isSubmitting || !prompt.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
              }`}
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>
                  <IconPlus className="w-4 h-4" />
                  Run Job
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-8 flex gap-4 text-xs text-slate-600 font-mono">
        <span>Engine: Gemini 2.5 Flash</span>
        <span>•</span>
        <span>Latency: ~1.2s</span>
      </div>
    </div>
  );
};