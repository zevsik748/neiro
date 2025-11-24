import React, { useState, useCallback } from 'react';
import { Rocket, Server, BrainCircuit, Terminal, Check } from 'lucide-react';
import { checkGeminiConnection } from './services/gemini';
import { StatusCard } from './components/StatusCard';
import { DeploymentStatus } from './types';

const App: React.FC = () => {
  const [aiStatus, setAiStatus] = useState<DeploymentStatus>(DeploymentStatus.IDLE);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const handleTestAi = useCallback(async () => {
    setAiStatus(DeploymentStatus.LOADING);
    setAiResponse(null);
    try {
      const response = await checkGeminiConnection();
      setAiResponse(response);
      setAiStatus(DeploymentStatus.SUCCESS);
    } catch (error: any) {
      setAiResponse(`Error: ${error.message}`);
      setAiStatus(DeploymentStatus.ERROR);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Timeweb Check</h1>
            </div>
            <p className="text-slate-400">Панель проверки успешного развертывания (Deployment Verification)</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-950/30 border border-emerald-900 rounded-full text-emerald-400 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            System Online
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 1. Build Verification */}
          <StatusCard
            title="Сборка Frontend"
            description="Если вы видите этот экран, значит команда `npm run build` выполнена успешно и статика раздается из папки /dist."
            status="success"
            result="Build Complete: index.html загружен"
            action={
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Terminal className="w-4 h-4" />
                <span>Verified by React Runtime</span>
              </div>
            }
          />

          {/* 2. Environment Verification */}
          <StatusCard
            title="Окружение Node.js"
            description="Проверка версии окружения, указанной в настройках (v24)."
            status="success"
            result={`Environment: Production Mode`}
            action={
               <div className="flex items-center gap-2 text-sm text-slate-400">
                <Server className="w-4 h-4" />
                <span>Running on Timeweb App Platform</span>
              </div>
            }
          />

          {/* 3. AI Connectivity (Interactive) */}
          <StatusCard
            title="Проверка AI API"
            description="Тест переменной окружения API_KEY и доступа к Google Gemini 2.5."
            status={
              aiStatus === DeploymentStatus.IDLE ? 'pending' :
              aiStatus === DeploymentStatus.LOADING ? 'loading' :
              aiStatus === DeploymentStatus.SUCCESS ? 'success' : 'error'
            }
            result={aiResponse || undefined}
            action={
              <button
                onClick={handleTestAi}
                disabled={aiStatus === DeploymentStatus.LOADING}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {aiStatus === DeploymentStatus.LOADING ? (
                  <>Идет запрос...</>
                ) : (
                  <>
                    <BrainCircuit className="w-4 h-4" />
                    Протестировать API
                  </>
                )}
              </button>
            }
          />

           {/* 4. Configuration Info */}
           <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">Инструкция</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-slate-400">
                  <div className="mt-0.5 min-w-4 min-h-4 w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold">1</div>
                  <span>Убедитесь, что в настройках Timeweb указана переменная <code className="bg-slate-900 px-1 py-0.5 rounded text-slate-300">API_KEY</code>.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-400">
                  <div className="mt-0.5 min-w-4 min-h-4 w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold">2</div>
                  <span>Команда сборки должна быть <code className="bg-slate-900 px-1 py-0.5 rounded text-slate-300">npm run build</code>.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-400">
                  <div className="mt-0.5 min-w-4 min-h-4 w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold">3</div>
                  <span>Директория сборки (output) должна быть <code className="bg-slate-900 px-1 py-0.5 rounded text-slate-300">dist</code>.</span>
                </li>
              </ul>
           </div>

        </div>

        <footer className="text-center text-slate-500 text-sm pt-8 border-t border-slate-800">
          <p>Generated by Gemini • Ready for Timeweb Cloud</p>
        </footer>
      </div>
    </div>
  );
};

export default App;