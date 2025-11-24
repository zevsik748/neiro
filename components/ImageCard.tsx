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
    <div className="group relative rounded-xl bg-[#0a0a0c] overflow-hidden border border-gray-800 hover:border-yellow-500/40 transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      
      {/* Image Container */}
      <div className="relative overflow-hidden w-full bg-gray-900 cursor-pointer">
        <img
          src={image.url}
          alt={image.prompt}
          loading="lazy"
          className="w-full h-auto object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
        />
        
        {/* Top Right Badges (Always visible but subtle, brighter on hover) */}
        {image.settings && (
           <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity duration-300 z-10">
             <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-black/60 backdrop-blur-md text-gray-300 border border-white/10 shadow-sm">
               {image.settings.resolution}
             </span>
             <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-black/60 backdrop-blur-md text-gray-300 border border-white/10 shadow-sm">
               {image.settings.aspectRatio}
             </span>
           </div>
        )}
      </div>
      
      {/* Overlay - Appears on Hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5">
        
        <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <div className="mb-3">
             <p className="text-[10px] text-yellow-500 font-mono uppercase tracking-wider mb-1">Prompt</p>
             <p 
               onClick={handleCopy}
               className="text-xs text-gray-300 line-clamp-3 font-light leading-relaxed cursor-copy hover:text-white transition-colors"
               title="Click to copy"
             >
               {image.prompt}
             </p>
             {copied && <span className="text-[9px] text-green-400 font-mono mt-1 block animate-fadeIn">COPIED TO CLIPBOARD</span>}
          </div>

          <div className="flex gap-2 mt-4">
             <button
              onClick={() => onDownload(image.url, image.id)}
              className="flex-1 flex items-center justify-center gap-2 rounded bg-white text-black hover:bg-yellow-400 px-3 py-2 text-xs font-bold uppercase tracking-wide transition-all active:scale-95"
            >
              <DownloadIcon className="h-3.5 w-3.5" />
              Download
            </button>
            <button 
               onClick={handleCopy}
               className="px-3 py-2 rounded bg-white/10 hover:bg-white/20 border border-white/10 text-white backdrop-blur-sm transition-all"
               title="Copy Prompt"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
               </svg>
            </button>
          </div>
        </div>

      </div>
      
      {/* Tech decoration lines */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
  );
};