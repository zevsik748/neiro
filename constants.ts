
export const APP_TITLE = 'Лучшие AI Инструменты';
export const MAX_HISTORY = 12;

export const TOOLS = [
  {
    id: 'nano-banana',
    name: 'Nano Banana Pro',
    description: 'Генерация изображений кинематографического качества 4K',
    icon: 'image',
    badge: 'POPULAR'
  },
  {
    id: 'sora-remover',
    name: 'Sora Watermark Remover',
    description: 'Удаление водяных знаков с видео Sora 2.0',
    icon: 'video',
    badge: 'NEW'
  }
];

export const ASPECT_RATIOS = [
  { value: '1:1', label: '1:1 (Квадрат)' },
  { value: '16:9', label: '16:9 (Пейзаж)' },
  { value: '9:16', label: '9:16 (Сторис)' },
  { value: '4:3', label: '4:3 (Фото)' },
  { value: '3:4', label: '3:4 (Портрет)' },
  { value: '21:9', label: '21:9 (Кино)' },
];

export const RESOLUTIONS = [
  { value: '1K', label: '1K (Стандартное)' },
  { value: '2K', label: '2K (Высокое)' },
  { value: '4K', label: '4K (Ультра)' },
];

export const FORMATS = [
  { value: 'png', label: 'PNG (Без потерь)' },
  { value: 'jpg', label: 'JPG (Компактный)' },
];

export const MODEL_INFO = {
  description: "Nano Banana Pro обеспечивает профессиональное качество генерации, высокую детализацию текстур и корректную работу с освещением.",
  features: [
    "Поддержка разрешений до 4K",
    "Кинематографичное качество",
    "Улучшенная анатомия и детализация"
  ]
};