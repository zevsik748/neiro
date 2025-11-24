import React from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface StatusCardProps {
  title: string;
  description: string;
  status: 'success' | 'error' | 'loading' | 'pending';
  action?: React.ReactNode;
  result?: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({ title, description, status, action, result }) => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg transition-all hover:border-slate-600">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          <p className="text-sm text-slate-400 mt-1">{description}</p>
        </div>
        <div className="flex-shrink-0">
          {status === 'success' && <CheckCircle className="w-6 h-6 text-emerald-500" />}
          {status === 'error' && <XCircle className="w-6 h-6 text-rose-500" />}
          {status === 'loading' && <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />}
          {status === 'pending' && <div className="w-6 h-6 rounded-full border-2 border-slate-600" />}
        </div>
      </div>
      
      {result && (
        <div className={`mt-4 p-3 rounded-lg text-sm font-mono ${status === 'error' ? 'bg-rose-950/30 text-rose-200 border border-rose-900' : 'bg-slate-900/50 text-emerald-300 border border-slate-700'}`}>
          {result}
        </div>
      )}

      {action && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          {action}
        </div>
      )}
    </div>
  );
};