import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import { DownloadIcon } from './Icons';

interface ImageCardProps {
  image: GeneratedImage;
  onDownload: (url: string, id: string) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, onDownload }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(image.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative rounded-xl bg-surface overflow-hidden border border-white/5 shadow-sm hover:shadow-xl transition-all duration-500">
      
      {/* Контейнер изображения */}
      <div className="relative overflow-hidden w-full bg-[#0a0a0c] cursor-pointer aspect-auto">
        <img
          src={image.url}
          alt={image.prompt}
          loading="lazy"
          className="w-full h-auto object-cover transition-transform duration-700 ease-in-out group-hover:scale-[1.02]"
        />
        
        {/* Бейджи */}
        {image.settings && (
           <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 translate-y-[-5px] group-hover:translate-y-0">
             <span className="px-2 py-1 rounded-md text-[10px] font-medium bg-black/60 backdrop-blur-md text-white border border-white/10">
               {image.settings.resolution}
             </span>
             <span className="px-2 py-1 rounded-md text-[10px] font-medium bg-black/60 backdrop-blur-md text-white border border-white/10">
               {image.settings.aspectRatio}
             </span>
           </div>
        )}
      </div>
      
      {/* Оверлей при наведении */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5">
        
        <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <div className="mb-4">
             <p className="text-[10px] text-primary font-medium tracking-wide uppercase mb-1.5 opacity-80">Запрос</p>
             <p 
               onClick={handleCopy}
               className="text-xs text-gray-200 line-clamp-3 leading-relaxed hover:text-white transition-colors cursor-pointer select-none"
               title="Нажмите, чтобы скопировать"
             >
               {image.prompt}
             </p>
             {copied && <span className="text-[10px] text-green-400 mt-2 flex items-center gap-1 animate-fade-in">✓ Скопировано</span>}
          </div>

          <div className="flex gap-2">
             <button
              onClick={() => onDownload(image.url, image.id)}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-white text-black hover:bg-gray-200 px-4 py-2.5 text-xs font-semibold transition-all active:scale-95"
            >
              <DownloadIcon className="h-4 w-4" />
              Скачать
            </button>
            <button 
               onClick={handleCopy}
               className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white backdrop-blur-sm transition-all"
               title="Копировать текст"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
               </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};