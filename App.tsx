import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageGenerator } from './components/ImageGenerator';

function App() {
  // Persist API Key in local storage for convenience
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('kie_api_key') || '';
  });

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem('kie_api_key', key);
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] text-slate-100 pb-20">
        
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Раскройте творческий потенциал с <span className="text-banana-400">Nano Banana</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Создавайте качественных, последовательных персонажей и сцены с помощью мощной модели KIE.AI Nano Banana. 
            Быстрая генерация за часть стоимости.
          </p>
        </div>

        <ImageGenerator apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />

        {/* Feature Highlights / Info */}
        <div className="max-w-4xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 backdrop-blur-sm">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-2">Быстрая генерация</h3>
            <p className="text-sm text-slate-400">Оптимизировано для скорости без потери качества. Результат за секунды.</p>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 backdrop-blur-sm">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-2">Согласованность</h3>
            <p className="text-sm text-slate-400">Сохраняйте идентичность персонажей при генерации с режимом Image-to-Image.</p>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 backdrop-blur-sm">
             <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-2">Экономичность</h3>
            <p className="text-sm text-slate-400">Значительно дешевле конкурентов при высочайшем качестве изображений.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;