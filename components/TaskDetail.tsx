import React from 'react';
import { Task, TaskStatus } from '../types';
import { IconCheckCircle, IconClock, IconLoader, IconTerminal, IconXCircle } from './Icons';

interface TaskDetailProps {
  task: Task;
}

export const TaskDetail: React.FC<TaskDetailProps> = ({ task }) => {
  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-900/50">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              task.status === TaskStatus.COMPLETED ? 'bg-emerald-500/10 text-emerald-400' :
              task.status === TaskStatus.FAILED ? 'bg-rose-500/10 text-rose-400' :
              task.status === TaskStatus.PROCESSING ? 'bg-indigo-500/10 text-indigo-400' :
              'bg-slate-700/50 text-slate-400'
            }`}>
              {task.status === TaskStatus.COMPLETED && <IconCheckCircle className="w-6 h-6" />}
              {task.status === TaskStatus.FAILED && <IconXCircle className="w-6 h-6" />}
              {task.status === TaskStatus.PROCESSING && <IconLoader className="w-6 h-6 animate-spin" />}
              {task.status === TaskStatus.IDLE && <IconClock className="w-6 h-6" />}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Task #{task.id.slice(0, 8)}</h1>
              <p className="text-sm text-slate-400 font-mono">
                {new Date(task.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
            {task.status}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Request Section */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <IconTerminal className="w-4 h-4" /> Request Payload
          </label>
          <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 font-mono text-sm text-slate-300 whitespace-pre-wrap">
            {task.prompt}
          </div>
        </div>

        {/* Response Section */}
        {task.status === TaskStatus.COMPLETED && (
          <div className="space-y-2 animate-fade-in-up">
            <label className="text-xs font-semibold text-emerald-500/80 uppercase tracking-wider flex items-center gap-2">
               Output Result
            </label>
            <div className="bg-slate-950 rounded-lg border border-emerald-900/30 p-4 shadow-lg shadow-emerald-900/5">
              <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                <pre className="whitespace-pre-wrap bg-transparent border-none p-0 m-0 font-sans">{task.response}</pre>
              </div>
            </div>
          </div>
        )}

        {task.status === TaskStatus.FAILED && (
          <div className="bg-rose-950/30 border border-rose-900/50 text-rose-300 p-4 rounded-lg">
            <strong>Error:</strong> {task.error}
          </div>
        )}
        
        {task.status === TaskStatus.PROCESSING && (
           <div className="flex flex-col items-center justify-center py-12 text-slate-500 space-y-4">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm animate-pulse">Processing request via Gemini API...</p>
           </div>
        )}
      </div>
    </div>
  );
};