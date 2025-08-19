import { PhotoCategory } from '../types';

// 生成示例照片数据的辅助函数
const generatePhotos = (categoryId: string, count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    url: `https://picsum.photos/800/600?random=${categoryId}-${index + 1}`,
    thumbnailUrl: `https://picsum.photos/400/300?random=${categoryId}-${index + 1}`,
    title: `${categoryId === 'landscape' ? '风景' : 
           categoryId === 'portrait' ? '人像' :
           categoryId === 'street' ? '街头' :
           categoryId === 'nature' ? '自然' :
           categoryId === 'architecture' ? '建筑' : '静物'}摄影 ${index + 1}`,
    description: `这是一张精美的${categoryId === 'landscape' ? '风景' : 
                 categoryId === 'portrait' ? '人像' :
                 categoryId === 'street' ? '街头' :
                 categoryId === 'nature' ? '自然' :
                 categoryId === 'architecture' ? '建筑' : '静物'}摄影作品`,
    tags: categoryId === 'landscape' ? ['山脉', '日出', '自然'] :
          categoryId === 'portrait' ? ['人像', '情感', '光影'] :
          categoryId === 'street' ? ['街头', '生活', '瞬间'] :
          categoryId === 'nature' ? ['野生动物', '生态', '自然'] :
          categoryId === 'architecture' ? ['建筑', '几何', '现代'] : 
          ['静物', '美学', '构图'],
    exif: {
      camera: 'Canon EOS R5',
      lens: '24-70mm f/2.8',
      iso: 100,
      aperture: 'f/5.6',
      shutterSpeed: '1/250s',
      focalLength: '50mm',
      dateTaken: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0]
    },
    width: 800,
    height: 600
  }));
};

export const photoCategories: PhotoCategory[] = [
  {
    id: 'landscape',
    name: '风景摄影',
    description: '大自然的壮美瞬间，记录山川湖海的永恒之美',
    coverImage: 'https://picsum.photos/600/400?random=landscape-cover',
    photos: generatePhotos('landscape', 73),
    totalCount: 73
  },
  {
    id: 'portrait',
    name: '人像写真',
    description: '捕捉人物的神韵与情感，展现独特的个性魅力',
    coverImage: 'https://picsum.photos/600/400?random=portrait-cover',
    photos: generatePhotos('portrait', 65),
    totalCount: 65
  },
  {
    id: 'street',
    name: '街头纪实',
    description: '记录城市生活的真实瞬间，展现人文关怀',
    coverImage: 'https://picsum.photos/600/400?random=street-cover',
    photos: generatePhotos('street', 82),
    totalCount: 82
  },
  {
    id: 'nature',
    name: '自然生态',
    description: '探索野生动植物的奇妙世界，感受生命力量',
    coverImage: 'https://picsum.photos/600/400?random=nature-cover',
    photos: generatePhotos('nature', 58),
    totalCount: 58
  },
  {
    id: 'architecture',
    name: '建筑艺术',
    description: '几何美学与空间艺术的完美结合',
    coverImage: 'https://picsum.photos/600/400?random=architecture-cover',
    photos: generatePhotos('architecture', 67),
    totalCount: 67
  },
  {
    id: 'stilllife',
    name: '静物美学',
    description: '日常物品的诗意表达，发现平凡中的不凡',
    coverImage: 'https://picsum.photos/600/400?random=stilllife-cover',
    photos: generatePhotos('stilllife', 44),
    totalCount: 44
  }
];

export const getCategoryById = (id: string) => {
  return photoCategories.find(category => category.id === id);
};

export const getPaginatedPhotos = (categoryId: string, page: number = 1, itemsPerPage: number = 50) => {
  const category = getCategoryById(categoryId);
  if (!category) return null;

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPhotos = category.photos.slice(startIndex, endIndex);

  return {
    photos: paginatedPhotos,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(category.photos.length / itemsPerPage),
      itemsPerPage,
      totalItems: category.photos.length
    }
  };
};
