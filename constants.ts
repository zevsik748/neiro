
export const MODEL_NAME = 'nano-banana-pro';
export const APP_TITLE = 'Nano Banana Pro';
export const MAX_HISTORY = 12;

export const ASPECT_RATIOS = [
  { value: '1:1', label: '1:1 (Квадрат)' },
  { value: '16:9', label: '16:9 (Пейзаж)' },
  { value: '9:16', label: '9:16 (История)' },
  { value: '4:3', label: '4:3 (Фото)' },
  { value: '3:4', label: '3:4 (Портрет)' },
  { value: '21:9', label: '21:9 (Кино)' },
];

export const RESOLUTIONS = [
  { value: '1K', label: '1K (Стандарт)' },
  { value: '2K', label: '2K (Высокое)' },
  { value: '4K', label: '4K (Ультра)' },
];

export const FORMATS = [
  { value: 'png', label: 'PNG' },
  { value: 'jpg', label: 'JPG' },
];

export const MODEL_INFO = {
  description: "Nano Banana Pro от Google DeepMind обеспечивает более четкие изображения в 2K, интеллектуальное масштабирование до 4K, улучшенный рендеринг текста и повышенную согласованность персонажей — предлагая значительный скачок в качестве визуализации для творческих задач и API-интеграций.",
  features: [
    "Поддержка разрешений до 4K (Intelligent Scaling)",
    "Широкий выбор соотношений сторон (включая 21:9)",
    "Улучшенная консистентность персонажей",
    "Фотореалистичность и кинематографичное качество",
    "Улучшенный рендеринг текста на изображениях"
  ]
};
