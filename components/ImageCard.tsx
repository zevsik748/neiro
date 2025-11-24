import React from 'react';
import { GeneratedImage } from '../types';
import { DownloadIcon } from './Icons';

interface ImageCardProps {
  image: GeneratedImage;
  onDownload: (url: string, id: string) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, onDownload }) => {
  return (
    <div className="group relative break-inside-avoid overflow-hidden rounded-2xl bg-[#0a0a0a] shadow-lg border border-gray-800 transition-all duration-300 hover:border-yellow-500/30 hover:shadow-yellow-500/10">
      <div className="aspect-square w-full overflow-hidden bg-gray-900 relative">
        <img
          src={image.url}
          alt={image.prompt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Badge Settings */}
        {image.settings && (
           <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur text-[10px] text-gray-300 border border-white/10">
               {image.settings.resolution}
             </span>
             <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur text-[10px] text-gray-300 border border-white/10">
               {image.settings.aspectRatio}
             </span>
           </div>
        )}
      </div>
      
      {/* Overlay content */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 transition-all duration-300 group-hover:opacity-100 flex flex-col justify-end p-5">
        <p className="text-xs text-gray-300 line-clamp-3 mb-4 font-light leading-relaxed">
          {image.prompt}
        </p>
        <button
          onClick={() => onDownload(image.url, image.id)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/20 active:scale-95"
        >
          <DownloadIcon className="h-3.5 w-3.5" />
          Скачать {image.settings?.format.toUpperCase()}
        </button>
      </div>
    </div>
  );
};
