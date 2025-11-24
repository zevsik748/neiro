import React, { useState, useCallback, useRef } from 'react';
import { generateImage } from './services/geminiService';
import { GeneratedImage, GenerationSettings, AspectRatio, Resolution, OutputFormat } from './types';
import { MAX_HISTORY, APP_TITLE, MODEL_INFO, ASPECT_RATIOS, RESOLUTIONS, FORMATS } from './constants';
import { SparklesIcon, LoaderIcon, AlertCircleIcon, HistoryIcon, ImageIcon, XMarkIcon } from './components/Icons';
import { ImageCard } from './components/ImageCard';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [settings, setSettings] = useState<GenerationSettings>({
    aspectRatio: '1:1',
    resolution: '1K',
    format: 'png',
    imageInput: ''
  });
  const [showImageInput, setShowImageInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const imageUrl = await generateImage(prompt.trim(), settings);
      
      const newImage: GeneratedImage = {
        id: crypto.randomUUID(),
        url: imageUrl,
        prompt: prompt.trim(),
        timestamp: Date.now(),
        settings: { ...settings }
      };

      setHistory(prev => [newImage, ...prev].slice(0, MAX_HISTORY));
    } catch (err: any) {
      setError(err.message || 'Ошибка генерации. Попробуйте изменить запрос.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = useCallback((url: string, id: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `nano-banana-${id.slice(0, 8)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const clearImageInput = () => {
    setSettings(s => ({ ...s, imageInput: '' }));
    setShowImageInput(false);
  };

  return (
    <div className="min-h-screen bg-[#020202] text-gray-100 font-sans selection:bg-yellow-500/30">
      
      {/* Фоновые эффекты */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-yellow-600/5 blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6">
        
        {/* Шапка */}
        <header className="mb-10 flex flex-col items-center justify-center text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs tracking-widest uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
            </span>
            AI Powered
          </div>
          
          <h1 className="bg-gradient-to-b from-white via-white to-gray-500 bg-clip-text text-4xl sm:text-6xl font-black text-transparent tracking-tighter">
            {APP_TITLE}
          </h1>
          
          <p className="max-w-lg text-gray-400 text-sm sm:text-base font-light">
            Профессиональная генерация изображений с поддержкой 4K
          </p>

          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="text-xs text-gray-500 hover:text-white transition-colors underline decoration-gray-700 underline-offset-4"
          >
            {showInfo ? 'Скрыть детали модели' : 'Подробнее о возможностях'}
          </button>

          {/* Инфо-блок */}
          <div className={`w-full max-w-2xl overflow-hidden transition-all duration-500 ease-in-out ${showInfo ? 'max-h-[500px] opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'}`}>
             <div className="bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-2xl p-6 text-left">
                <h3 className="text-white font-medium mb-3">Технические возможности</h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">{MODEL_INFO.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MODEL_INFO.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-300">
                      <div className="h-1 w-1 rounded-full bg-yellow-500 shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </header>

        {/* Панель управления */}
        <div className="mx-auto max-w-4xl mb-16 relative">
          
          {/* Форма ввода */}
          <div className="relative z-20 bg-[#0a0a0a] rounded-3xl border border-gray-800 shadow-2xl overflow-hidden transition-all hover:border-gray-700 focus-within:border-yellow-500/50 focus-within:ring-1 focus-within:ring-yellow-500/50">
            <div className="p-4 sm:p-6">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={handleInput}
                placeholder="Опишите вашу идею детально..."
                className="w-full bg-transparent text-lg text-white placeholder-gray-600 outline-none resize-none min-h-[100px] font-light"
                disabled={isLoading}
              />

              {/* Секция ввода изображения (если активна) */}
              {(showImageInput || (settings.imageInput && settings.imageInput.length > 0)) && (
                <div className="mt-4 p-3 bg-gray-900/50 rounded-xl border border-gray-800 animate-fadeIn">
                   <div className="flex items-start gap-4">
                      {settings.imageInput && (
                        <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-black border border-gray-700">
                           <img 
                              src={settings.imageInput} 
                              alt="Reference" 
                              className="h-full w-full object-cover" 
                              onError={(e) => (e.currentTarget.style.display = 'none')}
                           />
                        </div>
                      )}
                      <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1">Ссылка на референс (URL)</label>
                        <input 
                           type="text"
                           value={settings.imageInput}
                           onChange={(e) => setSettings({...settings, imageInput: e.target.value})}
                           placeholder="https://example.com/image.jpg"
                           className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50 placeholder-gray-600"
                        />
                      </div>
                      <button onClick={clearImageInput} className="text-gray-500 hover:text-red-400 p-1">
                         <XMarkIcon className="h-5 w-5" />
                      </button>
                   </div>
                </div>
              )}
              
              {/* Настройки генерации */}
              <div className="mt-6 pt-4 border-t border-gray-800/50 flex flex-wrap gap-4 sm:items-center sm:justify-between">
                
                <div className="flex flex-wrap gap-2 items-center">
                  {/* Button: Toggle Image Input */}
                   <button
                    onClick={() => setShowImageInput(!showImageInput)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium ${
                      showImageInput || settings.imageInput 
                      ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' 
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-600'
                    }`}
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    {settings.imageInput ? 'Референс задан' : 'Добавить фото'}
                  </button>

                  <div className="w-px h-6 bg-gray-800 mx-1 hidden sm:block"></div>

                  {/* Select: Aspect Ratio */}
                  <div className="relative group">
                    <select
                      value={settings.aspectRatio}
                      onChange={(e) => setSettings({...settings, aspectRatio: e.target.value as AspectRatio})}
                      className="appearance-none bg-gray-900 text-xs font-medium text-gray-300 py-1.5 pl-3 pr-8 rounded-lg border border-gray-800 hover:border-gray-600 focus:outline-none focus:border-yellow-500/50 cursor-pointer"
                      disabled={isLoading}
                    >
                      {ASPECT_RATIOS.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  </div>

                  {/* Select: Resolution */}
                  <div className="relative group">
                    <select
                      value={settings.resolution}
                      onChange={(e) => setSettings({...settings, resolution: e.target.value as Resolution})}
                      className="appearance-none bg-gray-900 text-xs font-medium text-gray-300 py-1.5 pl-3 pr-8 rounded-lg border border-gray-800 hover:border-gray-600 focus:outline-none focus:border-yellow-500/50 cursor-pointer"
                      disabled={isLoading}
                    >
                      {RESOLUTIONS.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                       <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  </div>

                  {/* Select: Format */}
                  <div className="relative group">
                     <select
                      value={settings.format}
                      onChange={(e) => setSettings({...settings, format: e.target.value as OutputFormat})}
                      className="appearance-none bg-gray-900 text-xs font-medium text-gray-300 py-1.5 pl-3 pr-8 rounded-lg border border-gray-800 hover:border-gray-600 focus:outline-none focus:border-yellow-500/50 cursor-pointer"
                      disabled={isLoading}
                    >
                      {FORMATS.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                     <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                       <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !prompt.trim()}
                  className={`
                    flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300
                    ${isLoading 
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95'}
                  `}
                >
                  {isLoading ? (
                    <LoaderIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    <SparklesIcon className="h-4 w-4" />
                  )}
                  {isLoading ? 'Генерация...' : 'Создать'}
                </button>
              </div>
            </div>
            
            {/* Прогресс бар (фейковый для визуализации) */}
            {isLoading && (
              <div className="absolute bottom-0 left-0 h-1 bg-yellow-500/50 w-full overflow-hidden">
                <div className="h-full bg-yellow-400 animate-[loading_2s_ease-in-out_infinite] w-full origin-left scale-x-0" />
              </div>
            )}
          </div>

          {/* Декоративное свечение */}
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-purple-600 rounded-[2rem] opacity-0 blur transition duration-500 group-hover:opacity-20 z-10" />

          {error && (
            <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 animate-fadeIn">
              <AlertCircleIcon className="h-5 w-5 shrink-0 mt-0.5 text-red-400" />
              <div>
                <p className="font-medium text-sm">Ошибка</p>
                <p className="text-xs opacity-80 mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Галерея */}
        {history.length > 0 && (
          <div className="animate-slideUp">
            <div className="flex items-center justify-between mb-8 px-2">
              <h2 className="flex items-center gap-2 text-xl font-bold text-white tracking-tight">
                <HistoryIcon className="h-5 w-5 text-yellow-500" />
                История
              </h2>
              <span className="text-xs font-mono text-gray-600 bg-gray-900 px-2 py-1 rounded">
                {history.length} / {MAX_HISTORY}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((image) => (
                <div key={image.id} className="animate-fadeIn">
                   <ImageCard image={image} onDownload={handleDownload} />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Пустое состояние */}
        {history.length === 0 && !isLoading && (
          <div className="mt-20 flex flex-col items-center justify-center text-center opacity-40">
            <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4 rotate-3">
              <SparklesIcon className="h-8 w-8 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">Здесь появятся ваши шедевры</p>
            <p className="text-xs text-gray-600 mt-1 max-w-xs">Используйте настройки выше для выбора формата 4K или 21:9</p>
          </div>
        )}

      </div>
      
      {/* Footer */}
      <div className="fixed bottom-4 right-4 text-[10px] text-gray-800 pointer-events-none select-none font-mono">
        v2.1
      </div>
    </div>
  );
};

export default App;