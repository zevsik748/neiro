import React, { useState, useEffect, useRef } from 'react';
import { ModelType, TaskStatusResponse } from '../types';
import { kieService } from '../services/kieService';

const POLL_INTERVAL = 3000; // 3 seconds

interface ImageGeneratorProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ apiKey, onApiKeyChange }) => {
  // Form State
  const [model, setModel] = useState<ModelType>(ModelType.TEXT_TO_IMAGE);
  const [prompt, setPrompt] = useState<string>('');
  const [imageUrls, setImageUrls] = useState<string>('');
  
  // Execution State
  const [loading, setLoading] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  // Refs for polling
  const pollingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) clearTimeout(pollingTimerRef.current);
    };
  }, []);

  const handlePoll = async (taskId: string) => {
    try {
      const statusData = await kieService.getTaskInfo(apiKey, taskId);
      const state = statusData.data.state;

      if (state === 'success') {
        setLoading(false);
        setStatusText('Генерация завершена!');
        // Result parsing logic: The n8n node suggests resultJson is returned. 
        // We will assume it's a URL or a JSON string containing a URL.
        const rawResult = statusData.data.resultJson;
        
        let finalImage = "";
        
        // Try to detect if it's a JSON string or a direct URL
        if (rawResult) {
            try {
                // Heuristic: check if it looks like JSON
                if (rawResult.trim().startsWith('{') || rawResult.trim().startsWith('[')) {
                    const parsed = JSON.parse(rawResult);
                     // Adapt to possible return shapes
                    if (Array.isArray(parsed) && parsed.length > 0) finalImage = parsed[0];
                    else if (parsed.url) finalImage = parsed.url;
                    else if (parsed.image_url) finalImage = parsed.image_url;
                    else if (parsed.images && parsed.images.length > 0) finalImage = parsed.images[0];
                    else finalImage = rawResult; // Fallback
                } else {
                    finalImage = rawResult;
                }
            } catch (e) {
                finalImage = rawResult;
            }
        }
        
        setResult(finalImage);
      } else if (state === 'failed') {
        setLoading(false);
        setError('Задача завершилась ошибкой на сервере.');
        setStatusText('Ошибка.');
      } else {
        // Still processing
        setStatusText(`Обработка... (${statusData.data.progress || '0'}%)`);
        pollingTimerRef.current = setTimeout(() => handlePoll(taskId), POLL_INTERVAL);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка опроса сервера');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      setError('Пожалуйста, введите ваш API ключ KIE.AI.');
      return;
    }
    if (!prompt) {
      setError('Пожалуйста, введите промпт.');
      return;
    }
    if (model === ModelType.IMAGE_TO_IMAGE && !imageUrls.trim()) {
      setError('Пожалуйста, укажите хотя бы одну ссылку на изображение для режима Image-to-Image.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setStatusText('Инициализация задачи...');
    setCurrentTaskId(null);

    try {
      // Parse image URLs if needed
      const imgUrlArray = imageUrls
        .split(',')
        .map((u) => u.trim())
        .filter((u) => u.length > 0);

      const resp = await kieService.createTask(apiKey, {
        model,
        callBackUrl: 'https://placeholder.com', // API requires it but we poll
        input: {
          prompt,
          image_urls: model === ModelType.IMAGE_TO_IMAGE ? imgUrlArray : [],
        },
      });

      if (resp.code === 200 && resp.data.taskId) {
        setCurrentTaskId(resp.data.taskId);
        setStatusText('Задача создана. Ожидание GPU...');
        // Start polling
        handlePoll(resp.data.taskId);
      } else {
        throw new Error(resp.msg || 'Не удалось создать задачу');
      }
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Произошла неизвестная ошибка');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* LEFT COLUMN: Controls */}
      <div className="space-y-6">
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-8 bg-banana-500 rounded-full"></span>
            Настройки
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* API KEY */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                API ключ KIE.AI
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                placeholder="Вставьте ваш API ключ здесь"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-banana-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* MODEL SELECTOR */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Модель генерации
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setModel(ModelType.TEXT_TO_IMAGE)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    model === ModelType.TEXT_TO_IMAGE
                      ? 'bg-banana-500 text-slate-900 shadow-lg shadow-banana-500/20'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Текст в изображение
                </button>
                <button
                  type="button"
                  onClick={() => setModel(ModelType.IMAGE_TO_IMAGE)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    model === ModelType.IMAGE_TO_IMAGE
                      ? 'bg-banana-500 text-slate-900 shadow-lg shadow-banana-500/20'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Картинка в картинку
                </button>
              </div>
            </div>

            {/* PROMPT */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Промпт
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Опишите желаемое изображение на английском языке (например: 'Cyberpunk warrior in neon city, close up')"
                rows={4}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-banana-500 focus:border-transparent outline-none transition-all resize-none"
              />
            </div>

            {/* IMAGE URLS (Conditional) */}
            {model === ModelType.IMAGE_TO_IMAGE && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Ссылки на исходные изображения
                </label>
                <textarea
                  value={imageUrls}
                  onChange={(e) => setImageUrls(e.target.value)}
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-banana-500 focus:border-transparent outline-none transition-all"
                />
                <p className="text-xs text-slate-500 mt-1">Разделяйте несколько ссылок запятыми.</p>
              </div>
            )}

            {/* ERROR MESSAGE */}
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading || !apiKey}
              className={`w-full py-3 rounded-lg font-bold text-lg transition-all transform active:scale-95 ${
                loading
                  ? 'bg-slate-600 cursor-not-allowed text-slate-400'
                  : !apiKey 
                    ? 'bg-slate-700 cursor-not-allowed text-slate-500'
                    : 'bg-gradient-to-r from-banana-500 to-orange-500 hover:from-banana-400 hover:to-orange-400 text-white shadow-lg shadow-banana-500/25'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Генерация...</span>
                </div>
              ) : (
                'Сгенерировать'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: Results */}
      <div className="space-y-6">
        <div className="bg-slate-800/50 h-full min-h-[500px] p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
            Результат
          </h2>

          <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center relative overflow-hidden group">
            
            {/* Empty State */}
            {!loading && !result && (
              <div className="text-center p-8">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-slate-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <p className="text-slate-500 max-w-xs mx-auto">
                  Настройте параметры и нажмите "Сгенерировать", чтобы увидеть магию.
                </p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="absolute inset-0 z-10 bg-slate-900/90 flex flex-col items-center justify-center p-8">
                <div className="relative w-24 h-24 mb-6">
                   <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-banana-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-lg font-medium text-banana-400 animate-pulse">{statusText}</p>
                <p className="text-sm text-slate-500 mt-2">Обычно это занимает 10-20 секунд.</p>
              </div>
            )}

            {/* Success State */}
            {result && !loading && (
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <img 
                  src={result} 
                  alt="Generated Result" 
                  className="max-w-full max-h-full object-contain"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                   <a 
                     href={result} 
                     target="_blank" 
                     rel="noreferrer"
                     className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/10"
                   >
                     Открыть оригинал
                   </a>
                   <a 
                     href={result} 
                     download="generated-image.png"
                     className="bg-banana-500 hover:bg-banana-400 text-slate-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                   >
                     Скачать
                   </a>
                </div>
              </div>
            )}
          </div>
          
          {/* Status Bar */}
          <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>Статус: {loading ? 'АКТИВНО' : result ? 'ЗАВЕРШЕНО' : 'ОЖИДАНИЕ'}</span>
            {currentTaskId && <span>ID: {currentTaskId.slice(0, 8)}...</span>}
          </div>
        </div>
      </div>
    </div>
  );
};