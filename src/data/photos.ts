import { PhotoCategory } from '../types';
import { apiService } from '../services/apiService';
// 导入本地用户分类数据
import userCategoriesData from './userCategories.json';

// 获取所有分类（仅用户创建的分类）
export const getAllCategories = async (): Promise<PhotoCategory[]> => {
  console.log('🔍 getAllCategories 被调用 - 优先使用本地文件数据');
  
  // 从本地JSON文件获取用户分类
  let userCategories: PhotoCategory[] = userCategoriesData.categories || [];
  console.log('📁 从本地文件加载了', userCategories.length, '个用户分类');
  
  // 如果本地文件为空，尝试从后端获取
  if (userCategories.length === 0) {
    try {
      console.log('📡 本地文件为空，尝试从后端API获取...');
      userCategories = await apiService.getCategories();
      console.log('✅ 从后端获取到用户分类:', userCategories.length, '个');
    } catch (error) {
      console.warn('❌ 后端也无法连接:', error);
    }
  }
  
  console.log('🎯 返回分类总数:', userCategories.length, '个用户分类');
  
  return userCategories;
};

// 空的分类数组（不再提供示例数据）
export const photoCategories: PhotoCategory[] = [];

export const getCategoryById = async (id: string): Promise<PhotoCategory | undefined> => {
  console.log('🔍 getCategoryById 被调用:', id);
  
  // 从本地JSON文件中查找用户分类
  const userCategories: PhotoCategory[] = userCategoriesData.categories || [];
  const found = userCategories.find((cat: PhotoCategory) => cat.id === id);
  if (found) {
    console.log('✅ 从本地文件找到用户分类:', found.name, '包含', found.photos?.length || 0, '张照片');
    return found;
  }
  
  // 尝试从后端获取
  try {
    console.log('📡 本地未找到，尝试从后端API获取分类:', id);
    const userCategory = await apiService.getCategoryById(id);
    if (userCategory) {
      console.log('✅ 从后端找到分类:', userCategory.name);
      return userCategory;
    }
  } catch (error) {
    console.warn('❌ 后端获取分类失败:', error);
  }
  
  console.log('❌ 未找到分类:', id);
  return undefined;
};

export const getPaginatedPhotos = async (categoryId: string, page: number = 1, itemsPerPage: number = 50) => {
  const category = await getCategoryById(categoryId);
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
