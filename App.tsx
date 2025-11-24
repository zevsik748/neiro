import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { generateTaskContent } from './services/geminiService';
import { Task, TaskStatus } from './types';
import { TaskItem } from './components/TaskItem';
import { NewTaskForm } from './components/NewTaskForm';
import { TaskDetail } from './components/TaskDetail';
import { IconList, IconPlus } from './components/Icons';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Helper to update a specific task in the list
  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleCreateTask = useCallback(async (prompt: string) => {
    const newTask: Task = {
      id: uuidv4(),
      prompt,
      status: TaskStatus.QUEUED,
      createdAt: Date.now(),
    };

    setTasks(prev => [newTask, ...prev]);
    setActiveTaskId(newTask.id);

    // Simulate queue delay slightly for effect, then process
    updateTask(newTask.id, { status: TaskStatus.PROCESSING });

    try {
      const response = await generateTaskContent(prompt);
      updateTask(newTask.id, {
        status: TaskStatus.COMPLETED,
        response,
        completedAt: Date.now()
      });
    } catch (error) {
      updateTask(newTask.id, {
        status: TaskStatus.FAILED,
        error: error instanceof Error ? error.message : "Unknown error",
        completedAt: Date.now()
      });
    }
  }, []);

  const activeTask = tasks.find(t => t.id === activeTaskId);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      
      {/* Sidebar - Task History */}
      <div className={`${isSidebarOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full opacity-0'} transition-all duration-300 ease-in-out border-r border-slate-800 bg-slate-950 flex flex-col z-20`}>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2 font-bold text-slate-100">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              AI
            </div>
            <span>Task Manager</span>
          </div>
        </div>

        <div className="p-3">
          <button
            onClick={() => setActiveTaskId(null)}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-900/20"
          >
            <IconPlus className="w-4 h-4" />
            New Job
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            History
          </div>
          {tasks.length === 0 ? (
            <div className="p-8 text-center text-slate-600 text-sm">
              No tasks yet.
            </div>
          ) : (
            tasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                isSelected={activeTask?.id === task.id}
                onClick={(t) => setActiveTaskId(t.id)} 
              />
            ))
          )}
        </div>
        
        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-600">
          Status: <span className="text-emerald-500">System Online</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative bg-slate-900/30">
        
        {/* Mobile Sidebar Toggle (only visible if sidebar logic required on mobile, strictly simpler here) */}
        <button 
            className="absolute top-4 left-4 z-10 p-2 bg-slate-800 rounded-md border border-slate-700 text-slate-400 hover:text-white md:hidden"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
        >
            <IconList className="w-5 h-5" />
        </button>

        {activeTask ? (
          <TaskDetail task={activeTask} />
        ) : (
          <NewTaskForm 
            onSubmit={handleCreateTask} 
            isSubmitting={false} 
          />
        )}
      </div>
    </div>
  );
};

export default App;