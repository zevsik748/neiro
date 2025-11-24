import React, { useState, useRef, useEffect } from 'react';
import { generateImage } from './services/geminiService';
import { createSoraTask, getSoraTaskResult } from './services/kieService';
import { GeneratedImage, GenerationSettings, AspectRatio, Resolution } from './types';
import { MAX_HISTORY, ASPECT_RATIOS, RESOLUTIONS, TOOLS, APP_TITLE } from './constants';
import { SparklesIcon, AlertCircleIcon, HistoryIcon, ImageIcon, DownloadIcon, VideoIcon, WandIcon } from './components/Icons';
import { ImageCard } from './components/ImageCard';

// Utils
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// --- COMPONENTS ---

const PremiumSelect = ({ 
  label, 
  value, 
  options, 
  onChange 
}: { 
  label: string, 
  value: string, 
  options: {value: string, label: string}[], 
  onChange: (val: string) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative text-sm" ref={ref}>
      <div className="text-[11px] font-medium text-gray-500 mb-1.5 uppercase tracking-wide">{label}</div>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all flex justify-between items-center outline-none focus:ring-1 focus:ring-primary/50
          ${isOpen ? 'border-primary/50 bg-surface' : 'border-white/5 bg-surface hover:border-white/10 text-gray-300'}
        `}
      >
        <span className="truncate">{options.find(o => o.value === value)?.label}</span>
        <span className={`text-[10px] transition-transform duration-300 text-gray-500 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 w-full mt-1.5 bg-[#1c1c1f] border border-white/5 rounded-lg shadow-xl max-h-56 overflow-y-auto p-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                ${value === opt.value ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- MAIN APP ---

const App: React.FC = () => {
  const [activeToolId, setActiveToolId] = useState('nano-banana');
  
  // Update document title
  useEffect(() => {
    document.title = APP_TITLE;
  }, []);
  
  // --- GEMINI STATES ---
  const [prompt, setPrompt] = useState('');
  const [settings, setSettings] = useState<GenerationSettings>({
    aspectRatio: '1:1',
    resolution: '1K',
    format: 'png',
    imageInput: ''
  });
  const [showImageInput, setShowImageInput] = useState(false);
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- SORA STATES ---
  const [soraUrl, setSoraUrl] = useState('');
  const [isSoraLoading, setIsSoraLoading] = useState(false);
  const [soraError, setSoraError] = useState<string | null>(null);
  const [soraResultUrl, setSoraResultUrl] = useState<string | null>(null);
  const [soraStatus, setSoraStatus] = useState<string>('');

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  // --- GEMINI HANDLERS ---
  const handleGenerate = async () => {
    if (!prompt.trim() || isGeminiLoading) return;
    setIsGeminiLoading(true);
    setGeminiError(null);

    try {
      const imageUrl = await generateImage(prompt.trim(), settings);
      const newImage: GeneratedImage = {
        id: generateId(),
        url: imageUrl,
        prompt: prompt.trim(),
        timestamp: Date.now(),
        settings: { ...settings }
      };
      setHistory(prev => [newImage, ...prev].slice(0, MAX_HISTORY));
    } catch (err: any) {
      console.error(err);
      setGeminiError(err.message || 'Сбой системы генерации.');
    } finally {
      setIsGeminiLoading(false);
    }
  };

  const handleDownload = (url: string, id: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `NanoBanana_${id.toUpperCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- SORA HANDLERS ---
  const handleSoraRemove = async () => {
    if (!soraUrl.trim() || isSoraLoading) return;
    setIsSoraLoading(true);
    setSoraError(null);
    setSoraResultUrl(null);
    setSoraStatus('Инициализация задачи...');

    try {
      const taskId = await createSoraTask(soraUrl.trim());
      setSoraStatus('Обработка нейросетью...');
      
      // Polling loop
      const pollInterval = setInterval(async () => {
        try {
          const result = await getSoraTaskResult(taskId);
          if (result) {
            clearInterval(pollInterval);
            if (result.resultUrls && result.resultUrls.length > 0) {
              setSoraResultUrl(result.resultUrls[0]);
              setSoraStatus('Готово!');
            } else {
              setSoraError('Результат пуст, хотя статус успешен.');
            }
            setIsSoraLoading(false);
          } else {
            // Still waiting, just keep polling
          }
        } catch (err: any) {
          clearInterval(pollInterval);
          setSoraError(err.message || 'Ошибка в процессе обработки');
          setIsSoraLoading(false);
        }
      }, 3000); // Check every 3 seconds

    } catch (err: any) {
      setSoraError(err.message || 'Не удалось запустить задачу');
      setIsSoraLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-gray-200 selection:bg-primary/30 selection:text-white pb-20 font-sans">
      
      {/* Subtle top glow */}
      <div className="fixed top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6">
        
        {/* Header */}
        <header className="mb-10 text-center md:text-left">
           <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{APP_TITLE}</h1>
           <p className="text-sm text-gray-500">Профессиональные инструменты ИИ для работы с медиа</p>
        </header>

        {/* TOOL SELECTOR */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveToolId(tool.id)}
              className={`
                relative p-5 rounded-2xl border text-left transition-all duration-300 group
                ${activeToolId === tool.id 
                  ? 'bg-surface border-primary/40 shadow-[0_0_20px_rgba(234,179,8,0.1)]' 
                  : 'bg-surface/50 border-white/5 hover:border-white/10 hover:bg-surface'}
              `}
            >
              {tool.badge && (
                <span className="absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded bg-primary text-black uppercase">
                  {tool.badge}
                </span>
              )}
              <div className={`mb-4 w-10 h-10 rounded-lg flex items-center justify-center transition-colors
                 ${activeToolId === tool.id ? 'bg-primary text-black' : 'bg-white/5 text-gray-400 group-hover:text-white'}
              `}>
                {tool.icon === 'image' && <ImageIcon className="w-5 h-5" />}
                {tool.icon === 'video' && <VideoIcon className="w-5 h-5" />}
              </div>
              <h3 className={`text-sm font-bold mb-1 ${activeToolId === tool.id ? 'text-white' : 'text-gray-300'}`}>
                {tool.name}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {tool.description}
              </p>
            </button>
          ))}
        </div>

        {/* --- NANO BANANA (GEMINI) UI --- */}
        {activeToolId === 'nano-banana' && (
          <div key="nano-banana" className="flex flex-col lg:flex-row gap-12 items-start animate-fade-in">
             
             {/* Left Panel: Controls */}
             <div className="w-full lg:w-[380px] shrink-0 space-y-8 lg:sticky lg:top-8">
                
                {/* Prompt Input */}
                <div className="space-y-3">
                   <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Ваш запрос</label>
                      <span className="text-[10px] text-gray-600">{prompt.length} символов</span>
                   </div>
                   
                   <div className="relative group">
                      <textarea
                         ref={textareaRef}
                         value={prompt}
                         onChange={(e) => setPrompt(e.target.value)}
                         placeholder="Опишите изображение детально..."
                         className="w-full bg-surface border border-white/5 rounded-xl p-4 text-sm text-white placeholder-gray-600 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none min-h-[140px] leading-relaxed shadow-sm"
                         disabled={isGeminiLoading}
                      />
                   </div>
                </div>

                {/* Reference Image */}
                <div className="bg-surface border border-white/5 rounded-xl overflow-hidden">
                   <button 
                      onClick={() => setShowImageInput(!showImageInput)}
                      className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/5 transition-colors"
                   >
                      <span className="flex items-center gap-2.5 text-sm font-medium text-gray-300">
                         <ImageIcon className="w-4 h-4 text-primary" />
                         Референс (Изображение)
                      </span>
                      <span className="text-gray-500 text-xs">{showImageInput || settings.imageInput ? 'Скрыть' : 'Добавить'}</span>
                   </button>
                   
                   {(showImageInput || settings.imageInput) && (
                      <div className="p-4 border-t border-white/5 bg-black/20 animate-slide-up">
                         <input 
                            type="text"
                            value={settings.imageInput || ''}
                            onChange={(e) => setSettings({...settings, imageInput: e.target.value})}
                            placeholder="https://example.com/image.png"
                            className="w-full bg-background border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:border-primary/50 outline-none mb-2 placeholder-gray-700"
                         />
                      </div>
                   )}
                </div>

                {/* Settings */}
                <div className="grid grid-cols-2 gap-4">
                   <PremiumSelect 
                      label="Формат кадра" 
                      value={settings.aspectRatio} 
                      options={ASPECT_RATIOS} 
                      onChange={(v) => setSettings({...settings, aspectRatio: v as AspectRatio})}
                   />
                   <PremiumSelect 
                      label="Качество" 
                      value={settings.resolution} 
                      options={RESOLUTIONS} 
                      onChange={(v) => setSettings({...settings, resolution: v as Resolution})}
                   />
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={isGeminiLoading || !prompt.trim()}
                  className={`
                     w-full py-4 rounded-xl font-semibold text-sm tracking-wide shadow-lg
                     flex items-center justify-center gap-2 transition-all duration-300
                     ${isGeminiLoading || !prompt.trim() 
                       ? 'bg-surface text-gray-500 cursor-not-allowed border border-white/5' 
                       : 'bg-white text-black hover:bg-gray-200 hover:shadow-white/10 hover:-translate-y-0.5'}
                  `}
                >
                   {isGeminiLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin"></div>
                        <span>Обработка...</span>
                      </>
                   ) : (
                      <>
                         <SparklesIcon className="w-4 h-4" />
                         Создать изображение
                      </>
                   )}
                </button>

                {geminiError && (
                   <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex items-start gap-3">
                      <AlertCircleIcon className="w-5 h-5 shrink-0 text-red-400" />
                      <span className="leading-relaxed">{geminiError}</span>
                   </div>
                )}
             </div>

             {/* Right Panel: Output */}
             <div className="flex-1 w-full min-h-[500px]">
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5">
                   <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <HistoryIcon className="w-4 h-4" />
                      Галерея
                   </h2>
                   <span className="text-xs text-gray-600 font-mono bg-surface px-2 py-1 rounded">
                      {history.length} / {MAX_HISTORY}
                   </span>
                </div>

                {history.length === 0 && !isGeminiLoading && (
                   <div className="h-96 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl bg-surface/30">
                      <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mb-4 shadow-inner">
                         <ImageIcon className="w-6 h-6 text-gray-600" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">Нет созданных изображений</p>
                      <p className="text-xs text-gray-600 mt-1">Введите запрос слева, чтобы начать творить</p>
                   </div>
                )}

                <div className="columns-1 md:columns-2 gap-6 space-y-6">
                   {history.map((image) => (
                      <div key={image.id} className="break-inside-avoid animate-fade-in">
                         <ImageCard image={image} onDownload={handleDownload} />
                      </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {/* --- SORA REMOVER UI --- */}
        {activeToolId === 'sora-remover' && (
          <div key="sora-remover" className="max-w-3xl mx-auto animate-fade-in">
             <div className="bg-surface border border-white/5 rounded-2xl p-6 md:p-10 shadow-xl">
                
                <div className="text-center mb-8">
                   <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                      <WandIcon className="w-8 h-8 text-blue-400" />
                   </div>
                   <h2 className="text-xl font-bold text-white mb-2">Удаление водяных знаков Sora</h2>
                   <p className="text-sm text-gray-400">Вставьте ссылку на видео Sora (OpenAI) для получения чистого результата.</p>
                </div>

                <div className="space-y-6">
                   <div>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Ссылка на видео</label>
                      <input 
                         type="text"
                         value={soraUrl}
                         onChange={(e) => setSoraUrl(e.target.value)}
                         placeholder="https://sora.chatgpt.com/p/..."
                         className="w-full bg-background border border-white/10 rounded-xl px-4 py-4 text-sm text-white focus:border-blue-500/50 outline-none placeholder-gray-600 transition-all"
                         disabled={isSoraLoading}
                      />
                      <p className="text-[10px] text-gray-500 mt-2">Поддерживаются только публичные ссылки sora.chatgpt.com</p>
                   </div>

                   <button
                     onClick={handleSoraRemove}
                     disabled={isSoraLoading || !soraUrl.trim()}
                     className={`
                        w-full py-4 rounded-xl font-semibold text-sm tracking-wide shadow-lg
                        flex items-center justify-center gap-2 transition-all duration-300
                        ${isSoraLoading || !soraUrl.trim() 
                          ? 'bg-white/5 text-gray-500 cursor-not-allowed' 
                          : 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-blue-500/20'}
                     `}
                   >
                      {isSoraLoading ? (
                         <>
                           <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                           <span>{soraStatus || 'Обработка...'}</span>
                         </>
                      ) : (
                         <>
                            <WandIcon className="w-4 h-4" />
                            Удалить водяной знак
                         </>
                      )}
                   </button>

                   {soraError && (
                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex items-center gap-3">
                         <AlertCircleIcon className="w-5 h-5 shrink-0 text-red-400" />
                         <span>{soraError}</span>
                      </div>
                   )}

                   {soraResultUrl && !isSoraLoading && (
                      <div className="mt-8 animate-slide-up">
                         <div className="p-1 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10">
                            <div className="bg-[#0a0a0c] rounded-lg overflow-hidden">
                               <video 
                                 src={soraResultUrl} 
                                 controls 
                                 className="w-full aspect-video"
                                 poster={soraResultUrl} // Simple trick, actually better to have a thumbnail
                               />
                               <div className="p-4 flex items-center justify-between">
                                  <span className="text-xs text-green-400 flex items-center gap-2">
                                     <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                     Готово
                                  </span>
                                  <a 
                                    href={soraResultUrl} 
                                    download 
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                                  >
                                     <DownloadIcon className="w-4 h-4" />
                                     Скачать видео
                                  </a>
                               </div>
                            </div>
                         </div>
                      </div>
                   )}
                </div>
             </div>
          </div>
        )}

        <footer className="mt-24 py-8 text-center border-t border-white/5">
           <p className="text-xs text-gray-600">
              AI Tools Platform &copy; 2024. Powered by Gemini & Kie.ai.
           </p>
        </footer>

      </div>
    </div>
  );
};

export default App;