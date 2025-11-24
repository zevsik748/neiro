import React, { useState, useRef, useEffect } from 'react';
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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

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

  const handleDownload = (url: string, id: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `nano-banana-${id.slice(0, 8)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearImageInput = () => {
    setSettings(s => ({ ...s, imageInput: '' }));
    setShowImageInput(false);
  };

  return (
    <div className="min-h-screen relative selection:bg-yellow-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none z-0"></div>
      <div className="fixed top-[-20%] left-[10%] w-[600px] h-[600px] bg-yellow-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="fixed bottom-[-10%] right-[5%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 flex flex-col min-h-screen">
        
        {/* Header */}
        <header className="flex flex-col items-center justify-center text-center mb-12 animate-[fadeIn_0.8s_ease-out]">
          <div className="mb-4 inline-flex items-center gap-3 px-4 py-1.5 rounded-full glass-panel border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
            </span>
            <span className="text-[10px] font-mono tracking-[0.2em] text-yellow-500 uppercase font-bold">System Online</span>
          </div>
          
          <h1 className="relative text-5xl sm:text-7xl font-bold tracking-tighter mb-4 text-white group cursor-default">
            <span className="bg-gradient-to-br from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">NANO</span>
            <span className="bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 bg-clip-text text-transparent ml-3 group-hover:text-yellow-400 transition-colors duration-500">BANANA</span>
            <sup className="absolute top-2 -right-6 text-xs font-mono text-gray-500 border border-gray-800 rounded px-1 py-0.5">PRO</sup>
          </h1>
          
          <p className="max-w-md text-gray-400 text-sm font-light tracking-wide leading-relaxed">
            Архитектура генерации изображений следующего поколения.
            <br className="hidden sm:block"/>
            Поддержка <span className="text-yellow-500/80 font-mono">4K</span> разрешения и кинематографичного <span className="text-yellow-500/80 font-mono">21:9</span>.
          </p>

           <button 
            onClick={() => setShowInfo(!showInfo)}
            className="mt-4 text-[10px] uppercase tracking-widest text-gray-600 hover:text-yellow-500 transition-colors border-b border-transparent hover:border-yellow-500/50 pb-0.5"
          >
            {showInfo ? 'Close Specifications' : 'View Specifications'}
          </button>

          {/* Collapsible Tech Specs */}
          <div className={`w-full max-w-2xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${showInfo ? 'max-h-[500px] opacity-100 mt-8' : 'max-h-0 opacity-0 mt-0'}`}>
             <div className="glass-panel rounded-lg p-6 text-left border-l-4 border-l-yellow-500">
                <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
                  <h3 className="text-white font-mono text-xs uppercase tracking-widest">Model Architecture</h3>
                  <span className="text-[10px] text-gray-500 font-mono">V.3.0.1</span>
                </div>
                <p className="text-gray-400 text-sm mb-6 font-light leading-relaxed">{MODEL_INFO.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
                  {MODEL_INFO.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs text-gray-300 font-mono">
                      <div className="h-1.5 w-1.5 rounded-sm bg-yellow-500 shrink-0 shadow-[0_0_5px_rgba(234,179,8,0.5)]" />
                      {feature}
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </header>

        {/* Main Control Center */}
        <div className="mx-auto w-full max-w-4xl relative z-20 mb-20 animate-[slideUp_0.6s_ease-out_0.2s_both]">
          
          {/* Glowing Border Container */}
          <div className={`relative rounded-2xl transition-all duration-500 ${isLoading ? 'p-[2px] bg-gradient-to-r from-yellow-500/50 via-purple-500/50 to-yellow-500/50 animate-gradient-xy' : 'p-[1px] bg-gradient-to-b from-gray-700 to-gray-900'}`}>
            
            <div className="relative bg-[#08080a] rounded-2xl overflow-hidden shadow-2xl">
              
              {/* Header of the Card (Top Bar) */}
              <div className="flex items-center justify-between px-4 py-2 bg-[#0d0d10] border-b border-gray-800">
                <div className="flex items-center gap-2">
                   <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                   </div>
                   <span className="ml-2 text-[10px] font-mono text-gray-600 uppercase tracking-wider">Input Terminal</span>
                </div>
                <div className="flex items-center gap-2">
                   {isLoading && <span className="text-[10px] font-mono text-yellow-500 animate-pulse">PROCESSING...</span>}
                </div>
              </div>

              {/* Main Input Area */}
              <div className="p-1">
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ведите команду генерации..."
                  className="w-full bg-[#050506] text-lg text-gray-200 placeholder-gray-700 outline-none resize-none min-h-[120px] p-5 font-light leading-relaxed rounded-xl focus:bg-[#08080a] transition-colors"
                  disabled={isLoading}
                  spellCheck={false}
                />
              </div>

              {/* Image Input Drawer */}
              {(showImageInput || (settings.imageInput && settings.imageInput.length > 0)) && (
                <div className="px-4 pb-2 animate-[fadeIn_0.3s_ease-out]">
                   <div className="flex items-start gap-4 p-3 rounded-lg border border-gray-800 bg-[#0c0c0e] relative group">
                      <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                      {settings.imageInput && (
                        <div className="relative h-12 w-12 shrink-0 rounded border border-gray-700 overflow-hidden bg-black">
                           <img 
                              src={settings.imageInput} 
                              alt="Ref" 
                              className="h-full w-full object-cover" 
                              onError={(e) => (e.currentTarget.style.display = 'none')}
                           />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase">Image Reference URL</label>
                        <input 
                           type="text"
                           value={settings.imageInput}
                           onChange={(e) => setSettings({...settings, imageInput: e.target.value})}
                           placeholder="https://..."
                           className="w-full bg-transparent border-b border-gray-700 py-1 text-sm text-yellow-500 focus:outline-none focus:border-yellow-500 transition-colors font-mono"
                        />
                      </div>
                      <button onClick={clearImageInput} className="text-gray-600 hover:text-white transition-colors">
                         <XMarkIcon className="h-4 w-4" />
                      </button>
                   </div>
                </div>
              )}

              {/* Control Bar (Bottom) */}
              <div className="px-4 py-4 bg-[#08080a] border-t border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
                
                {/* Settings Group */}
                <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-center sm:justify-start">
                   
                   {/* Ref Button */}
                   <button
                    onClick={() => setShowImageInput(!showImageInput)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs font-mono transition-all ${
                      showImageInput || settings.imageInput 
                      ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400' 
                      : 'bg-[#121214] border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-200'
                    }`}
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span className="uppercase tracking-wider">IMG REF</span>
                  </button>

                  <div className="h-8 w-px bg-gray-800 hidden sm:block"></div>

                  {/* Selectors */}
                  {[
                    { val: settings.aspectRatio, set: (v: any) => setSettings({...settings, aspectRatio: v}), opts: ASPECT_RATIOS },
                    { val: settings.resolution, set: (v: any) => setSettings({...settings, resolution: v}), opts: RESOLUTIONS },
                    { val: settings.format, set: (v: any) => setSettings({...settings, format: v}), opts: FORMATS }
                  ].map((ctrl, i) => (
                    <div key={i} className="relative group">
                      <select
                        value={ctrl.val}
                        onChange={(e) => ctrl.set(e.target.value)}
                        className="appearance-none bg-[#121214] text-gray-300 text-xs font-mono py-2 pl-3 pr-8 rounded-md border border-gray-800 hover:border-gray-600 focus:border-yellow-500/50 focus:outline-none transition-all cursor-pointer w-full sm:w-auto uppercase tracking-wide"
                        disabled={isLoading}
                      >
                        {ctrl.opts.map((opt: any) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600 group-hover:text-gray-400">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !prompt.trim()}
                  className={`
                    relative group overflow-hidden w-full sm:w-auto px-8 py-2.5 rounded-md font-bold text-sm tracking-widest uppercase transition-all duration-300
                    ${isLoading 
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' 
                      : 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] active:scale-95'}
                  `}
                >
                  <div className="relative z-10 flex items-center justify-center gap-2">
                     {isLoading ? <LoaderIcon className="h-4 w-4 animate-spin" /> : <SparklesIcon className="h-4 w-4" />}
                     <span>{isLoading ? 'Processing' : 'Generate'}</span>
                  </div>
                  {/* Button Shine Effect */}
                  {!isLoading && <div className="absolute inset-0 -translate-x-full group-hover:animate-shine bg-gradient-to-r from-transparent via-white/30 to-transparent z-0"></div>}
                </button>
              </div>
              
              {/* Progress Bar Line */}
              {isLoading && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gray-800 overflow-hidden">
                   <div className="h-full bg-yellow-500 animate-[loading_1.5s_ease-in-out_infinite] w-full origin-left scale-x-0"></div>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 animate-fadeIn backdrop-blur-sm">
              <AlertCircleIcon className="h-5 w-5 shrink-0 mt-0.5 text-red-400" />
              <div>
                <p className="font-mono text-xs uppercase text-red-400 mb-1">System Error</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Gallery / History */}
        {history.length > 0 && (
          <div className="flex-1 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex items-end justify-between mb-8 border-b border-gray-800 pb-2 px-2">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white tracking-wide">
                <HistoryIcon className="h-5 w-5 text-yellow-500" />
                OUTPUT LOG
              </h2>
              <span className="font-mono text-[10px] text-gray-500 bg-[#121214] border border-gray-800 px-2 py-1 rounded">
                BUFFER: {history.length}/{MAX_HISTORY}
              </span>
            </div>
            
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {history.map((image) => (
                <div key={image.id} className="animate-[slideUp_0.5s_ease-out_both] break-inside-avoid">
                   <ImageCard image={image} onDownload={handleDownload} />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {history.length === 0 && !isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center opacity-30 pointer-events-none mt-10">
            <div className="w-24 h-24 rounded-full border border-gray-700 flex items-center justify-center mb-6 animate-float">
               <div className="w-20 h-20 rounded-full border border-dashed border-gray-600 flex items-center justify-center">
                  <SparklesIcon className="h-8 w-8 text-gray-500" />
               </div>
            </div>
            <p className="text-gray-500 font-mono text-xs tracking-[0.2em] uppercase">Ready to Initialize</p>
          </div>
        )}

      </div>
      
      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full py-2 px-4 flex justify-between items-center pointer-events-none z-50 mix-blend-difference">
         <div className="text-[9px] font-mono text-gray-500">SYSTEM ID: NANO-BANANA-PRO</div>
         <div className="text-[9px] font-mono text-gray-500">V 3.0 STABLE</div>
      </footer>
    </div>
  );
};

export default App;