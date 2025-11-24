import React from 'react';
import { Task, TaskStatus } from '../types';
import { IconCheckCircle, IconLoader, IconXCircle, IconClock } from './Icons';

interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  onClick: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, isSelected, onClick }) => {
  const getStatusIcon = () => {
    switch (task.status) {
      case TaskStatus.COMPLETED:
        return <IconCheckCircle className="w-5 h-5 text-emerald-400" />;
      case TaskStatus.PROCESSING:
        return <IconLoader className="w-5 h-5 text-indigo-400 animate-spin" />;
      case TaskStatus.FAILED:
        return <IconXCircle className="w-5 h-5 text-rose-400" />;
      default:
        return <IconClock className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div
      onClick={() => onClick(task)}
      className={`p-4 border-b border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-colors ${
        isSelected ? 'bg-slate-800 border-l-4 border-l-indigo-500' : 'border-l-4 border-l-transparent'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-mono text-slate-500">#{task.id.slice(0, 8)}</span>
        {getStatusIcon()}
      </div>
      <div className="text-sm font-medium text-slate-200 line-clamp-1">
        {task.prompt || "New Task"}
      </div>
      <div className="text-xs text-slate-500 mt-1">
        {new Date(task.createdAt).toLocaleTimeString()}
      </div>
    </div>
  );
};