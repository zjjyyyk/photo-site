import { PhotoCategory, Photo, CreateCategoryData, UploadPhoto } from '../types';
import { photoDataManager } from '../data/photoDataManager';
import { apiService } from './apiService';

export interface PhotoMetadata {
  title: string;
  description: string;
  tags: string[];
  exif: {
    camera?: string;
    lens?: string;
    iso?: number;
    aperture?: string;
    shutterSpeed?: string;
    focalLength?: string;
    dateTaken?: string;
  };
}

class UploadService {
  // 创建新分类（使用真实文件存储）
  async createCategory(categoryData: CreateCategoryData): Promise<PhotoCategory> {
    console.log('🎯 创建分类:', categoryData);
    
    const newCategory = await apiService.createCategory({
      name: categoryData.name,
      nameEn: categoryData.nameEn,
      description: categoryData.description,
      sortWeight: categoryData.sortWeight,
      coverImage: categoryData.coverImage,
    });

    console.log('✅ 分类创建成功:', newCategory);
    
    // 更新缓存
    photoDataManager.addCategory(newCategory);
    
    if (newCategory.coverImage) {
      newCategory.coverImage = apiService.getImageUrl(newCategory.coverImage);
    }
    
    return newCategory;
  }

  // 上传照片到指定分类
  async uploadPhotos(
    categoryId: string, 
    photos: UploadPhoto[], 
    onProgress?: (progress: number) => void
  ): Promise<Photo[]> {
    console.log('📸 上传照片到分类:', categoryId, '文件数量:', photos.length);
    
    const files = photos.map(photo => photo.file);
    const metadata: Record<string, PhotoMetadata> = {};
    
    photos.forEach(photo => {
      const filename = photo.file.name;
      metadata[filename] = {
        title: photo.title || filename.replace(/\.[^/.]+$/, ""),
        description: photo.description || '',
        tags: photo.tags || [],
        exif: photo.exif || {},
      };
      
      console.log('准备上传照片元数据:', {
        filename,
        title: metadata[filename].title,
        exif: metadata[filename].exif
      });
    });
    
    const result = await apiService.uploadPhotos(categoryId, files, metadata);
    
    console.log('✅ 照片上传成功:', result);
    
    const uploadedPhotos = result.photos.map(photo => ({
      ...photo,
      url: apiService.getImageUrl(photo.url),
      thumbnailUrl: apiService.getImageUrl(photo.thumbnailUrl),
    }));
    
    photoDataManager.addPhotosToCategory(categoryId, uploadedPhotos);
    
    if (onProgress) {
      onProgress(100);
    }
    
    return uploadedPhotos;
  }

  // 获取所有分类
  async getCategories(): Promise<PhotoCategory[]> {
    return await photoDataManager.getAllCategories();
  }

  // 刷新分类数据
  async refreshCategories(): Promise<PhotoCategory[]> {
    return await photoDataManager.refreshCategories();
  }

  // 删除分类
  async deleteCategory(categoryId: string): Promise<void> {
    await apiService.deleteCategory(categoryId);
    await photoDataManager.refreshCategories();
  }
}

export const uploadService = new UploadService();
