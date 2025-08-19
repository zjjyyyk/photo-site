import { PhotoCategory } from '../types';
import { apiService } from '../services/apiService';

class PhotoDataManager {
  private static instance: PhotoDataManager;
  private categories: PhotoCategory[] = [];
  
  private constructor() {}
  
  static getInstance(): PhotoDataManager {
    if (!PhotoDataManager.instance) {
      PhotoDataManager.instance = new PhotoDataManager();
    }
    return PhotoDataManager.instance;
  }

  // 获取所有分类（仅从API获取）
  async getAllCategories(): Promise<PhotoCategory[]> {
    try {
      this.categories = await apiService.getCategories();
      return this.categories;
    } catch (error) {
      console.error('Error loading categories from API:', error);
      return [];
    }
  }

  // 同步获取缓存的分类数据
  getCachedCategories(): PhotoCategory[] {
    return this.categories;
  }

  // 根据ID获取分类
  getCategoryById(categoryId: string): PhotoCategory | null {
    console.log('getCategoryById called with:', categoryId);
    const categories = this.getCachedCategories();
    console.log('Available categories:', categories.map(c => c.id));
    const found = categories.find(cat => cat.id === categoryId) || null;
    console.log('Found category:', found?.name || 'null');
    return found;
  }

  // 获取分页照片数据
  getPaginatedPhotos(categoryId: string, page: number = 1, itemsPerPage: number = 50) {
    const category = this.getCategoryById(categoryId);
    if (!category) return null;

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const photos = category.photos.slice(startIndex, endIndex);

    return {
      photos,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(category.totalCount / itemsPerPage),
        itemsPerPage,
        totalItems: category.totalCount
      }
    };
  }

  // 刷新分类数据（重新从API获取）
  async refreshCategories(): Promise<PhotoCategory[]> {
    return await this.getAllCategories();
  }

  // 添加新分类（仅更新缓存，实际保存由API处理）
  addCategory(newCategory: PhotoCategory): void {
    this.categories.push(newCategory);
  }

  // 更新特定分类（仅更新缓存，实际保存由API处理）
  updateCategory(categoryId: string, updatedCategory: PhotoCategory): void {
    const index = this.categories.findIndex(cat => cat.id === categoryId);
    if (index !== -1) {
      this.categories[index] = updatedCategory;
    }
  }

  // 添加照片到指定分类（仅更新缓存，实际保存由API处理）
  addPhotosToCategory(categoryId: string, photos: any[]): void {
    const categoryIndex = this.categories.findIndex(cat => cat.id === categoryId);
    if (categoryIndex !== -1) {
      this.categories[categoryIndex].photos.push(...photos);
      this.categories[categoryIndex].totalCount = this.categories[categoryIndex].photos.length;
    }
  }
}

// 导出单例实例
export const photoDataManager = PhotoDataManager.getInstance();

// 兼容原有的导出方式
export const getCategoryById = (categoryId: string) => photoDataManager.getCategoryById(categoryId);
export const getPaginatedPhotos = (categoryId: string, page: number = 1, itemsPerPage: number = 50) => 
  photoDataManager.getPaginatedPhotos(categoryId, page, itemsPerPage);
